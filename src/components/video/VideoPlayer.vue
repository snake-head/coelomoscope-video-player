<template>
  <div>
    <div id="video-container">
      <VueDPlayer ref="dplayer" :options="options"></VueDPlayer>
    </div>
  </div>
</template>

<script>
import VueDPlayer from './private/VueDPlayer.vue'
import 'vue-dplayer/dist/vue-dplayer.css'
import dashjs from 'dashjs'
import axios from '@/utils/request/axios'


export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      required: true,
    },
    quality: {
      type: Array,
      default: []
    },
    defaultQuality: {
      type: Number,
      default: 0
    },
    phase: {
      type: Object,
      default: {}
    },
    videoId: {
      type: String,
      required: true,
    },
    triplet: {
      type: String,
      required: true,
    },
  },
  data() {
    const subtitle = this.triplet ? {
      url: this.triplet,
      type: 'webvtt',
      fontSize: '25px',
      bottom: '5%',
      color: '#b7daff',
    } : undefined;

    return {
      userWatchStats: {
        totalVideos: 0,
        totalDuration: 0,
        formattedDuration: '0秒',
        totalCompleted: 0
      },
      dplayer: null,
      dashPlayer: dashjs.MediaPlayer().create(),
      options: {
        video: {
          url: this.src,
          type: 'customDash',
          customType: {
            customDash: (video, player) => {
              this.dashPlayer.initialize(video, video.src, false);
            },
          },
          quality: this.quality.length > 0 ? this.quality.map(item => Object.assign({ type: 'customDash' }, item)) : undefined,
          defaultQuality: this.defaultQuality
        },
        highlight: this.phase,
        ...subtitle ? { subtitle } : {},  // 使用条件扩展来决定是否包含subtitle
      },
      isDehazed: false,
      isAiIdentify: false,
      baseQualityIndex: 0,
      currentPlaybackTime: 0,
      playCountRecorded: false,
      watchStartTime: 0,           // 开始观看的时间戳
      totalWatchDuration: 0,       // 累计观看时长(秒)
      watchTimeInterval: null,     // 定期发送观看时长的计时器
      lastReportedTime: 0,         // 上次报告的时间点
      isPlaying: false,            // 当前是否正在播放
      userWatchStats: null,        // 用户观看统计数据
    }
  },
  methods: {
    getOpenId() {
      const openid = localStorage.getItem('openid');
      return openid
    },
    switchHazeMode(requireDehaze) {
      this.isDehazed = Boolean(requireDehaze)
    },
    switchSmartAnnotationMode(requireSmartAnnotation) {
      this.isAiIdentify = Boolean(requireSmartAnnotation)
    },
    customInitDplayer() {
      this.dplayer = this.$refs.dplayer.dp;
      // 如果通过手动选择无缝切换去雾/不去雾
      // 则需要禁用dash协议根据网速自动切换的abr算法
      this.dashPlayer.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: { video: false },
          }
        }
      })
      // 修改一部分label文字
      this.dplayer.template.loop.querySelector('.dplayer-label').innerText = '循环播放';
      // 修改dp播放器默认的切换清晰度函数，使其调用dash切换接口
      const that = this;
      this.dplayer.switchQuality = function (index) {
        index = typeof index === 'string' ? parseInt(index) : index;
        if (this.qualityIndex === index || this.switchingQuality) {
          return;
        } else {
          this.qualityIndex = index;
        }
        this.quality = this.options.video.quality[index];
        this.template.qualityButton.innerHTML = this.quality.name;
        this.notice(''.concat(this.tran('switching-quality').replace('%q', this.quality.name)), undefined, undefined, 'switch-quality');

        that.getQualityIndex()
          .then(qualityIndex => that.baseQualityIndex = qualityIndex)
      }
      // 调整默认清晰度
      if (this.options.video.quality?.length > 0) {
        this.getQualityIndex()
          .then(qualityIndex => this.baseQualityIndex = qualityIndex)
          .then(() => this.dashPlayer.setQualityFor('video', this.bitrateIndex, true));
      }
    },
    async getQualityIndex() {
      const { height, width } = this.dplayer.quality.meta;
      await new Promise(resolve => {
        const intervalId = setInterval(() => {
          // this.dashPlayer.getBitrateInfoListFor("video")：当前获取到的有效视频总数
          if (this.dashPlayer.getBitrateInfoListFor("video")?.length > 0) {
            clearInterval(intervalId);
            resolve()
          }
        }, 50);
      })
      const targetBitrateList = this.dashPlayer.getBitrateInfoListFor("video").filter(e => e.height === height && e.width === width)
      if (!(targetBitrateList?.length > 0)) {
        this.dplayer.notice("切换清晰度失败");
        return 0;
      }
      return targetBitrateList[0].qualityIndex;
    },
    recordPlayCount() {
      const openid = this.getOpenId();

      // 使用查询参数传递 openid
      axios.post(`/data/video/record-view/?openid=${openid}`, {
        videoId: this.videoId,
        openid: openid
      }, {
        withCredentials: true
      }).then(response => {
        console.log('视频播放量统计成功');
      }).catch(error => {
        console.error('视频播放量统计失败:', error);
      });
    },
    // 增加日志并处理视频结束情况
    recordWatchTime(duration, isPlayEnded = false) {
      // 忽略10s内观看时间，视频结束时始终记录
      if (duration < 10 && !isPlayEnded) return;

      const openid = this.getOpenId();

      // 增加详细日志
      console.log(`记录观看数据 - 实际观看时长: ${Math.round(duration)}秒, 是否结束: ${isPlayEnded}`);

      axios.post(`/data/video/record-watch-time/?openid=${openid}`, {
        videoId: this.videoId,
        duration: Math.round(duration), // 实际观看时长
        isEnded: isPlayEnded,          // 标记是否观看结束
        openid: openid
      }, {
        withCredentials: true
      }).then(response => {
        console.log(`观看时长统计成功: ${Math.round(duration)}秒, 视频${isPlayEnded ? '已完成' : '进行中'}`);
        this.totalWatchDuration = 0; // 重置计时器
        this.lastReportedTime = this.currentPlaybackTime;

        // 记录成功后更新统计数据
        this.getUserWatchStats();
      }).catch(error => {
        console.error('观看时长统计失败:', error);

        // 视频结束标记，失败时添加重试逻辑
        if (isPlayEnded) {
          console.log('视频结束标记发送失败，将在1秒后重试...');
          setTimeout(() => {
            this.recordWatchTime(duration, true);
          }, 1000);
        }
      });
    },
    startWatchTimer() {
      this.watchStartTime = Date.now();
      this.isPlaying = true;

      // 每60秒报告一次观看时长
      this.watchTimeInterval = setInterval(() => {
        if (this.isPlaying) {
          const currentDuration = this.totalWatchDuration + (Date.now() - this.watchStartTime) / 1000;
          this.recordWatchTime(currentDuration);
          this.watchStartTime = Date.now(); // 重置开始时间
        }
      }, 60000); // 每分钟发送一次
    },
    // 计算准确的观看时长
    pauseWatchTimer() {
      if (this.isPlaying) {
        this.isPlaying = false;
        // 计算从开始到现在的实际观看时长
        this.totalWatchDuration += (Date.now() - this.watchStartTime) / 1000;
        console.log(`暂停，当前累计观看时长: ${this.totalWatchDuration.toFixed(1)}秒`);

        // 普通暂停时记录观看时长，不标记为结束
        this.recordWatchTime(this.totalWatchDuration);
        clearInterval(this.watchTimeInterval);
      }
    },
    // 获取用户观看统计数据
    async getUserWatchStats() {
      try {
        const openid = this.getOpenId();

        const response = await axios.get(`/user-info/?openid=${openid}`, {
          withCredentials: true
        });

        if (response.data && response.data.success) {
          const stats = response.data.data;
          console.log(`累计观看时长: ${this.formatDuration(stats.total_duration)}`);
          console.log(`完整观看视频数: ${stats.total_end}`);

          // 更新UI显示
          this.userWatchStats = {
            totalVideos: stats.total_videos,
            totalDuration: stats.total_duration,
            formattedDuration: this.formatDuration(stats.total_duration),
            totalCompleted: stats.total_completed
          };

          // 触发事件通知父组件
          this.$emit('watch-stats-updated', this.userWatchStats);
        }
      } catch (error) {
        console.error('获取观看统计失败:', error);
      }
    },

    // 格式化时长为更易读的格式
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      return `${hours > 0 ? hours + '小时' : ''}${minutes > 0 ? minutes + '分钟' : ''}${secs}秒`;
    },
  },
  computed: {
    bitrateIndex() {
      // return this.isDehazed ? this.baseQualityIndex + 1 : this.baseQualityIndex;
      if (this.isDehazed) {
        return this.baseQualityIndex + 1;
      }
      else if (this.isAiIdentify) {
        return this.baseQualityIndex + 3;
      }
      else {
        return this.baseQualityIndex;
      }
    }
  },
  watch: {
    bitrateIndex: {
      handler(newIndex) {
        this.dashPlayer.setQualityFor('video', newIndex, true);
      }
    }
  },
  mounted() {
    console.log(this.options)
    this.customInitDplayer()
    // 初始获取用户观看统计
    this.getUserWatchStats();
    this.$nextTick(() => {
      if (this.$refs.dplayer && this.$refs.dplayer.dp) {
        const player = this.$refs.dplayer.dp;

        // 记录播放进度
        player.on('timeupdate', () => {
          this.currentPlaybackTime = player.video.currentTime;
          this.$store.dispatch('updateVideoPlaybackTimes', { videoId: this.videoId, time: player.video.currentTime });
        });

        // 添加播放事件监听，用于统计播放量
        player.on('play', () => {
          // 避免重复统计
          if (!this.playCountRecorded) {
            this.recordPlayCount();
            this.playCountRecorded = true;
          }

          // 开始记录观看时长
          this.startWatchTimer();
        });

        // 添加暂停事件监听
        player.on('pause', () => {
          this.pauseWatchTimer();
        });

        // 增强 ended 事件处理
        player.on('ended', () => {
          console.log('视频播放完成，发送结束标记');

          // 暂停计时器
          this.pauseWatchTimer();

          // 获取准确的播放时长
          const actualDuration = this.totalWatchDuration;
          console.log(`视频总时长: ${player.video.duration}秒, 实际观看时长: ${actualDuration.toFixed(1)}秒`);

          // 发送结束标记，添加特殊的 updateEndStatus 参数
          axios.post(`/data/video/record-watch-time/?openid=${this.getOpenId()}`, {
            videoId: this.videoId,
            duration: Math.round(actualDuration),
            isEnded: true,                 // 明确标记为已结束
            forceUpdateEndStatus: true,    // 添加强制更新标记
            openid: this.getOpenId()
          }, {
            withCredentials: true
          }).then(response => {
            console.log('✅ 视频结束标记发送成功:', response.data);
            this.getUserWatchStats();
          }).catch(error => {
            console.error('❌ 视频结束标记发送失败:', error);
            // 失败重试
            setTimeout(() => {
              console.log('🔄 重试发送视频结束标记...');
              this.recordWatchTime(actualDuration, true);
            }, 2000);
          });
        });
      }
    });
  },
  beforeDestroy() {
    // 在组件销毁前记录最终观看时长
    if (this.isPlaying) {
      this.totalWatchDuration += (Date.now() - this.watchStartTime) / 1000;
      this.recordWatchTime(this.totalWatchDuration);
    }

    // 清除定时器
    if (this.watchTimeInterval) {
      clearInterval(this.watchTimeInterval);
    }

    this.dashPlayer?.destroy();
    this.dplayer?.destroy();
  },
  components: {
    VueDPlayer
  }
}
</script>

<style>
#video-container {
  width: 100%;
}
</style>
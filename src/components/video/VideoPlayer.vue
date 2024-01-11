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
  },
  data() {
    return {
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
          quality: this.quality.length > 0 ? this.quality?.map(item => Object.assign({ type: 'customDash' }, item)) : undefined,
          defaultQuality: this.defaultQuality
        },
        highlight: this.phase,
      },
      isDehazed: false,
      baseQualityIndex: 0,
      currentPlaybackTime: 0,
    }
  },
  methods: {
    switchHazeMode(requireDehaze) {
      this.isDehazed = Boolean(requireDehaze)
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
    }
  },
  computed: {
    bitrateIndex() {
      return this.isDehazed ? this.baseQualityIndex + 1 : this.baseQualityIndex;
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
    this.customInitDplayer()
    this.$nextTick(() => {
      if (this.$refs.dplayer && this.$refs.dplayer.dp) {
        const player = this.$refs.dplayer.dp;
        player.on('timeupdate', () => {
          this.currentPlaybackTime = player.video.currentTime;
          this.$store.dispatch('updateVideoPlaybackTimes', { videoId: this.videoId, time: player.video.currentTime });
        });
      }
    });
  },
  beforeDestroy() {
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
<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="3" :offset="3">
        <el-card class="left-menu">
          <template #header>
            <div class="left-card-header">
              <el-avatar size="large" :src="userInfo.avatar" />
              <div class="uname">{{ userInfo.uname }}</div>
              <div class="role">{{ userInfo.role }}</div>
            </div>
          </template>
          <el-menu :default-active="activeMenuIndex" :router="true">
            <el-menu-item index="/account/home">
              <template #title>
                <el-icon>
                  <HomeFilled />
                </el-icon>
                <span>首页</span>
              </template>
            </el-menu-item>
            <!-- <el-menu-item index="/account/userInfo">
              <el-icon>
                <User />
              </el-icon>
              <span>用户信息</span>
            </el-menu-item>
            <el-menu-item index="/account/append">
              <el-icon>
                <Document />
              </el-icon>
              <span>我的案例</span>
            </el-menu-item>
            <el-menu-item index="/account/like">
              <el-icon>
                <Star />
              </el-icon>
              <span>我的收藏</span>
            </el-menu-item> -->
            <el-menu-item index="/account/experience">
              <template #title>
                <el-icon>
                  <Document />
                </el-icon>
                <span>学习履历</span>
              </template>
            </el-menu-item>
            <!-- <el-menu-item index="/account/note">
              <el-icon>
                <Notebook />
              </el-icon>
              <span>我的笔记</span>
            </el-menu-item>
            <el-menu-item index="/account/question">
              <el-icon>
                <EditPen />
              </el-icon>
              <span>个人题库</span>
            </el-menu-item>
            <el-menu-item index="/account/setting">
              <el-icon>
                <Setting />
              </el-icon>
              <span>个人设置</span>
            </el-menu-item> -->
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="10">
        <slot name="main">
          <div class="main-content" style="margin: auto;">
            <h2 class="main-title">展示主体</h2>

            <!-- 用户数据概览 -->
            <el-card class="user-overview-card">
              <div class="user-overview">
                <h3>用户数据概览</h3>
                <p>完成视频数量：{{ completedCourses }}</p>
                <p>学习时长：{{ studyDuration }} </p>
                <p>已观看视频：{{ viewedVideos }}</p>
              </div>
            </el-card>

            <!-- 学习进度模块 -->
            <el-card class="user-overview-card">
              <h3>学习进度</h3>
              <el-progress :percentage="progressPercentage" />
              <p>已完成 {{ completedCourses }} 个视频</p>
              <p>进度：{{ progressPercentage }}%</p>
            </el-card>

            <!-- 图表展示用户学习趋势 -->
            <div class="learning-trend-chart">
              <el-card>
                <div id="trend-chart" ref="chartRef" style="height: 300px;"></div>
              </el-card>
            </div>
          </div>
        </slot>
      </el-col>

      <el-col :span="6">
        <!-- 最近观看 -->
        <el-card class="latest-visited-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="25">
                <Clock />
              </el-icon>
              <span class="card-header-text">最近观看</span>
            </div>
          </template>
          <div class="latest-visited">
            <!-- <div v-if="recentWatchedVideos.length > 0">
              <div v-for="video in recentWatchedVideos" :key="video.videoId" class="recent-video-item">
                <router-link :to="`/video/${video.videoId}/play`" class="recent-video-link">
                  <div class="recent-video-img">
                    <img :src="video.coverImgUrl || 'https://placeholder.com/150x80'" :alt="video.videoName" />
                  </div>
                  <div class="recent-video-info">
                    <p class="recent-video-name">{{ video.videoName }}</p>
                    <p class="recent-video-time">上次观看: {{ formatLastWatched(video.last_watched) }}</p>
                  </div>
                </router-link>
              </div>
            </div>
            <div v-else class="no-videos-message"> -->
            <div class="no-videos-message">
              <p>暂无观看记录</p>
            </div>
          </div>
        </el-card>

        <!-- 通知公告 -->
        <el-card class="notification-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <el-icon :size="25">
                <BellFilled />
              </el-icon>
              <span class="card-header-text">通知公告</span>
            </div>
          </template>
          <div class="notification" style="margin-top:auto">
            <h3>暂无通知</h3>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import * as echarts from "echarts";
import userInfo from '@/utils/userInfoDto.js';
import { useRouter, useRoute } from "vue-router";
import { getAllVideos } from "../../utils/request/video";
import axios from '@/utils/request/axios'
import { MagicString } from "vue/compiler-sfc";

defineProps({
  activeMenuIndex: {
    type: String,
    default: '/account/home'
  }
})

const router = useRouter();
const route = useRoute();
//最近观看视频
const recentWatchedVideos = ref([]);

// 获取最近观看视频
const fetchRecentWatchedVideos = async () => {
  try {
    const openid = getOpenId();
    if (!openid) {
      console.warn('未找到用户openid，无法获取最近观看视频');
      return;
    }

    console.log('开始获取最近观看视频，openid:', openid);

    const response = await axios.get(`/data/video/recent-watched/?openid=${openid}&limit=5`, {
      withCredentials: true
    });

    if (response.data && response.data.success) {
      let videos = response.data.data || response.data.code?.data || [];
      console.log('获取最近观看视频成功，原始数据:', videos);

      // 处理视频封面图片URL
      videos = videos.map(video => {
        if (video.coverImgUrl && !video.coverImgUrl.startsWith('http')) {
          // 视频封面url
          video.coverImgUrl = `https://omentor.vico-lab.com:3443/${video.coverImgUrl}`;
        }
        return video;
      });

      // 更新视频列表
      recentWatchedVideos.value = videos;
      console.log('处理后的视频数据:', videos);
    } else {
      console.error('获取最近观看视频失败:', response.data);
    }
  } catch (error) {
    console.error('获取最近观看视频出错:', error);
  }
};
// 格式化上次观看时间，强制调整时区差异
const formatLastWatched = (timestamp) => {
  if (!timestamp) return '未知时间';

  // 解析时间戳
  let date;
  if (typeof timestamp === 'string') {
    // 为避免时区问题，手动解析时间字符串
    const [datePart, timePart] = timestamp.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart ? timePart.split(':') : [0, 0, 0];

    // 使用 UTC 创建 Date 对象，避免浏览器自动应用本地时区
    date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 30) {
    return `${diffDays}天前`;
  } else {
    const utcYear = date.getUTCFullYear();
    const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(date.getUTCDate()).padStart(2, '0');
    return `${utcYear}-${utcMonth}-${utcDay}`;
  }
};
// 当路由发生变化时，重新加载内容
watch(route, (newRoute, oldRoute) => {
  if (newRoute.path !== oldRoute.path) {
    // 触发数据重新加载或执行任何需要的操作
    loadDataForCurrentRoute();
  }
});

// 模拟加载数据的函数
function loadDataForCurrentRoute() {
  // 根据当前的路由加载对应的数据
  console.log(`加载与路由 ${route.path} 相关的数据`);
}

// 初始化数据加载
onMounted(() => {
  loadDataForCurrentRoute();
});

// 假设的用户数据，全部预设为0
const completedCourses = ref(0); // 已完成的视频数量
const studyDuration = ref(0); // 学习时长
const viewedVideos = ref(0); // 最近观看的视频列表

const totalCourses = ref(0); // 视频总数量
const progressPercentage = ref(0); // 学习进度

// 获取视频总数
const fetchTotalVideos = () => {
  getAllVideos()
    .then(res => {
      if (res && res.data && res.data.results) {
        totalCourses.value = res.data.results.length;
        console.log('视频总数:', totalCourses.value);

        // 获取到视频总数后计算进度百分比
        if (totalCourses.value > 0) {
          progressPercentage.value = parseFloat(((completedCourses.value / totalCourses.value) * 100).toFixed(1));
        }
      } else {
        console.error('Unexpected response structure:', res);
      }
    })
    .catch(error => {
      console.error('Error fetching all videos:', error);
    });
};
// 获取最近5天的日期
const getRecentDays = () => {
  const days = [];
  const now = new Date();

  for (let i = 4; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const month = day.getMonth() + 1;
    const date = day.getDate();
    days.push(`${month}/${date}`);
  }

  return days;
};

watch([completedCourses, totalCourses], () => {
  if (totalCourses.value > 0) {
    progressPercentage.value = parseFloat(((completedCourses.value / totalCourses.value) * 100).toFixed(1));
  } else {
    progressPercentage.value = 0; // 防止除以零
  }
});

// 在组件挂载后获取视频总数
onMounted(() => {
  loadDataForCurrentRoute();
  fetchTotalVideos();   // 获取视频总数
  fetchUserWatchStats(); // 获取用户观看统计
  fetchRecentWatchedVideos(); // 获取最近观看视频
});
const chartRef = ref(null);

onMounted(() => {
  // 确保在 DOM 完全渲染后初始化数据
  nextTick(() => {
    loadDataForCurrentRoute();
    fetchTotalVideos();
    fetchUserWatchStats();

    // 获取每日观看数据以更新趋势图
    fetchDailyWatchStats();
  });
});
// 获取openID
const getOpenId = () => {
  return localStorage.getItem('openid') || '';
};

// 格式化时长为更易读的格式
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours > 0 ? hours + '小时' : ''}${minutes > 0 ? minutes + '分钟' : ''}${secs}秒`;
};

// 获取用户观看统计数据
const fetchUserWatchStats = async () => {
  try {
    const openid = getOpenId();
    const response = await axios.get(`/user-info/?openid=${openid}`, {
      withCredentials: true
    });

    if (response.data && response.data.success) {
      const stats = response.data.data;
      console.log('获取用户统计数据成功！');

      completedCourses.value = stats.total_end || 0;
      studyDuration.value = formatDuration(stats.total_duration);
      viewedVideos.value = stats.total_viewed || 0;

      // 重新计算进度
      if (totalCourses.value > 0) {
        progressPercentage.value = parseFloat(((completedCourses.value / totalCourses.value) * 100).toFixed(1));
      }
    } else {
      console.error('获取用户统计数据失败:', response.data);
    }
  } catch (error) {
    console.error('获取用户统计数据出错:', error);
  }
};

const fetchDailyWatchStats = async () => {
  try {
    const openid = getOpenId();
    if (!openid) {
      console.warn('未找到用户openid，将使用默认数据');
      initChartWithDefaultData();
      return;
    }

    console.log('开始获取每日观看统计，openid:', openid);

    // 获取最近5天的数据
    const response = await axios.get(`/data/video/daily-watch-stats/?openid=${openid}&days=5`, {
      withCredentials: true,
      timeout: 10000
    });

    console.log('API响应状态:', response.status);
    console.log('响应数据结构:', JSON.stringify(response.data).substring(0, 100) + '...');

    // 从响应中提取正确的数据路径
    if (response.data && response.data.success) {
      console.log('API返回成功标志');

      // 数据位于 response.data.code.data
      const dailyData = response.data.code?.data || [];

      // console.log('找到日常数据:', dailyData ? '是' : '否');
      // console.log('日常数据类型:', typeof dailyData);
      // console.log('日常数据是否为数组:', Array.isArray(dailyData));

      if (!dailyData || (Array.isArray(dailyData) && dailyData.length === 0)) {
        console.warn('API返回的daily data字段为空或长度为0');
        initChartWithDefaultData();
        return;
      }

      // 更新图表
      updateChartWithDailyData(dailyData);
    } else {
      console.error('获取每日观看统计失败:', response.data);
      initChartWithDefaultData();
    }
  } catch (error) {
    console.error('获取每日观看统计出错:', error.message || error);
    initChartWithDefaultData();
  }
};

const updateChartWithDailyData = (dailyData) => {
  // 输出日志，确认收到的数据
  console.log('收到的dailyData类型:', typeof dailyData);
  console.log('dailyData数据结构:', Array.isArray(dailyData) ? '数组' : typeof dailyData);

  // 处理字符串情况
  if (typeof dailyData === 'string') {
    try {
      dailyData = JSON.parse(dailyData);
      console.log('成功解析JSON字符串');
    } catch (e) {
      console.error('解析JSON字符串失败:', e);
      initChartWithDefaultData();
      return;
    }
  }

  // 确保数据可用
  if (!dailyData) {
    console.error('无有效数据');
    initChartWithDefaultData();
    return;
  }

  // 获取最近5天的日期标签
  const days = getRecentDays();
  // 准备数据数组
  const videoCounts = [];

  // 对每个日期，在API返回数据中查找对应的观看数
  days.forEach(dayLabel => {
    // 将 "4/2" 格式转换为 "2025-04-02" 格式
    const now = new Date();
    const year = now.getFullYear();
    const [month, day] = dayLabel.split('/');

    // 补全前导零
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');

    // 构建日期字符串，格式为 "2025-04-02"
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    // 默认值
    let count = 0;

    // 处理不同格式的数据
    if (Array.isArray(dailyData)) {
      // 在数组中查找匹配的日期数据
      const dayData = dailyData.find(item => item.date === dateStr);
      if (dayData) {
        count = dayData.videos_count || 0;
        console.log(`找到日期 ${dateStr} 数据:`, dayData);
      }
    } else if (typeof dailyData === 'object') {
      // 如果数据是对象，直接获取属性值
      if (dailyData[dateStr]) {
        count = typeof dailyData[dateStr] === 'object' ?
          dailyData[dateStr].videos_count :
          parseInt(dailyData[dateStr]) || 0;
      }
    }

    videoCounts.push(count);
  });

  console.log('处理后的视频数量数据:', videoCounts);
  console.log('日期标签:', days);

  // 更新图表
  nextTick(() => {
    if (chartRef.value) {
      const myChart = echarts.init(chartRef.value);
      const option = {
        title: {
          text: '学习趋势',
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} 个视频'
        },
        xAxis: {
          type: 'category',
          data: days
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          name: '观看视频数量'
        },
        series: [{
          name: '观看视频',
          type: 'line',
          data: videoCounts,
          itemStyle: {
            color: '#409EFF'
          },
          lineStyle: {
            width: 3
          },
          symbol: 'circle',
          symbolSize: 8
        }]
      };
      myChart.setOption(option);
      console.log('图表更新完成');
    } else {
      console.error('图表DOM元素未找到');
    }
  });
};

// 使用默认数据初始化图表
const initChartWithDefaultData = () => {
  nextTick(() => {
    if (chartRef.value) {
      const myChart = echarts.init(chartRef.value);
      const option = {
        title: {
          text: '学习趋势'
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: getRecentDays()
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '观看视频',
          type: 'line',
          data: [0, 0, 0, 0, 0] // 默认数据为0
        }]
      };
      myChart.setOption(option);
    }
  });
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.card-header {
  text-align: left;
  align-items: center;
  display: flex;
}

.card-header-text {
  margin: 8px;
}

:deep(.el-menu) {
  border: 0px;
}

:deep(.el-menu-item) {
  padding-left: 0 !important;
}

.uname {
  font-size: 16px;
}

.role {
  font-size: 12px;
  opacity: 0.5;
}

.main-title {
  margin-bottom: 60px;
}

.user-overview-card {
  margin-bottom: 40px;
}

.latest-visited {
  padding: 0 10px;
}

.recent-video-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.recent-video-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.recent-video-link {
  display: flex;
  text-decoration: none;
  color: inherit;
}

.recent-video-img {
  width: 120px;
  height: 70px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 4px;
}

.recent-video-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recent-video-name {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.recent-video-time {
  margin: 5px 0 0;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.no-videos-message {
  padding: 20px 0;
  text-align: center;
  color: #909399;
}
</style>
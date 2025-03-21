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
            <el-menu-item index="/account/userInfo">
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
            </el-menu-item>
            <el-menu-item index="/account/experience">
              <template #title>
                <el-icon>
                  <Document />
                </el-icon>
                <span>学习履历</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/account/note">
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
            </el-menu-item>
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
                <p>学习时长：{{ studyDuration }} 小时</p>
                <p>最近活动：观看了 {{ recentActivity }} 个视频</p>
              </div>
            </el-card>

            <!-- 学习进度模块 -->
            <el-card class="user-overview-card">
              <h3>学习进度</h3>
              <el-progress :percentage="progressPercentage" />
              <p>已观看 {{ completedCourses }} 个视频</p>
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
        <el-row>
          <el-col>
            <el-card class="latest-visited-card">
              <template #header>
                <div class="card-header">
                  <el-icon :size="25">
                    <Clock />
                  </el-icon>
                  <span class="card-header-text">最近观看</span>
                </div>
              </template>
              <div class="latest-visited" style="margin-top:auto">
                <h3>最近观看的视频</h3>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-card class="notification-card">
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

defineProps({
  activeMenuIndex: {
    type: String,
    default: '/account/home'
  }
})

const router = useRouter();
const route = useRoute();

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

// 假设的用户数据
const completedCourses = ref(22); // 已完成的视频数量
const studyDuration = ref(33);
const recentActivity = ref(8);

const totalCourses = ref(0); // 视频总数量,初始化为0
const progressPercentage = ref(0); // 初始化学习进度为0

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

const getRecentMonths = () => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${month.getMonth() + 1}月`);
  }

  return months;
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
  fetchTotalVideos(); // 调用获取视频总数的函数
});
const chartRef = ref(null);

// 初始化学习趋势图的逻辑可以在这里添加

onMounted(() => {
  // 确保在 DOM 完全渲染后初始化 ECharts
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
          data: getRecentMonths()  // 动态生成月份
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '学习时长',
          type: 'line',
          data: [3, 5, 6, 4, 8, 7]
        }]
      };
      myChart.setOption(option);
    } else {
      console.error("chartRef is not available");
    }
  });
});
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
</style>
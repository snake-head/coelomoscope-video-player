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
                <p>完成课程数量：{{ completedCourses }}</p>
                <p>学习时长：{{ studyDuration }} 小时</p>
                <p>最近活动：{{ recentActivity }}</p>
              </div>
            </el-card>

            <!-- 学习进度模块 -->
            <el-card class="user-overview-card">
              <h3>学习进度</h3>
              <el-progress :percentage="progressPercentage" />
              <p>已完成 {{ studycourses }} 课程</p>
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
const completedCourses = ref(7);
const studyDuration = ref(12);
const recentActivity = ref("完成了 7 个课程");

const totalCourses = ref(10); // 假设总课程数量为10
const studycourses = ref(7); //假设已学习课程数量为6
const progressPercentage = ref(0); // 初始化为0

watch([studycourses, totalCourses], () => {
  if (totalCourses.value > 0) {
    progressPercentage.value = (studycourses.value / totalCourses.value) * 100;
  } else {
    progressPercentage.value = 0; // 防止除以零
  }
});

// 在组件挂载后计算一次
onMounted(() => {
  if (totalCourses.value > 0) {
    progressPercentage.value = (studycourses.value / totalCourses.value) * 100;
  }
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
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '学习时长',
          type: 'line',
          data: [12, 15, 10, 20, 35, 25]
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
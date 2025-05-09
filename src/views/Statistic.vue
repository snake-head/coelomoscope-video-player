<template>
  <div class="page-container" @click.stop>
    <h2>数据统计</h2>
    <div class="charts-container">
      <div class="chart-wrapper">
        <h3 class="chart-title">视频访问量统计</h3>
        <div ref="pieChart" class="chart-container"></div>
        <div class="total-views">
          <h4>总视频访问量：{{ totalVideoViews }}</h4>
        </div>
      </div>
      <div class="chart-wrapper">
        <h3 class="chart-title">访问量统计</h3>
        <div ref="lineChart" class="chart-container line-chart-container"></div>
      </div>
    </div>
    <div class="charts-container">
      <div class="chart-wrapper">
        <h3 class="chart-title">用户活跃时间段</h3>
        <div ref="barChart" class="chart-container"></div>
      </div>
      <div class="chart-wrapper">
        <h3 class="chart-title">用户设备统计</h3>
        <div ref="deviceChart" class="chart-container"></div>
      </div>
    </div>

    <!-- reCAPTCHA 组件 -->
    <el-dialog v-model="captchaVisible" width="900px" :modal="true" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-header="false" :show-close="false" :custom-class="'captcha-dialog'">
      <Recaptcha @submit="handleSubmit" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import * as echarts from 'echarts';
import Recaptcha from '../components/global/Recaptcha.vue';
import { ElMessage } from 'element-plus';

const pieChart = ref(null);
const lineChart = ref(null);
const barChart = ref(null);
const deviceChart = ref(null);

const videoData = ref([
  { name: '前列腺根治术', value: 154 },
  { name: '肺叶段切除', value: 280 },
  { name: '肾上腺切除', value: 370 },
  { name: '肾部分切除', value: 150 },
  { name: '胆囊切除术', value: 80 },
  { name: '肾根治性切除术', value: 70 },
  { name: '交感神经切断术', value: 15 },
  { name: '肝切除术', value: 87 },
  { name: '胰十二指肠切除术', value: 120 },
]);

const totalVideoViews = computed(() => {
  return videoData.value.reduce((total, video) => total + video.value, 0);
});

const getLastSevenDays = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const lineChartData = ref({
  dates: getLastSevenDays(),
  views: [150, 230, 274, 218, 115, 180, 210]
});

const barChartData = ref({
  hours: ['0-6时', '6-12时', '12-18时', '18-24时'],
  activeUsers: [12, 66, 62, 95]
});

const deviceData = ref([
  { name: '手机', value: 60 },
  { name: '平板', value: 18 },
  { name: '电脑', value: 78 }
]);

const captchaVisible = ref(true); // 控制 reCAPTCHA 对话框的显示

const handleSubmit = (result) => {
  // 处理新格式的事件参数
  if (typeof result === 'object' && result !== null) {
    if (result.success || result.action === 'userClose') {
      captchaVisible.value = false;

      if (result.success) {
        ElMessage.success('验证成功，欢迎查看统计数据');
      }
    }
  }
  // 兼容旧格式
  else if (result === true) {
    captchaVisible.value = false;
    ElMessage.success('验证成功，欢迎查看统计数据');
  }
};

onMounted(() => {
  console.log('sss');
  // 初始化饼图
  const pieChartInstance = echarts.init(pieChart.value);
  pieChartInstance.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '访问量',
        type: 'pie',
        radius: '50%',
        data: videoData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });

  // 初始化折线图
  const lineChartInstance = echarts.init(lineChart.value);
  lineChartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: lineChartData.value.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        data: lineChartData.value.views
      }
    ]
  });

  // 初始化柱状图
  const barChartInstance = echarts.init(barChart.value);
  barChartInstance.setOption({

    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: barChartData.value.hours
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '活跃用户数',
        type: 'bar',
        data: barChartData.value.activeUsers
      }
    ]
  });

  // 初始化设备统计饼图
  const deviceChartInstance = echarts.init(deviceChart.value);
  deviceChartInstance.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: '50%',
        data: deviceData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });
});
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.chart-wrapper {
  width: 45%;
  margin-bottom: 20px;
}

.chart-title {
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.line-chart-container {
  height: 300px;
}

.total-views {
  text-align: center;
  margin-top: 10px;
}

/* 覆盖默认的 el-dialog 样式 */
:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}

:deep(.captcha-dialog .el-dialog__body) {
  padding: 0;
  width: 100%;
}

/* 确保 el-dialog 居中显示 */
:deep(.el-overlay) {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
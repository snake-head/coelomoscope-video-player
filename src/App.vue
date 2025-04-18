<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Recaptcha from "@/components/global/Recaptcha.vue";
import { recaptchaManager, initRecaptchaTimer } from "@/utils/recapchamanage.js";
import { ElDialog } from "element-plus"; // 确保导入ElDialog组件

const showRecaptcha = recaptchaManager.showRecaptcha;
const rapidNavigationDetected = ref(false);

// 处理验证结果
const handleRecaptchaSubmit = (result) => {
  console.log('App收到验证结果:', result);
  recaptchaManager.handleRecaptchaResult(result);
};

onMounted(() => {
  // 初始化验证码定时器
  initRecaptchaTimer();

  // 检查是否需要显示验证码
  const lastCheck = localStorage.getItem('lastRecaptchaCheck');
  const now = Date.now();

  // 最多30秒检查一次，避免频繁检查
  if (!lastCheck || (now - parseInt(lastCheck)) > 30 * 1000) {
    localStorage.setItem('lastRecaptchaCheck', now.toString());

    // 页面加载时检查快速导航
    recaptchaManager.checkRapidNavigation();
  }

  // 检查是否是登录后的首次访问
  const isFirstVisitAfterLogin = sessionStorage.getItem('isFirstLogin');
  if (isFirstVisitAfterLogin === 'true') {
    // 重置标记
    sessionStorage.removeItem('isFirstLogin');
    // 显示验证码
    console.log('首次登录，显示验证码');
    recaptchaManager.triggerRecaptcha();
  }
});

// 监听验证码显示状态
watch(showRecaptcha, (newValue) => {
  if (newValue) {
    // 检查是否是因为快速导航触发的
    const now = Date.now();
    const lastRecaptchaTime = localStorage.getItem('lastRecaptchaTime');

    if (lastRecaptchaTime && (now - parseInt(lastRecaptchaTime) < 20 * 60 * 1000)) {
      // 如果上次验证时间在20分钟内，可能是快速导航触发的
      rapidNavigationDetected.value = true;
    } else {
      rapidNavigationDetected.value = false;
    }
  }
});
</script>

<script>
export default {
  beforeRouteEnter(to, from) {
    // TODO 此处做登录校验
    return true;
  }
}
</script>

<template>
  <router-view></router-view>

  <!-- 使用v-if确保每次都创建新的组件实例 -->
  <el-dialog v-model="showRecaptcha" width="900px" :modal="true" :close-on-click-modal="false"
    :close-on-press-escape="false" :show-header="false" :show-close="false" :custom-class="'captcha-dialog'">
    <div v-if="rapidNavigationDetected" class="rapid-navigation-warning">
      检测到快速页面切换，请完成验证以继续
    </div>
    <Recaptcha v-if="showRecaptcha" @submit="handleRecaptchaSubmit" />
  </el-dialog>
</template>

<style scoped>
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

:deep(.el-overlay) {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 添加样式 */
.rapid-navigation-warning {
  color: #E6A23C;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #FDF6EC;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}
</style>

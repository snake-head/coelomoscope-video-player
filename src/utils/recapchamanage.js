import { ref } from 'vue';

// 全局状态变量
const showRecaptcha = ref(false);
const RECAPTCHA_INTERVAL = 20 * 60 * 1000; // 20分钟间隔
const RAPID_NAVIGATION_THRESHOLD = 10 * 1000; // 10秒阈值
const PAGES_COUNT_THRESHOLD = 4; // 页面数量阈值

// 导航挂起功能
let pendingNavigation = null;
let resolveCallback = null;

// localStorage 存储导航历史
const getNavigationHistory = () => {
  try {
    const saved = localStorage.getItem('navigationHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('读取导航历史失败:', e);
    return [];
  }
};

const saveNavigationHistory = (history) => {
  try {
    localStorage.setItem('navigationHistory', JSON.stringify(history));
  } catch (e) {
    console.error('保存导航历史失败:', e);
  }
};

const recaptchaManager = {
  // 当前是否显示验证码
  showRecaptcha,

  // 获取挂起的导航
  getPendingNavigation() {
    return pendingNavigation;
  },

  // 设置挂起的导航
  setPendingNavigation(url) {
    pendingNavigation = url;
  },

  // 清除挂起的导航
  clearPendingNavigation() {
    pendingNavigation = null;
  },

  // 记录页面导航 - 确保接收并处理 fullPath
  recordNavigation(fullPath) {
    const now = Date.now();
    const history = getNavigationHistory();

    history.push({
      path: fullPath, // 存储 fullPath
      timestamp: now
    });

    // 只保留最近的记录
    if (history.length > 10) {
      history.shift();
    }

    saveNavigationHistory(history);
    console.log('记录导航 (持久化):', fullPath); // 记录 fullPath

    // 将 fullPath 传递给 checkRapidNavigation
    return this.checkRapidNavigation(fullPath); // 返回检查结果
  },

  // 检查快速导航 - 确保接收并传递 fullPath
  checkRapidNavigation(targetFullPath = null) {
    const now = Date.now();
    const history = getNavigationHistory();

    // 获取最近10秒内的导航记录
    const recentNavigations = history.filter(
      nav => now - nav.timestamp < RAPID_NAVIGATION_THRESHOLD
    );

    // 获取不同的页面路径 (这里仍然可以用 path 部分比较，或者用 fullPath 比较，取决于需求)
    // 使用 fullPath 比较更精确，避免 /a 和 /a?b 被视为同一个页面
    const uniquePaths = new Set(recentNavigations.map(nav => nav.path)); // 使用存储的 fullPath

    console.log(`最近${RAPID_NAVIGATION_THRESHOLD / 1000}秒内访问了${uniquePaths.size}个不同页面`);

    // 如果10秒内访问了5个或更多不同页面，触发验证
    if (uniquePaths.size >= PAGES_COUNT_THRESHOLD) {
      console.log('检测到快速页面切换，触发验证码');

      // 如果提供了目标路径，记录为挂起的导航 (使用 fullPath)
      if (targetFullPath) {
        this.setPendingNavigation(targetFullPath); // 存储 targetFullPath
        console.log('挂起导航:', targetFullPath);
      }

      this.triggerRecaptcha();
      saveNavigationHistory([]); // 清空历史记录

      return true; // 需要验证
    }

    return false; // 不需要验证
  },

  // 检查是否需要显示验证码
  checkAndShowRecaptcha() {
    const lastRecaptchaTime = localStorage.getItem('lastRecaptchaTime');
    const currentTime = Date.now();

    // 如果没有记录或者已经过了至少20分钟
    if (!lastRecaptchaTime || (currentTime - parseInt(lastRecaptchaTime)) > RECAPTCHA_INTERVAL) {
      this.triggerRecaptcha();
      return true;
    }
    return false;
  },

  // 强制显示验证码
  triggerRecaptcha() {
    showRecaptcha.value = true;
    return new Promise(resolve => {
      resolveCallback = resolve;
    });
  },

  // 处理验证结果
  handleRecaptchaResult(result) {
    console.log('验证码结果处理:', result);

    // 只要提交了结果，就更新最后验证时间戳
    localStorage.setItem('lastRecaptchaTime', Date.now().toString());

    // 验证成功时，处理挂起的导航
    if (result && result.action === 'verify' && result.success) {
      // 如果有挂起的导航且验证成功，执行导航
      const pendingUrl = this.getPendingNavigation();
      if (pendingUrl) {
        console.log('验证成功，继续挂起的导航:', pendingUrl);
        setTimeout(() => {
          window.location.href = pendingUrl;
        }, 100);
        this.clearPendingNavigation();
      }
    }

    // 关闭验证码弹窗
    // 确保 result 存在才关闭，避免意外关闭
    if (result) {
      showRecaptcha.value = false;
    }

    // 处理 Promise 回调
    if (resolveCallback) {
      console.log('调用回调函数');
      resolveCallback(result);
      resolveCallback = null;
    }
  },

  // 重置验证时间（用于开发测试）
  resetTimer() {
    localStorage.removeItem('lastRecaptchaTime');
  },

  // 清空导航历史
  clearNavigationHistory() {
    saveNavigationHistory([]);
  }
};

// 初始化定时器
function initRecaptchaTimer() {
  // 定期检查是否需要显示验证码
  setInterval(() => {
    recaptchaManager.checkAndShowRecaptcha();
  }, RECAPTCHA_INTERVAL);
}

// 添加自动检测
window.addEventListener('load', () => {
  // 页面加载时检查一次
  recaptchaManager.checkRapidNavigation();
});

export { recaptchaManager, initRecaptchaTimer };
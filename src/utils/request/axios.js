import Axios from 'axios'
import {
  ElMessage
} from 'element-plus'
const baseURL = "https://omentor.medevice.pro/api/v1/"
// const baseURL = "http://localhost:8000/api/v1" // 本地测试用

const axios = Axios.create({
  baseURL,
  timeout: 20000 // 请求超时 20s
})
// 为每个请求添加重试信息
axios.interceptors.request.use(request => {
  // 初始化重试计数
  request.retryCount = 0;
  return request;
});
// 前置拦截器（发起请求之前的拦截）
axios.interceptors.request.use(
  (request) => {

    // 去除URL中可能存在的重复斜杠（如 // 或 ///）
    const urlParts = request.url.split('?');
    const path = urlParts[0];
    const query = urlParts.length > 1 ? `?${urlParts[1]}` : '';

    // 清理路径中的重复斜杠
    const cleanPath = path.replace(/\/+/g, '/');

    // 确保路径以单个斜杠结尾（如果不是查询参数开始）
    if (!cleanPath.endsWith('/')) {
      request.url = `${cleanPath}/${query}`;
    } else {
      request.url = cleanPath + query;
    }

    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 后置拦截器（获取到响应时的拦截）
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config } = error;

    // 如果没有config，说明是取消请求或其他非标准错误
    if (!config) {
      console.error(`[Axios Error] 非标准错误:`, error);
      return Promise.reject(error);
    }

    // 检查是否需要重试
    const shouldRetry = error.response && error.response.status === 503;
    const canRetry = config.retryCount < 3; // 减少最大重试次数

    if (shouldRetry && canRetry) {
      config.retryCount++;

      // 计算延迟时间
      const retryDelay = config.retryCount * 1000;
      console.log(`服务器暂时不可用 (503),${retryDelay}ms后进行第 ${config.retryCount} 次重试...`);

      // 存储原始URL用于日志
      const originalUrl = config.url;

      // 在重试前清理URL中可能的重复斜杠
      const urlParts = config.url.split('?');
      const path = urlParts[0];
      const query = urlParts.length > 1 ? `?${urlParts[1]}` : '';
      config.url = path.replace(/\/+/g, '/');
      if (!config.url.endsWith('/')) {
        config.url += '/';
      }
      config.url += query;

      // 延迟指定时间
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // 重新发送请求，并添加成功反馈
      try {
        const response = await axios(config);
        console.log(`✅ 第${config.retryCount}次重试成功! URL: ${config.url}`);

        // 可选：添加更详细的成功信息
        if (response.status === 200) {
          console.log(`数据获取成功: 状态=${response.status}`);
        }

        // 返回响应对象
        return response;
      } catch (retryError) {
        console.warn(`❌ 第${config.retryCount}次重试失败! URL: ${config.url}`);
        throw retryError; // 重新抛出错误继续处理
      }
    }

    // 特殊处理503错误
    if (error.response && error.response.status === 503) {
      console.warn('服务器暂时不可用 (503)，已尝试重试但仍然失败');
    }

    // 记录错误日志
    if (error.response && error.response.data) {
      const code = error.response.status;
      const msg = error.response.data.message;
      console.error(`[Axios Error] Code: ${code}, Message: ${msg}`);
      console.error(`Response:`, error.response);
    } else {
      console.error(`[Axios Error] ${error}`);
    }

    return Promise.reject(error);
  }
)

export default axios
<template>
  <div class="feedback-container">
    <h2>建议反馈</h2>
    <el-form :model="feedbackForm" label-width="120px">
      <el-form-item label="您的建议">
        <el-input type="textarea" v-model="feedbackForm.suggestion" placeholder="请在此处输入您的建议" :rows="15"></el-input>
      </el-form-item>
      <el-form-item label="联系方式(可选)">
        <el-input v-model="feedbackForm.contact" placeholder="邮箱/电话"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitFeedback" style="display: block; margin: auto;">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from '../../utils/request/axios'

const feedbackForm = reactive({
  suggestion: '',
  contact: ''
});

const submitFeedback = async () => {
  const openid = localStorage.openid || '';

  try {
    const response = await axios({
      url: `suggestion?openid=${encodeURIComponent(openid)}`, // 通过 URL 参数传递 openid
      method: 'POST',
      data: {
        suggestion: feedbackForm.suggestion,
        contact: feedbackForm.contact
      }
    });

    // 读取响应数据
    console.log('响应数据:', response.data);

    ElMessage({
      message: '感谢您的反馈！',
      type: 'success',
    });

    feedbackForm.suggestion = '';
    feedbackForm.contact = '';
  } catch (error) {
    console.error('提交反馈失败:', error);

    // 尝试从错误响应中获取更具体的错误信息
    const errorMsg = error.response?.data?.message || '提交反馈失败，请稍后再试！';
    ElMessage.error(errorMsg);
  }
};
</script>

<style scoped>
.feedback-container {
  max-width: 1200px;
  height: auto;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
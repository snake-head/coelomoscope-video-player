<template>
  <div class="recaptcha-container">
    <div class="recaptcha-box">
      <div class="recaptcha-header">{{ '请选择下列一张虚假的图片（点击图片可放大）：' }}</div>
      <div class="image-grid">
        <div v-for="(image, index) in images" :key="image.id" class="image-item" :class="[
          selectedImages.includes(index) ? 'selected' : '',
          selectedClass[index]
        ]">
          <img :src="image.src" alt="验证图片" @click.stop="enlargeImage(image.src)" @error="handleImageError(index)">
          <div class="selection-indicator" @click.stop="toggleImage(index)"></div>
        </div>
      </div>

      <div class="reason-selector" v-if="selectedImages.length > 0 && !isVerified">
        <p class="reason-title">请选择您认为这是虚假图片的原因：</p>
        <el-checkbox-group v-model="selectedReason" size="large">
          <el-checkbox v-for="option in reasonOptions" :key="option.value" :label="option.value">
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="button-group">
        <el-button @click="refreshImages" :loading="isLoading" v-if="!isVerified">
          <el-icon>
            <Refresh />
          </el-icon>
        </el-button>
        <el-button type="primary" @click="verifySelection"
          :disabled="selectedImages.length === 0 || !selectedReason || isLoading" v-if="!isVerified">
          提交
        </el-button>
        <el-button type="warning" @click="resetVerification" v-if="isVerified && showCloseButton">
          重试
        </el-button>
        <el-button type="danger" @click="closeDialog" v-if="isVerified && showCloseButton">
          关闭
        </el-button>
      </div>
    </div>

    <!-- 独立的放大图片Modal，不受外层影响 -->
    <div class="image-viewer-overlay" v-if="dialogVisible" @click="dialogVisible = false">
      <div class="image-viewer-container" @click.stop @wheel.prevent="handleWheel">
        <img :src="enlargedImageSrc" alt="放大图片" class="enlarged-image"
          :style="{ width: `${imageSize}px`, height: 'auto' }">
        <div class="zoom-controls">
          <span>尺寸: {{ imageSize }}px</span>
          <el-button-group>
            <el-button size="small" @click="adjustSize(-50)">缩小</el-button>
            <el-button size="small" @click="resetSize">重置</el-button>
            <el-button size="small" @click="adjustSize(50)">放大</el-button>
          </el-button-group>
        </div>
        <el-button class="close-button" @click="dialogVisible = false" circle>
          <el-icon>
            <Close />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { ElMessage, ElIcon, ElButton, ElButtonGroup, ElRadioGroup, ElRadio } from 'element-plus';
import { Refresh, Close } from '@element-plus/icons-vue';
import axios from '@/utils/request/axios';

const emit = defineEmits(['submit']);
const message = ref('');
const images = ref([]);
const selectedImages = ref([]);
const dialogVisible = ref(false);
const enlargedImageSrc = ref('');
const imageSize = ref(800); // 初始图片尺寸
const isLoading = ref(false); // 添加加载状态
const selectedClass = ref(Array(6).fill('')); // 假设最多6张图片
const isVerified = ref(false);  // 是否已经验证过
const showCloseButton = ref(false); // 是否显示关闭按钮
const selectedReason = ref([]); // 存储用户选择的理由

const reasonOptions = [
  { value: '1', label: '画面色彩失真' },
  { value: '2', label: '解剖结构错误' },
  { value: '3', label: '器械形状错误' },
  { value: '4', label: '器官质地不真实' }
];

const closeDialog = () => {
  console.log('用户主动关闭对话框');
  isVerified.value = false;
  showCloseButton.value = false;
  emit('submit', { success: false, action: 'userClose' });
};

// 修改 getCaptchaImages 函数
const getCaptchaImages = async () => {
  try {
    isLoading.value = true;
    selectedImages.value = []; // 清空已选图片

    const response = await axios.get('/recaptcha/get/', {
      withCredentials: true
    });

    if (response.data.success) {
      images.value = response.data.data.images;
      message.value = response.data.message;
      console.log('成功加载验证码图片:', images.value.length);

      // 图片预加载逻辑
      if (images.value && images.value.length > 0) {
        preloadImages(images.value);
      }
    } else {
      console.error('获取验证码失败:', response.data.message);
      ElMessage.error('获取验证码失败，请刷新重试');
      // 不要关闭验证码窗口，而是显示错误信息
      images.value = []; // 清空图片
      message.value = '获取验证码失败，请点击刷新按钮重试';
    }
  } catch (error) {
    console.error('获取验证码出错:', error);
    ElMessage.error('网络错误，请稍后重试');
    // 同样不关闭验证码窗口
    images.value = [];
    message.value = '网络错误，请点击刷新按钮重试';
  } finally {
    isLoading.value = false;
  }
};

// 预加载图片，提高用户体验
const preloadImages = (imageList) => {
  imageList.forEach(image => {
    if (image.src) {
      const img = new Image();
      img.src = image.src;
    }
  });
}
// 初始化图片
const initializeImages = () => {
  getCaptchaImages();
  selectedImages.value = [];
  selectedClass.value = Array(9).fill('');
  isVerified.value = false;
  showCloseButton.value = false;
  selectedReason.value = [];

  // 打印调试信息
  console.log('Recaptcha 组件已挂载，等待用户操作');
};

// 切换图片选择状态
const toggleImage = (index) => {
  if (selectedImages.value.includes(index)) {
    selectedImages.value = [];
  } else {
    selectedImages.value = [index];
  }
};

// 刷新图片
const refreshImages = () => {
  initializeImages();
};

const verifySelection = async () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('请选择一张虚假图片');
    return;
  }

  if (selectedReason.value.length === 0) {
    ElMessage.warning('请至少选择一个您认为是虚假的原因');
    return;
  }

  try {
    isLoading.value = true;

    // 获取用户的 openid
    const openid = localStorage.getItem('openid') || sessionStorage.getItem('openid') || '';

    // 获取选中图片的索引和完整数据
    const selectedIndex = selectedImages.value[0];
    const selectedImageData = images.value[selectedIndex] || {};

    // 收集所有图片的ID
    const allImageIds = images.value.map(img => img.id || '');

    console.log('要提交的图片数据:', {
      selectedIndex: selectedImages.value[0],
      imageData: images.value[selectedImages.value[0]],
      allImages: images.value
    });

    const response = await axios.post('/recaptcha/verify/', {
      selected: selectedImages.value,
      // 添加图片ID信息
      imageId: selectedImageData.id || '',
      // 保持原有字段
      reason: selectedReason.value.join(','),
      openid: openid,
      // 添加所有图片ID信息
      allImageIds: allImageIds
    }, {
      withCredentials: true
    });

    if (response.data.success) {
      const result = response.data.data;
      console.log('验证结果:', result);

      if (result.is_correct) {
        ElMessage.success(result.message || '验证成功');
        emit('submit', { success: true, action: 'verify' });
      } else {
        // 验证失败逻辑
        ElMessage.error(result.message || '验证失败');

        // 将所有图片标记清除
        selectedClass.value = Array(images.value.length).fill('');

        // 标记用户选择的图片和正确图片
        if (result.selected_index !== undefined) {
          selectedClass.value[result.selected_index] = 'wrong-selection';
        }

        if (result.correct_index !== undefined) {
          selectedClass.value[result.correct_index] = 'correct-selection';
        }

        isVerified.value = true;
        showCloseButton.value = true;
      }
    } else {
      console.error('验证失败:', response.data);
      ElMessage.error(response.data.message || '验证失败，请重试');
    }
  } catch (error) {
    console.error('验证失败:', error);
    if (error.response && error.response.status === 400 &&
      error.response.data && error.response.data.message === '验证会话已过期，请重新获取图片') {
      ElMessage.warning('验证码已过期，正在为您刷新...');
      getCaptchaImages();
    } else {
      ElMessage.error('验证失败，请重试');
    }
  } finally {
    isLoading.value = false;
  }
};

// 添加重置函数
const resetVerification = () => {
  isVerified.value = false;
  showCloseButton.value = false;
  selectedClass.value = Array(images.value.length).fill('');
  selectedImages.value = [];
  getCaptchaImages();
  selectedReason.value = []; // 清空选择理由
};
// 处理图片加载错误
const handleImageError = (index) => {
  console.error(`图片加载失败: 索引=${index}`);
  // 可以替换为默认图片
  if (images.value[index]) {
    images.value[index].src = 'https://via.placeholder.com/150?text=加载失败';
  }
};

// 放大图片
const enlargeImage = (image) => {
  // 直接使用原始图片
  enlargedImageSrc.value = image;
  resetSize();
  dialogVisible.value = true;
};

// 处理鼠标滚轮事件，对图片进行放大缩小处理
const handleWheel = (event) => {
  if (event.deltaY < 0) {
    adjustSize(50);
  } else {
    adjustSize(-50);
  }
};

// 调整图片大小
const adjustSize = (delta) => {
  const newSize = imageSize.value + delta;
  // 图片大小范围
  if (newSize >= 800 && newSize <= 1600) {
    imageSize.value = newSize;
  }
};

// 重置图片尺寸
const resetSize = () => {
  imageSize.value = 800; // 设置重置尺寸为800px
};

onMounted(() => {
  initializeImages();
});
</script>

<style scoped>
.recaptcha-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.recaptcha-box {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recaptcha-header {
  margin-bottom: 20px;
  margin-top: 20px;
  font-weight: bold;
  font-size: 16px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 250px);
  grid-gap: 10px;
  margin-bottom: 20px;
}

.image-item {
  width: 250px;
  height: 250px;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item.selected {
  border-color: #0d7ded;
  border-width: 4px;
}

.image-item.wrong-selection {
  border: 4px solid #F56C6C;
  /* 红色边框表示错误选择 */
}

.image-item.wrong-selection::after {
  content: '错误';
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(245, 108, 108, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.image-item.correct-selection {
  border: 4px solid #67C23A !important;
  /* 绿色边框标识正确答案 */
}

.image-item.correct-selection::after {
  content: '正确';
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(103, 194, 58, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.image-item.correct-selection,
.image-item.missed-selection {
  border: 3px solid #67C23A;
  /* 绿色边框表示正确选择或漏选的正确图片 */
}

.image-item.missed-selection::after {
  content: '漏选';
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(103, 194, 58, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 150px;
}

.selection-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgb(255, 255, 255);
  pointer-events: auto;
}

.selection-indicator::after {
  content: '\2713';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(0, 0, 0);
  font-size: 15px;
  opacity: 0;
}

.image-item.selected .selection-indicator::after {
  opacity: 1;
}

/* 设置图片查看器样式 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-viewer-container {
  position: relative;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  /* 允许滚动查看图片 */
}

.enlarged-image {
  display: block;
  margin: 0 auto;
  image-rendering: auto;
  image-rendering: -webkit-optimize-contrast;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.zoom-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  gap: 15px;
}

.zoom-controls span {
  font-size: 14px;
  color: #606266;
}

.reason-selector {
  margin: 20px 0;
  padding: 15px 25px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #f8f9fa;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 容器内容居中 */
}

.reason-title {
  margin-bottom: 15px;
  font-weight: bold;
  color: #606266;
  text-align: center;
  font-size: 18px;
  /* 标题居中 */
}

.el-checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, auto));
  row-gap: 15px;
  column-gap: 100px;
  width: auto;
  max-width: 450px;
  justify-content: center;
}

.el-checkbox {
  margin: 0 !important;
  padding: 8px 5px;
  display: flex;
  justify-content: center;
}

:deep(.el-checkbox__inner) {
  border-color: #999ca3 !important;
  border-width: 2px !important;
}
</style>
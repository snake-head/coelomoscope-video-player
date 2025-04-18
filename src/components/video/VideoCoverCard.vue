<template>
  <div class="video-card__wrap">
    <div class="video-image" :style="{ backgroundImage: `url(${video.coverImgUrl})`, backgroundSize: 'cover' }">
      <div class="router-link" @click="handleClick" :class="{ 'disabled': video.status === 2 }">
        <video :src="video.videoUrl" style="width: 100%; border-radius: 6px;"></video>
      </div>
    </div>
    <div class="video-mask">
      <div class="video-stats">
        <div class="video-stats--left">
          <span class="video-stats--item">{{ videoType }}</span>
          <span class="video-stats--item">{{ videoDateFormat(video.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCourseByCourseId, getCourseTypeById } from "../../utils/request/course";
import { ElMessage } from "element-plus";
import { recaptchaManager } from "../../utils/recapchamanage";

const router = useRouter();

const props = defineProps({
  video: {
    type: Object,
    required: true,
  }
});

// 修改点击处理函数
const handleClick = () => {
  if (props.video.status === 2) return;

  const videoId = props.video.videoId;
  console.log('点击视频:', videoId);

  // 目标导航路径
  const navigationPath = `/video/${videoId}/play`;

  try {
    // 记录导航并检查是否需要验证
    const needVerification = recaptchaManager.recordNavigation(navigationPath);

    if (needVerification) {
      console.log('需要验证，导航已挂起');
      // 导航已挂起，等待验证完成后自动跳转
    } else {
      console.log('无需验证，直接跳转');
      // 不需要验证，直接跳转
      window.location.href = navigationPath;
    }
  } catch (e) {
    console.error('处理导航失败:', e);
    // 出错时直接跳转
    window.location.href = navigationPath;
  }
};

const videoType = ref("未指定");
onMounted(async () => {
  try {
    const course = (await getCourseByCourseId(props.video.courseId)).data.results[0];
    videoType.value = props.video.status == 2 ? '视频处理中' : (await getCourseTypeById(course.courseType)).data.name
  } catch (err) {
    ElMessage.error(err.toString())
  }
});

const videoDateFormat = (originDateString) => {
  return originDateString.substring(0, originDateString.indexOf("T"));
}
</script>

<style lang="css" scoped>
.video-card__wrap {
  position: relative;
  border-radius: 6px;
  z-index: 1;
}

.video-stats--item {
  display: -webkit-flex;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.video-stats--left {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  margin-bottom: 5px;
  margin-left: -5px;
}

.video-stats {
  display: -webkit-flex;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 16px 8px 6px;
  width: 100%;
  height: 38px;
  font-size: 13px;
  line-height: 18px;
  color: #fff;
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .5) 100%);
  z-index: 2;
  box-sizing: border-box;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  word-break: keep-all;
  opacity: 1;
}

.video-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  opacity: 1;
  transition: all .2s linear .2s;
  pointer-events: none;
}

.router-link {
  cursor: pointer;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.router-link.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
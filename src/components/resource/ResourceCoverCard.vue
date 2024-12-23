<template>
  <div class="video-card__wrap">
    <router-link 
      :to="`/resource/${resource.id}/content`" 
      style="display: block; width: 100%; height: 100%; text-decoration: none;">
      <div class="video-image" :style="{ backgroundImage: `url(${resource.coverImgUrl})`, backgroundSize: 'cover' }">
      </div>
    </router-link>
    <div class="video-mask">
      <div class="video-stats">
        <div class="video-stats--left">
          <!-- <span class="video-stats--item">{{ videoType }}</span> -->
          <span class="video-stats--item">{{ videoDateFormat(resource.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { getCourseByCourseId, getCourseTypeById } from "../../utils/request/course";
import { ElMessage } from "element-plus";
const props = defineProps({
  resource: {
    type: Object,
    required: true,
  }
})

const videoType = ref("未指定");
onMounted(async () => {
  try {
    // const course = (await getCourseByCourseId(props.video.courseId)).data.results[0];
    const course = 'test'
    // videoType.value = props.video.status == 2? '视频处理中': (await getCourseTypeById(course.courseType)).data.name
  } catch (err) {
    ElMessage.error(err.toString())
  }
})

const videoDateFormat = (originDateString) => {
  // 从后端取出的日期形如2014-11-03T18:36:51.382Z
  // 需要格式化截取 T 之前的日期部分之后展示
  return originDateString.substring(0, originDateString.indexOf("T"));
}
</script>
<style lang="scss" scope>
.video-card__wrap {
  position: relative;
  border-radius: 6px;
  z-index: 1;

  .video-image {
    height: 100px;
  }
}

.video-stats--item {
  display: -webkit-flex;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  // margin-right: 12px;
}

.video-stats--left {
  min-width: 0;
  flex: 1;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>
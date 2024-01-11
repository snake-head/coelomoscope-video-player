<template>
  <div class="course-card__wrap">
    <div class="course-image">
      <el-link type="default" :href="`/course/${course.courseId}`" :underline="false">
        <el-image :src="course.courseCoverUrl">
          <template #error>
            <div class="image-slot">
              <el-icon><icon-picture /></el-icon>
              无封面
            </div>
          </template>
        </el-image>
      </el-link>
    </div>
    <div class="course-mask">
      <div class="course-stats">
        <div class="course-stats--left">
          <span class="course-stats--item">{{ course.courseName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { Picture as IconPicture } from '@element-plus/icons-vue'
const props = defineProps({
  course: {
    type: Object,
    required: true,
  }
})
</script>
<style lang="css" scope>
.el-image {
  border-radius: 6px;
}

.el-link__inner {
  align-items: flex-start;
}

.course-image,
.el-link,
.el-link__inner,
.el-image {
  height: 100%;
  width: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

.course-card__wrap {
  position: relative;
  z-index: 1;
  height: 85%;
}

.course-stats--item {
  display: -webkit-flex;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-right: 12px;
}

.course-stats--left {
  min-width: 0;
  flex: 1;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.course-stats {
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

.course-mask {
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
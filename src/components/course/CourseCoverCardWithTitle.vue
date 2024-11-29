<template>
  <div>
    <el-space wrap>
      <div v-for="course in courses" :key="course.courseId">
        <div class="course-card">
          <CourseCoverCard :course="course"></CourseCoverCard>
          <div class="link-font__outer">
            <el-link type="default" :href="`/course/${course.courseId}`" :underline="false">
              <div class="link-font">
                {{ course.courseName }}
              </div>
            </el-link>
          </div>
        </div>
      </div>
    </el-space>
  </div>
</template>
<script setup>
import CourseCoverCard from './CourseCoverCard.vue';
defineProps({
  courses: {
    type: Array,
    required: true,
  }
})

</script>
<style scoped>
.course-card {
  width: 250px;
  height: 200px;
  margin: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.link-font {
  font-size: medium;
  font-weight: bold;
}

.link-font__outer {
  text-align: center;
  margin-top: 5px;
}
</style>
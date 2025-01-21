<template>
  <div v-loading="isLoading">
    <!-- 第一类别单独一行 -->
    <div v-for="(groupCourses, type, index) in groupedCourses" :key="type" 
         :class="['course-group', {'small-group': groupCourses.length <= 2}]">
      <h3 class="group-title">{{ courseTypeLabels[type] || type || '未分类' }}</h3>
      <el-space wrap>
        <div v-for="course in groupCourses" :key="course.courseId">
          <div class="course-card">
            <CourseCoverCard :course="course" />
            <div class="link-font__outer">
              <el-link type="default" :href="`/course/${course.courseId}`" :underline="false">
                <div class="link-font">
                  {{ course.courseName }}
                  <span v-if="courseTypeLabels[course.courseType]"></span>
                </div>
              </el-link>
            </div>
          </div>
        </div>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted, ref, watch } from 'vue';
import CourseCoverCard from './CourseCoverCard.vue';
import { getCourseTypeById } from "../../utils/request/course";

const props = defineProps({
  courses: {
    type: Array,
    required: true,
  }
});

const isLoading = ref(true);
const courseTypeLabels = reactive({});

// 获取课程类型标签
const fetchCourseTypeLabels = async () => {
  try {
    isLoading.value = true;
    const types = new Set();
    props.courses.forEach(course => {
      if (course.courseType) {
        types.add(String(course.courseType));
      }
    });

    await Promise.all(
      Array.from(types).map(async (typeId) => {
        try {
          const res = await getCourseTypeById(typeId);
          if (res?.data?.label) {
            courseTypeLabels[typeId] = res.data.label;
          }
        } catch (err) {
          console.error(`获取课程类型 ${typeId} 失败:`, err);
        }
      })
    );
  } finally {
    isLoading.value = false;
  }
};

// 监听 courses 变化重新获取标签
watch(() => props.courses, () => {
  fetchCourseTypeLabels();
}, { immediate: true });

const groupedCourses = computed(() => {
  const groups = {};
  const filteredCourses = props.courses.filter((_, index) => 
    index !== 8
  );

  filteredCourses.forEach(course => {
    const type = course.courseType || '未分类';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(course);
  });
  return groups;
});
</script>

<style scoped>
.course-group {
  margin-bottom: 30px;
  width: 100%;
}

/* 当课程组内容较少时应用的样式 */
.small-group {
  display: inline-block;
  width: 50%;
  vertical-align: top;
}

.group-title {
  text-align: left;
  margin-left: 15px;
  color: #409EFF;
  font-size: 20px;
}

.course-card {
  width: 300px;
  height: 250px;
  margin: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.link-font__outer {
  text-align: center;
  margin-top: 5px;
}

.link-font {
  font-size: medium;
  font-weight: bold;
  font-size: 18px;
}
</style>
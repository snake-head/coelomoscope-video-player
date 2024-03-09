<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-19 12:12:27
-->
<template >
  <div>
    <el-container direction="vertical">
      <div class="main-container">
        <el-main>
          <div class="view">
            <div class="view-label">
              <el-tag effect="plain" round size="large" type="success">
                筛选类别：{{ filterLabel }}
              </el-tag>
            </div>
            <div class="course-cards">
              <CourseCoverCardWithTitle :courses="filteredVideoList"></CourseCoverCardWithTitle>
            </div>
          </div>
        </el-main>
      </div>
    </el-container>
  </div>
</template>
<script setup>
import CourseCoverCardWithTitle from '../../components/course/CourseCoverCardWithTitle.vue';
import { ref, reactive, onMounted, watch, computed } from 'vue';
import {
  useRoute,
  useRouter,
  onBeforeRouteLeave
} from "vue-router";
import { courseQueryCriteria, globalCourseSearch } from "../../utils/global-search/course";
import { getCourseTypeById } from "../../utils/request/course"
import { resetQueryCriteria } from "../../utils/global-search/common";
const route = useRoute();
const router = useRouter();
const filteredVideoList = ref([]);
const filteredCourseType = reactive({
  id: '',
  name: '',
  label: ''
});
const filterLabel = computed(() => filteredCourseType.label || '未指定');
onMounted(() => {
  flushData()
})
const watchStopFunc = watch(courseQueryCriteria, () => flushData(), { deep: true })
onBeforeRouteLeave((to, from) => {
  resetQueryCriteria(courseQueryCriteria);
  watchStopFunc();//取消watch防止内存泄露
})
const flushData = () => {
  globalCourseSearch()
    .then(res => filteredVideoList.value = res.data?.results)
    .catch(err => console.error(err));
  getCourseTypeById(courseQueryCriteria.courseTypeId || 0)
    .then(res => {
      filteredCourseType.id = res.data?.id;
      filteredCourseType.name = res.data?.name;
      filteredCourseType.label = res.data?.label;
    })
    .catch(err => console.error(err));
}
</script>
<style scoped>
.view {
  margin-left: 20px;
  text-align: left;
}

.course-cards {
  margin-top: 8px;
}

.main-container {
  margin-top: 20px;
}
</style>
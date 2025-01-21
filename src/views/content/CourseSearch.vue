<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-19 12:12:27
-->
<template>
  <div>
    <el-container direction="vertical">
      <div class="main-container">
        <el-main>
          <div class="view">
            <div class="tag-bar">
              <div class="tag-bar-info">
                <span class="check-tag">
                  <el-tag effect="plain" size="large" type="success" class="buttonsize">
                    筛选类别：{{ filterLabel }}
                  </el-tag>
                </span>
              </div>
            </div>
            <div class="course-cards">
              <CourseSearchCard :courses="filteredVideoList"></CourseSearchCard>
              <!-- {{ courseQueryCriteria.courseTypeId }} -->
            </div>
          </div>
        </el-main>
      </div>
    </el-container>
  </div>
</template>

<script setup>
import CourseSearchCard from "../../components/course/CourseSearchCard.vue";
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
const filterLabel = computed(() => filteredCourseType.label || '全部案例');
const watchStopFunc = watch(courseQueryCriteria, () => flushData(), { deep: true })

onBeforeRouteLeave((to, from) => {
  resetQueryCriteria(courseQueryCriteria);
  watchStopFunc();//取消watch防止内存泄露
})

const resetFilterLabel = () => {
  if (courseQueryCriteria.courseTypeId === 0) {
    filteredCourseType.id = '';
    filteredCourseType.name = '';
    filteredCourseType.label = '全部案例';
  }
};

const flushData = async () => {
  try {
    // 获取课程数据
    const res = await globalCourseSearch();
    
    if (courseQueryCriteria.courseTypeId === 0) {
      filteredVideoList.value = res.data?.results || [];
      resetFilterLabel(); // 重置标签
    } else {
      const filtered = (res.data?.results || []).filter(video => 
        String(video.courseType) === String(courseQueryCriteria.courseTypeId)
      );
      filteredVideoList.value = filtered;
      
      // 获取当前选中类型的标签
      const typeRes = await getCourseTypeById(courseQueryCriteria.courseTypeId);
      if (typeRes?.data) {
        filteredCourseType.id = typeRes.data.id;
        filteredCourseType.name = typeRes.data.name;
        filteredCourseType.label = typeRes.data.label;
      }
    }
  } catch (err) {
    console.error('获取数据失败:', err);
  }
};

onMounted(() => {
  // 优先使用路由参数
  const typeId = route.query.typeId || route.params.typeId;
  if (typeId) {
    courseQueryCriteria.courseTypeId = Number(typeId);
    flushData(); // 立即刷新数据
  }
});

// 监听路由参数变化
watch(
  () => route.query.typeId,
  (newTypeId) => {
    if (newTypeId) {
      courseQueryCriteria.courseTypeId = Number(newTypeId);
      flushData(); // 参数变化时刷新数据
    }
  },
  { immediate: true }
);

// 路由离开时清理
onBeforeRouteLeave(() => {
  resetQueryCriteria(courseQueryCriteria);
  watchStopFunc();
});
</script>
<style scoped>
.tag-bar :deep(.el-tag) {
  border: 2px solid #409EFF;
  border-radius: 4px;
  padding: 20px 20px;
  font-size: 20px;
  transition: all 0.3s ease;
  background-color: #409EFF;
  color: white;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tag-bar-info {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.buttonsize {
  font-weight: 500;
  letter-spacing: 1px;
}

.course-cards {
  margin-top: 8px;
  width: 100%;
  display: block;
}

.view {
  margin-left: 20px;
  text-align: left;
  width: 100%;
}

.main-container {
  margin-top: 20px;
  width: 100%;
}

:deep(.el-main) {
  padding: 0;
  text-align: left;
}
</style>
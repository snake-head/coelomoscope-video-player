<template>
  <div v-loading="isLoading" v-cloak>
    <div v-for="(groupVideos, courseId) in groupedVideos" :key="courseId" class="course-group">
      <h3 class="group-title">
        <span class="check-tag">
          <el-link :href="`/course/${courseId}/detail`" :underline="false" class="custom-link">
            {{ courseNames[courseId] || '未分类' }}
          </el-link>
          <el-alert
            title="点击标题查看全部视频"
            type="info"
            :closable="false"
            show-icon
            class="alert-style">
          </el-alert>
        </span>
      </h3>
      <div class="video-display-table">
        <div v-for="video in groupVideos" :key="video.videoId" class="video-display-table-row">
          <div class="video-display-table-row__item">
            <el-link :href="`/video/${video.videoId}/play`" :underline="false">
              <el-image :src="video.coverImgUrl" class="video-cover-image" />
              <div class="video-date">{{ formatDate(video.createdAt) }}</div>
            </el-link>
            <div class="video-info">
              <p>{{ video.videoName.replace('.mp4', '') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { getAllVideos } from '../../utils/request/video';
import { getCourseByCourseId } from '../../utils/request/course';

const isLoading = ref(true);
const videos = ref([]);
const courseNames = reactive({});
const courseTypes = reactive({});
let isComponentMounted = true;


// 接收 props
const props = defineProps({
  courses: {
    type: Array,
    required: true,
  }
});

// 获取视频数据
const fetchAllVideos = async () => {
  if (!isComponentMounted) return;
  
  try {
    isLoading.value = true;
    const res = await getAllVideos();
    if (res?.data?.results && isComponentMounted) {
      const filteredVideos = res.data.results.filter(video => {
        return props.courses.some(course => course && course.courseId === video.courseId);
      });
      
      videos.value = filteredVideos;
      await fetchCourseNames();
    }
  } catch (error) {
    console.error('获取视频失败:', error);
  } finally {
    if (isComponentMounted) {
      isLoading.value = false;
    }
  }
};

// 获取课程名称和类型
const fetchCourseNames = async () => {
  const courseIds = new Set(videos.value.map(video => video.courseId));
  
  await Promise.all(
    Array.from(courseIds).map(async (courseId) => {
      try {
        const res = await getCourseByCourseId(courseId);
        if (res?.data?.results?.[0]) {
          courseNames[courseId] = res.data.results[0].courseName;
          courseTypes[courseId] = res.data.results[0].courseType;
        }
      } catch (err) {
        console.error(`获取课程信息失败: ${courseId}`, err);
      }
    })
  );
};

// 按课程ID分组视频
const groupedVideos = computed(() => {
  const groups = {};
  videos.value.forEach(video => {
    const courseId = video.courseId;
    if (!groups[courseId]) {
      groups[courseId] = [];
    }
    if (groups[courseId].length < 14) {
      groups[courseId].push(video);
    }
  });
  return groups;
});

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const watchStop = watch(() => props.courses, () => {
  if (isComponentMounted) {
    fetchAllVideos();
  }
}, { deep: true });

// 组件卸载前清理
onBeforeUnmount(() => {
  isComponentMounted = false;
  watchStop(); // 停止监听
});

onMounted(() => {
  fetchAllVideos();
});
</script>

<style scoped>
[v-cloak] {
  display: none;
}

.course-group {
  width: 100%;
  margin-bottom: 30px;
  display: block!important;
}

.group-title {
  justify-content: left;
  text-align: left!important;
  margin: 15px;
  font-size: 30px;
}

.custom-link {
  text-align: left !important;
  display: inline-block !important;
  width: auto !important;
}

.group-title :deep(.el-link) {
  color: #409EFF;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 20px;
  text-align: left;
  display: flex; 
  justify-content: left; 
  align-items: center;
}

:deep(.el-link) {
  display: inline-block !important;
  text-align: left !important;
}

.video-display-table {
  display: grid;
  grid-template-columns: repeat(7, auto);
  gap: 20px;
  padding: 20px;
  justify-content: start;
}

.video-display-table-row__item {
  position: relative; 
  height:170px;
  width: 240px; 
  margin: 18px;
  margin-bottom: 45px;
  cursor: pointer; 
}

.video-cover-image {
  width: 240px;
  height: 170px;
  object-fit: cover;
}

.video-date {
  position: absolute;
  bottom: 0;
  left: 0;
  color: white;
  padding: 2px 5px;
  font-size: 12px;
}

.video-info {
  text-align: center;
  margin-top: 10px;
}

.check-tag {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.alert-style {
  margin-left: 20px;
  height: 40px;
  display: flex;
  align-items: center;
}

:deep(.el-alert) {
  padding: 16px 16px;
  width: auto;
  display: flex;
  align-items: center;
}

:deep(.el-alert__content) {
  display: flex;
  margin-left: auto;
  align-items: center;
  padding: 0;
}
</style>
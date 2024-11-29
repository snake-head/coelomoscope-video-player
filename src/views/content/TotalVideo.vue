<template>
  <div>
    <h3>全部视频</h3>
    <div class="video-display-table">
      <div class="video-display-table-row" v-for="video in videos" :key="video.videoId">
        <div class="video-display-table-row__item">
          <el-link :href="`/video/${video.videoId}/play`" :underline="false">
            <el-image :src="video.coverImgUrl" class="video-cover-image" />
            <div class="video-date">{{ formatDate(video.createdAt) }}</div>
          </el-link>
          <div class="video-info">
            <p>{{ video.videoName }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination-container">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next, jumper"
        :total="totalVideos"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllVideos } from '../../utils/request/video'; 

const videos = ref([]);
const currentPage = ref(1);
const pageSize = ref(48); 
const totalVideos = ref(0);

const fetchAllVideos = () => {
  getAllVideos(currentPage.value, pageSize.value)
    .then(res => {
      if (res && res.data && res.data.results) {
        videos.value = res.data.results;
        totalVideos.value = res.data.totalCount; // 假设后端返回总视频数
        console.log('All videos:', videos.value);
      } else {
        console.error('Unexpected response structure:', res);
      }
    })
    .catch(error => {
      console.error('Error fetching all videos:', error);
    });
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchAllVideos();
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(() => {
  fetchAllVideos();
});
</script>

<style scoped>
.video-display-table {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  align-items: center; 
  margin: 0 500px; 
}

.video-display-table-row__item {
  width: 200px; 
  margin: 20px;
  cursor: pointer; 
}

.video-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-date {
  position: absolute; 
  bottom: 0px; 
  left: 0px; 
  color: white; 
  padding: 2px 5px; 
  border-radius: 3px; 
  font-size: 12px; 
}

.video-info {
  text-align: center;
  margin-top: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center; 
  margin-top: 20px; 
}
</style>
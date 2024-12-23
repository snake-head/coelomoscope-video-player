<template>
  <div>
    <h3>全部视频</h3>
    <div class="filter-container">
      <!-- 全选框 -->
      <div class="select-all-container">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
      </div>
      <!-- 其余框 -->
      <div class="filter-content">
        <el-checkbox-group v-model="selectedCategories" @change="handleCheckedCategoriesChange">
          <el-checkbox v-for="category in categories" :key="category.id" :label="category.id">
            {{ category.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="video-display-table">
      <div class="video-display-table-row" v-for="video in filteredVideos" :key="video.videoId">
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
import { ref, onMounted, watch, computed } from 'vue';
import { getAllVideos } from '../../utils/request/video'; 

const videos = ref([]);
const currentPage = ref(1);
const pageSize = ref(48); 

const categories = ref([
  { id: 'cid2403383', name: '胃镜检查术' },
  { id: 'cid7105224', name: '大肠息肉内镜治疗术' },
  { id: 'cid7475064', name: '前列腺根治术' },
  { id: 'cid202307271405', name: '肺叶段切除' },
  { id: 'cid202308011054', name: '肾上腺切除' },
  { id: 'cid202308011056', name: '肾部分切除' },
  { id: 'cid20240112', name: '胆囊切除术' },
  { id: 'cid20240429', name: '肾根治性切除术' },
  { id: 'cid20240521', name: '交感神经切断术' },
  { id: 'cid20241210', name: '肝切除术' },
]); 

const selectedCategories = ref(categories.value.map(category => category.id)); // 默认全选
const checkAll = ref(true);
const isIndeterminate = ref(false);

const fetchAllVideos = () => {
  getAllVideos()
    .then(res => {
      if (res && res.data && res.data.results) {
        videos.value = res.data.results;
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
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// 处理“全选”复选框变化
const handleCheckAllChange = (val) => {
  selectedCategories.value = val ? categories.value.map(category => category.id) : [];
  isIndeterminate.value = false;
};

// 处理类别复选框变化
const handleCheckedCategoriesChange = (value) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === categories.value.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < categories.value.length;
  currentPage.value = 1;
};

// 当筛选条件变化时，重置当前页为第一页
watch(selectedCategories, () => {
  currentPage.value = 1;
});

// 计算属性：根据选中的类别过滤视频，并应用分页
const filteredVideos = computed(() => {
  const filtered = videos.value.filter(video =>
    selectedCategories.value.includes(video.courseId)
  );
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filtered.slice(startIndex, startIndex + pageSize.value);
});

// 计算属性：过滤后的视频总数
const totalVideos = computed(() => {
  return videos.value.filter(video =>
    selectedCategories.value.includes(video.courseId)
  ).length;
});

onMounted(() => {
  fetchAllVideos();
});
</script>

<style scoped>
.filter-container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 水平居中 */
  margin-bottom: 20px;
}

.select-all-container {
  margin-bottom: 10px; /* 全选框与其余框之间的间距 */
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* 水平居中 */
  gap: 20px;
}

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
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
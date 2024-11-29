<template>
  <div class="page-container">
    <!-- 背景虚化效果，未登录时虚化 -->
    <div :class="{'blur-background': !isLoggedIn}">
      <el-container direction="vertical">
        <div class="switch-chart">
          <el-carousel type="card">
            <el-carousel-item v-for="image in switchCardImages" :key="image">
              <el-image :src="image" style="height:100%;"></el-image>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="main-container" v-if="isLoggedIn">
          <!-- 用户已经登录后的主页面内容 -->
          <el-container v-for="(clazz, index) in homeVideoClassification" :key="clazz">
            <div class="tag-bar">
              <div class="tag-bar-info">
                <span class="check-tag">
                  <el-tag effect="plain" round size="large" type="success" @click="courseSearchByTypeId()">
                    {{ clazz }}
                  </el-tag>
                </span>
                <span class="tag-info">
                  <el-alert title="点击标签查看更多" type="info" show-icon :closable="false" />
                </span>
              </div>
              <div class="video-cards">
                <CourseCoverCardWithTitle :courses="latestCourses"></CourseCoverCardWithTitle>
              </div>
            </div>
          </el-container>
          <!-- 新增视频封面模块 -->
          <el-container>
            <div class="tag-bar">
              <div class="tag-bar-info">
                <span class="check-tag">
                  <el-tag effect="plain" round size="large" type="success" @click="goToTotalVideo()">
                    全部视频
                  </el-tag>
                </span>
                <span class="tag-info">
                  <el-alert title="点击标签查看更多" type="info" show-icon :closable="false" />
                </span>
              </div>
              <div class="video-display-table">
                <div class="video-display-table-row" v-for="video in specificCourseVideos.slice(0, 16)" :key="video.videoId">
                  <div class="video-display-table-row__item">
                    <el-link :href="`/video/${video.videoId}/play`" :underline="false">
                      <el-image :src="video.coverImgUrl" class="video-cover-image" />
                      <div class="video-date">{{ formatDate(video.createdAt) }}</div>
                    </el-link>
                  </div>
                </div>
              </div>
            </div>
          </el-container>
        </div>
      </el-container>
    </div>

    <div v-if="!isLoggedIn" class="login-overlay">
      <el-card class="large-card">
        <h3 v-if="!openid">未检查到用户登录信息，请前往 <a :href="loginUrl">课题平台</a> 完成登录再进行访问。</h3>
        <h3 v-else>正在获取用户信息，请稍候...</h3>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import CourseCoverCardWithTitle from '../../components/course/CourseCoverCardWithTitle.vue';
import { courseQueryCriteria } from "../../utils/global-search/course";
import { getCourses } from "../../utils/request/course";
import { getAllVideos } from '../../utils/request/video'; 

const isLoggedIn = ref(true); 
const openid = ref(null);
const loginUrl = 'https://national.medevice.pro/login.html'; 

const router = useRouter();
const LATEST_LENGTH = 16;
const switchCardImages = [
  "https://ts2.cn.mm.bing.net/th?id=OIP-C.f_sEou55jnzGiDFz58kCtwHaE4&w=307&h=203&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  "https://ts4.cn.mm.bing.net/th?id=OIP-C.mEq-DkBG0x_8Ykl4pNqAlQHaEO&w=331&h=188&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  "https://tse3-mm.cn.bing.net/th/id/OIP-C.zHrHOI1ULHd0iSWTGqd3WAHaDk?w=336&h=168&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  "https://ts1.cn.mm.bing.net/th?id=OIP-C.gKSO2Cw79snhIt_d0m3wVgHaD8&w=309&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
];
const homeVideoClassification = ["最新案例"];
const latestCourses = ref([]);
const specificCourseVideos = ref([]); 

const getLatestCourses = () => {
  console.log('Fetching latest courses...');
  getCourses({ page: 1, limit: LATEST_LENGTH })
    .then(res => {
      latestCourses.value = res.data?.results;
      console.log('Latest courses:', latestCourses.value);
    })
    .catch(error => {
      console.error('Error fetching latest courses:', error);
      ElMessage.error(error.toString());
    });
};

const getSpecificCourseVideos = () => {
  console.log('Fetching specific course videos...');
  getAllVideos()
    .then(res => {
      console.log('Response data:', res); // 调试输出响应数据
      if (res && res.data && res.data.results) {
        specificCourseVideos.value = res.data.results.reverse(); // 倒序排列视频
        console.log('Specific course videos:', specificCourseVideos.value); // 调试输出
        if (!specificCourseVideos.value || specificCourseVideos.value.length === 0) {
          console.warn('No videos found.');
        }
      } else {
        console.error('Unexpected response structure:', res);
      }
    })
    .catch(error => {
      console.error('Error fetching specific course videos:', error);
      ElMessage.error(error.toString());
    });
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(() => {
  console.log('Component mounted, fetching data...');
  // 直接设置 isLoggedIn 为 true，跳过 openid 校验
  isLoggedIn.value = true;
  getLatestCourses();
  getSpecificCourseVideos(); // 获取特定课程的视频
});

const goToTotalVideo = () => {
  router.push('/totalvideo');
};

const courseSearchByTypeId = (typeId) => {
  console.log('Searching courses by type ID:', typeId);
  courseQueryCriteria.courseTypeId = typeId;
  router.push({ name: 'CourseSearch' });
};
</script>

<style scoped>
.page-container {
  position: relative;
  min-height: 100vh;
}

.blur-background {
  filter: blur(5px); /* 背景虚化 */
}

.switch-chart {
  margin-top: 20px;
}

.tag-bar {
  margin-left: 20px;
  text-align: left;
}

.video-cards {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
}

.video-card {
  width: 200px;
  margin: 8px;
}

.video-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-display-table {
  display: flex;
  flex-wrap: wrap;
}

.video-display-table-row__item {
  position: relative; 
  height:150px;
  width: 255px; 
  margin: 15px;
  cursor: pointer; 
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

.main-container {
  margin-top: 20px;
}

.check-tag {
  cursor: pointer;
}

.tag-bar-info {
  display: flex;
  margin: auto;
  line-height: normal;
}

.tag-info {
  margin-left: 8px;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5); 
}

.el-button {
  font-size: 20px;
  padding: 10px 30px;
}

.large-card {
  width: 400px;
  padding: 20px;
  text-align: center;
  background: white;
  border-radius: 10px;
}
</style>
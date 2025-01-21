<template>
  <div class="page-container">
    <!-- 背景虚化效果，未登录时虚化 -->
    <div :class="{'blur-background': !isLoggedIn}">
      <el-container direction="vertical">
        <!-- <div class="switch-chart">
          <el-carousel trigger="click" type="card" :autoplay="false" height="500px">
            <el-carousel-item v-for="(image, index) in switchCardImages" :key="image" @click="handleImageClick(index)">
              <el-image :src="image" style="height:100%; width:100%; object-fit:cover"></el-image>
            </el-carousel-item>
          </el-carousel>
        </div> -->
        <div class="main-container" v-if="isLoggedIn">
          <!-- 用户已经登录后的主页面内容 -->
          <el-container class="featured-videos-container">
            <div class="tag-bar">
              <div class="tag-bar-info">
                <span class="check-tag">
                  <el-tag effect="plain" size="large" type="success" style="margin-top: 30px;" @click="goTOFeaturedVideo()">
                    微创手术新技术操作精选视频
                  </el-tag>
                </span>
              </div>
              <!-- 新增视频显示区域 -->
              <div class="video-display-table-scroll">
                <div class="video-display-table">
                  <div class="video-display-table-row" v-for="video in featuredVideos" :key="video.videoId">
                    <div class="video-display-table-row__item">
                      <el-link :href="`/video/${video.videoId}/play`" :underline="false">
                        <el-image :src="video.coverImgUrl" class="video-cover-image" />
                      </el-link>
                      <div class="video-info">
                        <p>{{ video.videoName }}</p>
                      </div>
                      <!-- <div class="small-video-info">
                        <p>{{ video.courseId }}</p>
                      </div> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-container>
          <el-container v-for="(clazz, index) in homeVideoClassification" :key="clazz">
            <div class="tag-bar">
              <div class="tag-bar-info">
                <span class="check-tag">
                  <el-tag effect="plain" size="large" type="success" @click="courseSearchByTypeId()">
                  {{ clazz }}
                  </el-tag>
                  <el-alert
                  title="点击查看全部案例术种"
                  type="info"
                  :closable="false"
                  show-icon
                  class="alert-style">
                  </el-alert>
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
                  <el-tag effect="plain" size="large" type="success" @click="goToTotalVideo()">
                  全部视频
                  </el-tag>
                  <el-alert
                  title="点击查看全部视频"
                  type="info"
                  :closable="false"
                  show-icon
                  class="alert-style">
                  </el-alert>
                </span>
              </div>
                <div class="video-display-table">
                <div class="video-display-table-row" v-for="video in specificCourseVideos.slice(0,14)" :key="video.videoId">
                  <div class="video-display-table-row__total">
                  <el-link :href="`/video/${video.videoId}/play`" :underline="false">
                    <el-image :src="video.coverImgUrl" class="video-cover-image" />
                    <div class="video-date">{{ formatDate(video.createdAt) }}</div>
                  </el-link>
                  <div class="totalvideo-info">
                    <p>{{ video.videoName.replace('.mp4', '') }}</p>
                  </div>
                    <div class="small-video-info">
                      <!-- <p>{{ activeVideoCourse.courseName }}</p> -->
                      <!-- <p>{{ video.courseId }}</p> -->
                      <p>{{ courseNames[video.courseId] || '未知课程' }}</p>
                    </div>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import CourseCoverCardWithTitle from '../../components/course/CourseCoverCardWithTitle.vue';
import { courseQueryCriteria } from "../../utils/global-search/course";
import { getCourses } from "../../utils/request/course";
import { getAllVideos } from '../../utils/request/video'; 
import { getCourseByCourseId } from "../../utils/request/course";

const isLoggedIn = ref(true); 
const openid = ref(null);
const loginUrl = 'https://national.medevice.pro/login.html'; 
const activeVideoCourse = reactive({
  courseId: "",
  courseName: "",
});
const courseNames = reactive({});

const router = useRouter();
const LATEST_LENGTH = 14;
import selectedCover from '../../assets/精选封面.jpg';

const switchCardImages = [
   selectedCover,
  "https://ts4.cn.mm.bing.net/th?id=OIP-C.mEq-DkBG0x_8Ykl4pNqAlQHaEO&w=331&h=188&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  "https://tse3-mm.cn.bing.net/th/id/OIP-C.zHrHOI1ULHd0iSWTGqd3WAHaDk?w=336&h=168&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  "https://ts1.cn.mm.bing.net/th?id=OIP-C.gKSO2Cw79snhIt_d0m3wVgHaD8&w=309&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
];
const homeVideoClassification = ["全部案例术种"];
const latestCourses = ref([]);
const specificCourseVideos = ref([]); 
const featuredVideos = ref([]); 

const getActiveVideoCourse = async (courseId) => {
  try {
    const course = (await getCourseByCourseId(courseId)).data.results[0];
    activeVideoCourse.courseId = course.courseId;
    activeVideoCourse.courseName = course.courseName;
  } catch (err) {
    console.error(err);
  }
};

// 获取课程名称
const fetchCourseNames = async () => {
  const courseIds = new Set(featuredVideos.value.map(video => video.courseId));
  
  await Promise.all(
    Array.from(courseIds).map(async (courseId) => {
      try {
        const res = await getCourseByCourseId(courseId);
        if (res?.data?.results?.[0]) {
          courseNames[courseId] = res.data.results[0].courseName;
        }
      } catch (err) {
        console.error(`获取课程信息失败: ${courseId}`, err);
      }
    })
  );
};

const getLatestCourses = () => {
  // console.log('Fetching latest courses...');
  getCourses({ page: 1, limit: LATEST_LENGTH })
    .then(res => {
      latestCourses.value = res.data?.results;
      // console.log('Latest courses:', latestCourses.value);
    })
    .catch(error => {
      console.error('Error fetching latest courses:', error);
      ElMessage.error(error.toString());
    });
};

const getSpecificCourseVideos = async () => {
  try {
    const res = await getAllVideos(1, 1000);
    if (res?.data?.results) {
      specificCourseVideos.value = res.data.results.reverse();
      // 获取全部视频的课程名称
      const courseIds = new Set(specificCourseVideos.value.map(video => video.courseId));
      await Promise.all(
        Array.from(courseIds).map(async (courseId) => {
          try {
            const res = await getCourseByCourseId(courseId);
            if (res?.data?.results?.[0]) {
              courseNames[courseId] = res.data.results[0].courseName;
            }
          } catch (err) {
            console.error(`获取课程信息失败: ${courseId}`, err);
          }
        })
      );
    } else {
      console.error('返回数据结构异常:', res);
    }
  } catch (error) {
    console.error('获取全部视频失败:', error);
    ElMessage.error(error.toString());
  }
};


// 获取精选视频
const getFeaturedVideos = () => {
  // console.log('Fetching featured videos...');
  getAllVideos(1, 1000)
    .then(res => {
      // console.log('Response data:', res); // 调试输出响应数据
      if (res && res.data && res.data.results) {
        featuredVideos.value = res.data.results.filter(video => video.courseId === 'cid202412201519'); // 筛选类别为精选视频的视频
        // console.log('Featured videos:', featuredVideos.value);
      } else {
        console.error('Unexpected response structure:', res);
      }
    })
    .catch(error => {
      console.error('Error fetching featured videos:', error);
      ElMessage.error(error.toString());
    });
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// const handleImageClick = (index) => {
//   if (index === 0) {
//     router.push('/course/cid202412201519'); // 替换为您想要跳转的网址
//   }
// };

onMounted(() => {
  // console.log('Component mounted, fetching data...');
  // 直接设置 isLoggedIn 为 true，跳过 openid 校验
  isLoggedIn.value = true;
  getLatestCourses();
  getSpecificCourseVideos(); // 获取特定课程的视频
  getFeaturedVideos(); // 获取精选视频
});

const goToTotalVideo = () => {
  router.push('/totalvideo');
};

const goTOFeaturedVideo =() => {
  router.push('/course/cid202412201519');
};

const courseSearchByTypeId = (typeId) => {
  // console.log('Searching courses by type ID:', typeId);
  courseQueryCriteria.courseTypeId = typeId;
  router.push('/search?typeId=0');
};

watch(() => specificCourseVideos.value, async (videos) => {
  if (videos && videos.length > 0) {
    await getActiveVideoCourse(videos[0].courseId);
  }
}, { immediate: true });
</script>

<style scoped>
.page-container {
  position: relative;
  min-height: 100vh;
}

/* .video-display-table-scroll {
  display: flex;
  overflow-x: scroll;
  white-space: nowrap; 
} */

.featured-videos-container {
  margin-bottom: 50px;
}

.video-info {
  font-size: medium;
  font-weight: bold;
  justify-self: left;
  font-size: 18px;
}

.totalvideo-info{
  font-size: medium;
  font-weight: bold;
  justify-self: left;
  font-size: 15px;
}

.small-video-info {
  margin-top: 8px;
  margin-bottom: 20px;
  font-size: small;
  position: relative; /* 确保层级正确 */
  z-index: 1;        /* 提高层级 */
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
  gap: 30px;         /* 增加视频之间的间距 */
  padding: 20px 0;   /* 添加上下内边距 */
}

.video-display-table-row__item {
  position: relative; 
  height:220px;
  width: 300px; 
  margin: 18px;
  margin-bottom: 60px;
  cursor: pointer; 
}

.video-display-table-row__total{
  position: relative; 
  height:170px;
  width: 240px; 
  margin: 18px;
  margin-bottom: 60px;
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
  display:flex;
  align-items: center;
  cursor: pointer;
}

.tag-bar-info {
  display: flex;
  margin: auto;
  line-height: normal;
}

.tag-bar :deep(.el-tag) {
  padding: 20px 20px;
  font-size: 30px;
  background: none;
  border: none;
  color: #0a3d6f;
  font-weight: bold;
  box-shadow: none;
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

/* 标签容器样式 */
.tag-bar-info {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.alert-style {
  margin-left: 10px;
  height: 40px;
  display: flex;
  align-items: center;
}

/* 调整alert组件样式 */
:deep(.el-alert) {
  padding: 8px 16px;
}
</style>
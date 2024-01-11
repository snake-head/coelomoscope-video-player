<template >
  <div>
    <el-container direction="vertical">
      <div class="switch-chart">
        <el-carousel type="card">
          <el-carousel-item v-for="image in switchCardImages" :key="image">
            <el-image :src="image" style="height:100%;"></el-image>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="main-container">
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
              <CourseCoverCardWithTitle v-if="index === 0" :courses="recommendedCourses"></CourseCoverCardWithTitle>
              <CourseCoverCardWithTitle v-else :courses="latestCourses"></CourseCoverCardWithTitle>
            </div>
          </div>
        </el-container>
      </div>
    </el-container>
  </div>
</template>
<script setup>
import CourseCoverCardWithTitle from '../../components/course/CourseCoverCardWithTitle.vue';
import { courseQueryCriteria } from "../../utils/global-search/course";
import { getCourses } from "../../utils/request/course";
import { ref, reactive, onMounted, onBeforeMount } from 'vue';
import {
  useRouter
} from "vue-router";
import { ElMessage } from 'element-plus';
onMounted(() => {
  getRecommendedCourses();
  getLatestCourses();
});
const router = useRouter();
const LATEST_LENGTH = 10;
const RECOMMENDED_LENGTH = 5;
const switchCardImages = [
  "https://ts2.cn.mm.bing.net/th?id=OIP-C.f_sEou55jnzGiDFz58kCtwHaE4&w=307&h=203&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  "https://ts4.cn.mm.bing.net/th?id=OIP-C.mEq-DkBG0x_8Ykl4pNqAlQHaEO&w=331&h=188&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  "https://tse3-mm.cn.bing.net/th/id/OIP-C.zHrHOI1ULHd0iSWTGqd3WAHaDk?w=336&h=168&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  "https://tse1-mm.cn.bing.net/th/id/OIP-C.gKSO2Cw79snhIt_d0m3wVgHaD8?w=309&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
]
const homeVideoClassification = ["推荐案例", "最新案例"]
const recommendedCourses = ref([]);
const latestCourses = ref([]);
const getRecommendedCourses = () => {
  getCourses({ page: 1, limit: RECOMMENDED_LENGTH })
    .then(res => recommendedCourses.value = res.data?.results)
    .catch(error => ElMessage.error(error.toString()));
}
const getLatestCourses = () => {
  getCourses({ page: 1, limit: LATEST_LENGTH })
    .then(res => latestCourses.value = res.data?.results)
    .catch(error => ElMessage.error(error.toString()));
}
const courseSearchByTypeId = (typeId) => {
  courseQueryCriteria.courseTypeId = typeId;
  router.push({ name: 'CourseSearch' });
}
</script>
<style scoped>
.switch-chart {
  margin-top: 20px;
}

.tag-bar {
  margin-left: 20px;
  text-align: left;
}

.video-cards {
  margin-top: 8px;

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
</style>
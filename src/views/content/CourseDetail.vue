<template>
  <div>
    <el-container direction="vertical">
      <el-main>
        <div class="navigation-bar">
          <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ name: 'CourseSearch' }">
              <div @click="setQueryCourseId(courseType.id)">
                {{ courseType.label }}
              </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ name: 'CourseBrief', params: { courseId: `${courseId}` } }">{{
              courseVO.courseName
            }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentBreadcrumbName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="course-tab">
          <el-tabs v-model="courseTabActiveName" @tab-change="changeBreadcrumbItem" stretch>
            <el-tab-pane label="案例" name="案例详情">
              <div class="course-detail">
                <el-card shadow="hover" style="margin :8px auto;">
                  <div class="video-search-bar">
                    <el-row :gutter="20" justify="center">
                      <el-col :span="7">
                        <span>手术日期</span>
                        <el-date-picker style="width:50%;" clearable v-model="operationDate" type="date"
                          placeholder="选择日期" />
                      </el-col>
                      <el-col :span="7">
                        <span>主刀医生</span>
                        <el-select style="width:50%;" clearable v-model="operator" filterable placeholder="选择医师">
                          <el-option v-for="doctor in doctors" :key="doctor.value" :label="doctor.label"
                            :value="doctor.value" />
                        </el-select>
                      </el-col>
                      <el-col :span="7">
                        <span>病例年龄</span>
                        <el-select style="width:50%;" clearable v-model="patientAge" filterable placeholder="选择年龄段">
                          <el-option v-for="age in ageGroup" :key="age.value" :label="age.label" :value="age.value" />
                        </el-select>
                      </el-col>
                      <el-col :span="3">
                        <el-button type="primary">筛选案例</el-button>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>
                <div class="video-display-table">
                  <div class="video-display-table-row" v-for="video in videos" :key="video.videoId">
                    <div class="video-display-table-row__item">
                      <VideoParagraphLine :video="video" />
                      <el-divider />
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="手术指南" name="手术指南">手术指南</el-tab-pane>
            <el-tab-pane label="手术分析" name="手术分析">手术分析</el-tab-pane>
            <el-tab-pane label="公告" name="公告">公告</el-tab-pane>
            <el-tab-pane label="讨论" name="讨论">讨论</el-tab-pane>
          </el-tabs>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import VideoParagraphLine from '../../components/video/VideoParagraphLine.vue';
import { ArrowRight } from '@element-plus/icons-vue'

import { ref, reactive, onMounted, computed } from 'vue';
import {
  useRoute,
  useRouter
} from "vue-router";
import { courseQueryCriteria } from "../../utils/global-search/course";
import { getCourseByCourseId, getCourseTypeById } from "../../utils/request/course";
import { getVideosByCourseId } from "../../utils/request/video";

onMounted(() => {
  getCurrentCourseInfo(courseId);
  getVideos(courseId);
})

const route = useRoute();
const router = useRouter();
const courseVO = reactive({
  courseId: '',
  courseName: '',
  courseDescription: '',
  courseCoverUrl: '',
  deptCode: '',
  courseTypeId: '',
})
const courseType = reactive({
  id: '',
  name: '',
  label: ''
})
const courseId = route.params.courseId;
const courseTabActiveName = ref('案例详情')
const currentBreadcrumbName = ref('案例详情')
const operationDate = ref('')
const operator = ref('')
const patientAge = ref('')
const doctors = [
  { value: '张三', label: '张三' },
  { value: '李四', label: '李四' },
  { value: '王五', label: '王五' },
]
const ageGroup = [
  { value: '0-10岁', label: '0-10岁' },
  { value: '11-20岁', label: '11-20岁' },
  { value: '21-30岁', label: '21-30岁' },
  { value: '31-40岁', label: '31-40岁' },
  { value: '41-50岁', label: '41-50岁' },
  { value: '51-60岁', label: '51-60岁' },
  { value: '61-70岁', label: '61-70岁' },
  { value: '71-80岁', label: '71-80岁' },
]
const videos = ref([]);

const getCurrentCourseInfo = async (courseId) => {
  try {
    const course = (await getCourseByCourseId(courseId)).data.results[0];
    courseVO.courseId = course.courseId;
    courseVO.courseName = course.courseName;
    courseVO.courseDescription = course.courseDescription;
    courseVO.courseCoverUrl = course.courseCoverUrl;
    courseVO.deptCode = course.deptCode;
    courseVO.courseTypeId = course.courseTypeId;

    const courseTypeResponse = (await getCourseTypeById(course.courseTypeId)).data;
    courseType.id = courseTypeResponse?.id;
    courseType.name = courseTypeResponse?.name;
    courseType.label = courseTypeResponse?.label;
  } catch (err) {
    console.error(err);
  }
}
const getVideos = async (courseId) => {
  try {
    videos.value = (await getVideosByCourseId({ courseId })).data.results;
  } catch (err) {
    console.log(err);
  }
}

const changeBreadcrumbItem = (tabPaneName) => {
  currentBreadcrumbName.value = tabPaneName;
}
const setQueryCourseId = (courseTypeId) => {
  courseQueryCriteria.courseTypeId = courseTypeId ?? '';
}

</script>
<style lang="css" scoped>
.course-detail {
  max-width: 1000px;
  margin: auto;
}

.el-main>* {
  padding-bottom: 16px;
}

.video-search-bar .el-col span {
  padding-right: 8px;
}

:deep(.el-divider--horizontal) {
  margin: 8px 0;
}
</style>
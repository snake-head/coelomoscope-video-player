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
            <el-breadcrumb-item>{{ courseVO.courseName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="course-cover">
          <el-card>
            <div class="course-cover__item">
              <el-image :src="courseVO.courseCoverUrl" style="width: 35%;border-radius: 6px;" />
              <div class="course-cover__text">
                <div class="course-cover__text__inner">
                  <div class="course-name">{{ courseVO.courseName }}</div>
                  <div class="course-type">{{ courseType.label }}</div>
                </div>
                <div class="enter-course-btn">
                  <el-button type="primary" size="large" @click="toCourseDetail(router,courseId)">进入案例</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="course-introduction">
          <div class="course-introduction__left">
            <el-card shadow="never">
              <el-tabs v-model="courseTabActiveName" stretch>
                <el-tab-pane label="案例简介" name="简介">{{ courseVO.courseDescription }}</el-tab-pane>
                <el-tab-pane label="案例评价" name="评价">暂无评价</el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
          <div class="course-introduction__right">
            <el-card shadow="never">
              <el-descriptions :column="1">
                <template #title>
                  <span class="brand-color-bar"></span>
                  <span class="info-header__text">
                    基本信息
                  </span>
                </template>
                <el-descriptions-item label="案例名称">{{ courseVO.courseName }}</el-descriptions-item>
                <el-descriptions-item label="案例分类">{{ courseType.label }}</el-descriptions-item>
                <el-descriptions-item label="所属科系">{{ courseDeptName }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
            <el-card shadow="never">
              <el-descriptions :column="1">
                <template #title>
                  <span class="brand-color-bar"></span>
                  <span class="info-header__text">
                    参与医师
                  </span>
                </template>
                <el-descriptions-item v-for="doctor in relatedDoctors">{{ doctor }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import {
  useRoute,
  useRouter
} from "vue-router";
import { ArrowRight } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from "vue";
import { getCourseByCourseId, getCourseTypeById } from "../../utils/request/course";
import { getDeptByDeptCode } from "../../utils/request/dept";
import { courseQueryCriteria } from "../../utils/global-search/course";
import { toCourseDetail } from "../../utils/router/routeJumper";
const route = useRoute();
const router = useRouter();
const courseId = route.params.courseId;
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
const courseDeptName = ref('');
const courseTabActiveName = ref('简介')
const relatedDoctors = ['张三', '李四', '刘备'];

onMounted(async () => {
  try {
    const course = (await getCourseByCourseId(courseId)).data.results[0];
    courseVO.courseId = course.courseId;
    courseVO.courseName = course.courseName;
    courseVO.courseDescription = course.courseDescription;
    courseVO.courseCoverUrl = course.courseCoverUrl;
    courseVO.deptCode = course.deptCode;
    courseVO.courseTypeId = course.courseType;
    courseDeptName.value = (await getDeptByDeptCode(course.deptCode)).data.results[0].deptName;
    const courseTypeResponse = (await getCourseTypeById(course.courseType)).data;
    courseType.id = courseTypeResponse?.id;
    courseType.name = courseTypeResponse?.name;
    courseType.label = courseTypeResponse?.label;
  } catch (err) {
    console.error(err);
  }
})
const setQueryCourseId = (courseTypeid) => {
  courseQueryCriteria.courseTypeId = courseTypeid ?? '';
}
</script>
<style lang="css" scoped>
.course-introduction {
  display: flex;
  justify-content: space-between
}

.course-introduction__left {
  width: 75%;
}

.course-introduction__right {
  width: 23%;
}

.course-introduction__right .el-card {
  margin-bottom: 8px;
}


.brand-color-bar {
  background-color: rgb(7, 240, 228);
  border-radius: 4px;
  margin-right: 8px;
  padding: 2px;
}

.info-header__text {
  font-size: 20px;
}

.course-cover__item {
  display: flex;
  justify-content: center;
}

.course-cover__text__inner {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  flex: 0 0 25%;
}

.enter-course-btn {
  flex: 0 1 20%;
}

.course-cover__text {
  width: 20%;
  margin-left: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}


.el-main>* {
  padding-bottom: 16px;
}

.course-name {
  font-size: 1.5em;
  font-weight: bold;
  display: block;
}

.course-type {
  font-size: 18px;
  color: var(--el-text-color-regular);
}
</style>
<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-08-31 22:43:50
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-05-23 15:36:08
-->
<template>
  <div class="course-detail">
    <el-card shadow="hover" style="margin :8px auto;">
      <div class="resource-search-bar">
        <el-row :gutter="20" justify="center">
          <el-col :span="7">
            <span>案例类型</span>
            <el-select style="width:50%;" clearable v-model="courseType" filterable
              placeholder="选择类型" >
              <el-option v-for="ctype in courseTypes" :key="ctype.value" :label="ctype.label"
                :value="ctype.value" />
            </el-select>
          </el-col>
          <el-col :span="7">
            <span>术种</span>
            <el-select style="width:50%;" clearable v-model="opetationType" filterable placeholder="选择术种">
              <el-option v-for="otype in opetationTypes" :key="otype.value" :label="otype.label"
                :value="otype.value" />
            </el-select>
          </el-col>
          <el-col :span="7">
            <span>文件类型</span>
            <el-select style="width:50%;" clearable v-model="resourceType" filterable placeholder="选择类型">
              <el-option v-for="rtype in resourceTypeS" :key="rtype.value" :label="rtype.label" :value="rtype.value" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-button type="primary">筛选案例</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <div class="resource-display-table">
      <div class="resource-display-table-row" v-for="resource in resourceFiles" :key="resource.Id">
        <div class="resource-display-table-row__item">
          <ResourceParagraphLine :resource="resource" />
          <el-divider />
        </div>
      </div>
    </div>
  </div>
  <div class="pagination-container">
    <el-pagination
      layout="total, prev, pager, next, jumper"
      :total="totalResource"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      @current-change="handlePageChange"
      @size-change="handleSizeChange">
    </el-pagination>
  </div>
</template>
<script setup>
import ResourceParagraphLine from '../../components/resource/ResourceParagraphLine.vue';
import { ArrowRight } from '@element-plus/icons-vue'
import { ElPagination } from 'element-plus';

import { ref, reactive, onMounted, computed } from 'vue';
import {
  useRoute,
  useRouter
} from "vue-router";
import { courseQueryCriteria } from "../../utils/global-search/course";
import { getCourseByCourseId, getCourseTypeById } from "../../utils/request/course";
import { getResourceAll } from "../../utils/request/resource";

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);
const totalResource = ref(0);

onMounted(() => {
  getResource(courseId);
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
const courseType = ref('')
const courseId = route.params.courseId;
const courseTabActiveName = ref('案例详情')
const currentBreadcrumbName = ref('案例详情')
const operationDate = ref('')
const opetationType = ref('')
const resourceType = ref('')
const courseTypes = [
  { value: '全部', label: '全部' },
  { value: '泌尿外科', label: '泌尿外科' },
  { value: '胸外科', label: '胸外科' },
  { value: '其他', label: '其他' },
]
const opetationTypes = [
  { value: '全部', label: '全部' },
  { value: '肾部分切除', label: '肾部分切除' },
  { value: '肺叶段切除', label: '肺叶段切除' },
  { value: '其他', label: '其他' },
]
const resourceTypeS = [
  { value: 'PPT', label: 'PPT' },
]
const resourceFiles = ref([]);

const getResource = async (courseId) => {
  try {
    const response = await getResourceAll(
      { page: currentPage.value, limit: pageSize.value }
      )
    resourceFiles.value = response.data.results;
    console.log(resourceFiles.value)
    // resourceFiles.value = [
    //   {
    //     id: 1,
    //     resourceName: '测试ppt',
    //     coverImgUrl: 'https://omentor.vico-lab.com:3443/resource/test.png',
    //     createdAt: '2024-01-22T21:24:13.377617+08:00',
    //     url: 'https://omentor.vico-lab.com:3443/resource/test.pptx'
    //   }
    // ]
    totalResource.value = response.data.totalCount;
    // totalResource.value = 1
  } catch (err) {
    console.log(err);
  }
}

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  getResource(courseId);
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  getResource(courseId);
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

.resource-search-bar .el-col span {
  padding-right: 8px;
}

:deep(.el-divider--horizontal) {
  margin: 8px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;  /* 添加适当的上下间距 */
}
</style>
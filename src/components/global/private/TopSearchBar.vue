<template>
  <div class="mt-4">
    <el-row :gutter="20">
      <el-col :span="20" @keydown.enter="confirmClick">
        <el-input v-model="courseQueryCriteria.courseName" placeholder="输入案例名称以搜索" class="input-with-select" clearable>
          <template #append>
            <el-button icon="Search" @click="confirmClick" />
          </template>
        </el-input>
      </el-col>
      <el-col :span="4" style="margin: auto;">
        <el-button type="warning" icon="Refresh" round @click="reset">重置筛选</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { courseQueryCriteria } from "../../../utils/global-search/course";
import { resetQueryCriteria } from "../../../utils/global-search/common";
import {
  useRouter
} from "vue-router";
const router = useRouter();
let reset = () => {
  // resetQueryCriteria(courseQueryCriteria);
  courseQueryCriteria.courseName = ''; // 清空搜索框
}
const confirmClick = () => {
  router.push({
    path: '/search',
    query: {
      typeId: 0,
      courseName: courseQueryCriteria.courseName
    }
  });
}

</script>
<style scoped>
:deep(.el-input__wrapper) {
  border-radius: 23px 0px 0px 23px;
  height: 45px;
  padding: 0px 11px;
}

:deep(.el-input-group__append) {
  border-radius: 0px 23px 23px 0px;
  height: 45px;
}
</style>
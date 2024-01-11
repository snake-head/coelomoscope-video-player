<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-11 15:28:54
-->
<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-07-27 13:18:24
-->
<template>
  <div>
    <FileUploader
      :action="`${baseURL}/data/video/uploadChunk/`"
      :merge-url="`${baseURL}/data/video/mergeChunk/`"
      :verify-url="`${baseURL}/data/video/verifyUpload/`"
      accept="video/*"
      :show-file-list="false"
      v-model:file-list="uploadFileList"
      :before-upload-check="beforeUploadCheck"
      :after-chunk-upload="updateCourseInfo"
      :on-hash-calculated="handleHashCalculated"
      :on-uploading="uploadPercentageListener"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :disabled="uploadDisabled"
    ></FileUploader>

    <el-table :data="uploadFileContext" style="width: 100%">
      <el-table-column prop="name" label="名称" align="center">
        <template #default="scope">
          <el-icon><Document /></el-icon>
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="所属案例" align="center">
        <template #default="scope">
          <el-select v-model="scope.row.courseId" placeholder="选择案例">
            <el-option
              v-for="item in courseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="上传进度" align="center">
        <template #default="scope">
          <div
            v-if="
              scope.row.status === Status.uploading &&
              !scope.row.isHashCalculated
            "
          >
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>计算中</span>
          </div>
          <div v-else>
            <el-progress :percentage="scope.row.uploadPercentage" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="大小" align="center">
        <template #default="{ row }">
          {{ sizeTransfer(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="功能" align="center">
        <template #default="{ row, column, $index }">
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row, column, $index)"
            :disabled="uploadDisabled"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup>
import FileUploader from "../components/utils/FileUploader.vue";
import { ref, computed, onMounted, watch } from "vue";
import { getCourse } from "../utils/request/course";
import { ElMessage } from "element-plus";
import axios from "../utils/request/axios";

const baseURL = import.meta.env.VITE_BASE_URL
const Status = {
  pending: "pending",
  uploading: "uploading",
  finish: "finish",
};

const uploadFileList = ref([]);
const courseOptions = ref([]);
const uploadFileContext = ref([]);

const uploadDisabled = computed(() =>
  uploadFileContext.value.reduce(
    (acc, ctx) => acc || ctx.status === Status.uploading,
    false
  )
);
watch(
  () => uploadFileList.value.length,
  () => {
    const oldList = uploadFileContext.value;
    uploadFileContext.value = uploadFileList.value.map((file) => {
      const courseId =
        oldList.find(({ uid }) => uid === file.uid)?.courseId ?? "";
      const isHashCalculated =
        oldList.find(({ uid }) => uid === file.uid)?.isHashCalculated ?? false;
      const uploadPercentage =
        oldList.find(({ uid }) => uid === file.uid)?.uploadPercentage ?? 0;
      const status =
        oldList.find(({ uid }) => uid === file.uid)?.uploadPercentage ??
        Status.pending;

      return {
        ...file,
        courseId,
        isHashCalculated,
        uploadPercentage,
        status,
      };
    });
  }
);

const getCourseOptions = async () => {
  const courses = (await getCourse()).data.results;
  courseOptions.value = courses?.map((course) => {
    return {
      label: course.courseName,
      value: course.courseId,
    };
  });
};

const handleDelete = (row, column, index) => {
  uploadFileList.value.splice(index, 1);
};

const beforeUploadCheck = () => {
  for (let { courseId } of uploadFileContext.value) {
    if (!courseId) {
      ElMessage.info("请选择视频对应的案例");
      return false;
    }
  }
  return true;
};

const handleBeforeUpload = (rawFile) => {
  const ctx = uploadFileContext.value.find(({ uid }) => uid === rawFile.uid);
  !ctx || (ctx.status = Status.uploading);
};

const handleUploadSuccess = (uploadFile, uploadFiles) => {
  const file = uploadFile ?? uploadFiles;
  const ctx = uploadFileContext.value.find(({ uid }) => uid === file.uid);
  !ctx || (ctx.status = Status.finish);
};

const handleHashCalculated = (uid, container) => {
  const ctx = uploadFileContext.value.find((ctx) => ctx.uid === uid);
  !ctx || (ctx.isHashCalculated = true);
};
const uploadPercentageListener = (uid, container, uploadPercentage) => {
  const ctx = uploadFileContext.value.find((ctx) => ctx.uid === uid);
  !ctx || (ctx.uploadPercentage = uploadPercentage);
};

const updateCourseInfo = (file, resp) => {
  axios({
    method: "patch",
    url: `/data/video/${resp.data.id}`,
    data: {
      courseId:
        uploadFileContext.value.find(({ uid }) => uid === file.uid)?.courseId ??
        "",
    },
  });
};

onMounted(() => {
  getCourseOptions();
});

const sizeTransfer = (limit) => {
  let size = "";
  if (limit < 0.1 * 1024) {
    //小于0.1KB，则转化成B
    size = limit.toFixed(2) + "B";
  } else if (limit < 0.1 * 1024 * 1024) {
    //小于0.1MB，则转化成KB
    size = (limit / 1024).toFixed(2) + "KB";
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    //小于0.1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    //其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }

  var sizeStr = size + ""; //转成字符串
  var index = sizeStr.indexOf("."); //获取小数点处的索引
  var dou = sizeStr.substr(index + 1, 2); //获取小数点后两位的值
  if (dou == "00") {
    //判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
};
</script>
<style lang="css"></style>

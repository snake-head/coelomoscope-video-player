<template>
  <div>
    <el-upload
      multiple
      drag
      :auto-upload="false"
      :http-request="uploadFile"
      :action="action"
      ref="uploader"
      v-bind="$attrs"
    >
      <el-icon :size="40">
        <Upload />
      </el-icon>
      <h4>点击或拖拽到此处上传</h4>
      <template #tip>
        <div style="margin: 8px">
          <el-button @click="startUpload" type="primary" :disabled="$attrs.disabled">
            <h4 v-if="$attrs.disabled">上传中</h4>
            <h4 v-else>开始上传</h4>
          </el-button>
        </div>
      </template>
    </el-upload>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { useFileUpload, SIZE } from "../../utils/request/fileUpload";

const props = defineProps({
  action: {
    type: String,
    required: true,
  },
  mergeUrl: {
    type: String,
  },
  verifyUrl: {
    type: String,
  },
  courseId: {
    type: String,
  },
  beforeUploadCheck: {
    type: Function,
    default: () => true,
  },
  afterChunkUpload: {
    type: Function,
    default: (file, resp) => {},
  },
  onHashCalculated: {
    type: Function,
    default: (uid, container) => {},
  },
  onUploading: {
    type: Function,
    default: (uid, container, uploadPercentage) => {},
  },
});

const uploader = ref();

const extractExt = (filename) =>
  filename.slice(filename.lastIndexOf("."), filename.length);

const startUpload = () => {
  if (!props.beforeUploadCheck()) {
    return;
  }
  uploader.value.submit();
};

const uploadFile = async (options) => {
  const { container, handleUpload, uploadPercentage } = useFileUpload();

  const { file } = options;
  if (!file) {
    return;
  }
  container.file = file;
  container.ext = extractExt(file.name);

  watch(
    () => container.hash,
    (hash) => {
      if (hash) {
        props.onHashCalculated(file.uid, container);
      }
    }
  );
  props.onUploading(file.uid, container, uploadPercentage);
  const resp = await handleUpload(
    props.action,
    props.mergeUrl,
    props.verifyUrl,
    props.courseId
  );
  props.afterChunkUpload(file, resp);
};
</script>
<style lang="css"></style>

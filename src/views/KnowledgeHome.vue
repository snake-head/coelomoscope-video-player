<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-09-08 12:14:02
-->
<template>
  <div>
    <el-container class="main-container">
      <div class="header-placeholder"></div>
      <el-header class="custom-header">
        <KnowledgeFunctionBar />
        <TopMenu />
      </el-header>
      <el-main class="custom-main">
        <RouterView></RouterView>
      </el-main>
    </el-container>
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import KnowledgeFunctionBar from '../components/global/KnowledgeFunctionBar.vue';
import TopMenu from '../components/global/TopMenu.vue';
const route = useRoute();
const isFunctionBarShow = ref(true);
const showFunctionBarPages = ['Home', 'CourseSearch'];
watch(() => route.name, (newVal, oldVal) => {
  isFunctionBarShow.value = showFunctionBarPages.includes(newVal);
}, { immediate: true });
</script>
<style lang="css" scoped>
.main-container {
  direction: vertical;
  background-color: #f8f9fa;
  padding: 0;
}
.custom-header {
  padding: 0;
  position: absolute;
  width: 100%;
  z-index: 1000;
  top: 0;
}

.header-placeholder {
  height: 106px; /* 根据您的实际情况设置与 el-header 相同的高度 */
}

.custom-main {
  padding: 0;
}
</style>
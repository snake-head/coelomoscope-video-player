<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-12 15:58:35
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
      <el-footer class="custom-footer">
        <FooterBar />
      </el-footer>
    </el-container>
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import KnowledgeFunctionBar from '../components/global/KnowledgeFunctionBar.vue';
import FooterBar from "../components/global/FooterBar.vue";
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
  background-color: white !important;
  padding: 0;
  position: absolute;
  width: 100%;
  z-index: 1000;
  top: 0;
}

.header-placeholder {
  height: 106px; /* 根据您的实际情况设置与 el-header 相同的高度 */
  background-color: #f8f9fa;
}

.custom-main {
  padding: 0;
  min-height: 710px;
  overflow: hidden;
}
.custom-footer {
    text-align: center;
    background-color: #ccc; /* 这里可以替换为你想要的灰色背景色值 */
    /* padding: 0; */
  }
</style>
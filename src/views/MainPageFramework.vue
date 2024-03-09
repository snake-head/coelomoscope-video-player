<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-12 15:54:49
-->
<template>
  <div>
    <el-container direction="vertical" class="main-page-container">
      <div class="header-placeholder"></div>
      <el-header class="custom-header">
        <TopFunctionBar v-if="isFunctionBarShow" />
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
import TopFunctionBar from '../components/global/TopFunctionBar.vue';
import TopMenu from '../components/global/TopMenu.vue';
import FooterBar from "../components/global/FooterBar.vue";
const route = useRoute();
const isFunctionBarShow = ref(true);
const showFunctionBarPages = ['Home', 'CourseSearch'];
watch(() => route.name, (newVal, oldVal) => {
  isFunctionBarShow.value = showFunctionBarPages.includes(newVal);
}, { immediate: true });
</script>
<style lang="css" scoped>
.custom-header {
  background-color: white;
  padding: 0;
  position: fixed;
  width: 100%;
  z-index: 1000;
  top: 0;
}

.header-placeholder {
  height: 64px; /* 根据您的实际情况设置与 el-header 相同的高度 */
}
 .custom-footer {
    text-align: center;
    background-color: #ccc; /* 这里可以替换为你想要的灰色背景色值 */
    padding: 0;
    }
.custom-main {
  min-height: 710px;
}
</style>
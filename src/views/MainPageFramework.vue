<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: MaZhe
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
  <div id="app">
 <!-- Include DraggableButton and Modal components -->
    <DraggableButton ref="draggableButton" :canDrag="!isModalVisible" @toggleModal="toggleModal" />

    <Modal :visible="isModalVisible" @closeModal="toggleModal">
      <AitoolsPage />  <!-- 通过插槽传入浮窗内容 -->
    </Modal>
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import TopFunctionBar from '../components/global/TopFunctionBar.vue';
import TopMenu from '../components/global/TopMenu.vue';
import FooterBar from "../components/global/FooterBar.vue";
import DraggableButton from '../components/global/DraggableButton.vue';
import Modal from '../components/global/Modal.vue';
import AitoolsPage from '../views/content/AitoolsPage.vue';
const route = useRoute();
const isFunctionBarShow = ref(true);
const showFunctionBarPages = ['Home', 'CourseSearch'];

watch(() => route.name, (newVal, oldVal) => {
  isFunctionBarShow.value = showFunctionBarPages.includes(newVal);
}, { immediate: true });

const isModalVisible = ref(false);

const toggleModal = (status) => {
  isModalVisible.value = status;
};

// 用于访问子组件的ref
const draggableButton = ref(null);


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
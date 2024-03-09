<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-01 10:28:00
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-12 15:12:11
-->
<template>
  <div class="function-bar">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="home-icon" @click="toHome(router)">
          <el-icon :size="40">
            <img src="/src/assets/top.png" alt="Your Image" />
          </el-icon>
        </div>
      </el-col>
      <el-col :span="18">
        <KnowledgeSearchBar></KnowledgeSearchBar>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import KnowledgeSearchBar from './private/KnowledgeSearchBar.vue';
import { toHome } from "../../utils/router/routeJumper";
import {
  useRouter
} from "vue-router";
const router = useRouter();
</script>
<style lang="css" scoped>
.home-icon {
  cursor: pointer;
  justify-content: center; /* 水平居中 */
  display: flex;
}
img {
  margin-top: 5px;
  width: 400px; /* 设置图像的宽度 */
  height: auto; /* 让浏览器自动计算高度以保持原始宽高比 */

}
.function-bar {
  background-color: rgb(255, 255, 255);
}
</style>
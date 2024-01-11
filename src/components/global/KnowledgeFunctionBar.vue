<template>
  <div class="function-bar">
    <el-row :gutter="20">
      <el-col :span="2">
        <div class="home-icon" @click="toHome(router)">
          <el-icon :size="40">
            <HomeFilled />
          </el-icon>
        </div>
      </el-col>
      <el-col :span="22">
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
}
.function-bar {
  background-color: rgb(255, 255, 255);
}
</style>
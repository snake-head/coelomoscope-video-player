<template>
  <div>
    <AccountFramework active-menu-index="/account/experience">
      <template #main>
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon :size="24">
                <Document />
              </el-icon>
              <h3>学习履历</h3>
            </div>
          </template>
          
          <div class="experience-body">
            <!-- 学习履历 -->
            <div v-if="learningHistory.length > 0" class="learning-history">
              <div v-for="(entry, index) in learningHistory" :key="index" class="history-entry">
                <div class="entry-header">
                  <p class="video-title" @click="goToVideo(entry.cid)">
                    {{ entry.date }} - {{ entry.videoTitle }}
                  </p>
                  <p class="progress-text">学习进度: {{ entry.progress }}%</p>
                </div>
                <el-progress :percentage="entry.progress"></el-progress>
              </div>
            </div>
            <el-empty v-else description="暂无数据"></el-empty>
          </div>
        </el-card>
      </template>
    </AccountFramework>
  </div>
</template>

<script setup>
import AccountFramework from '../components/account/AccountFramework.vue';
import { ref } from 'vue';
import { Document } from '@element-plus/icons-vue';

const learningHistory = ref([
  { cid: 'cid2403383', date: '2024-10-06', videoTitle: '胃镜检查术', progress: 68 },
  { cid: 'cid7105224', date: '2024-10-02', videoTitle: '大肠息肉内镜治疗术', progress: 55 },
  { cid: 'cid7475064', date: '2024-09-28', videoTitle: '前列腺根治术', progress: 79 },
  { cid: 'cid202307271405', date: '2024-09-24', videoTitle: '肺叶段切除', progress: 99 },
  { cid: 'cid202308011054', date: '2024-09-20', videoTitle: '肾上腺切除', progress: 100 }
]);

const goToVideo = (cid) => {
  window.location.href = `https://omentor.vico-lab.com:3443/course/${cid}`;
};
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
}

.card-header h3 {
  margin-left: 10px;
}

.experience-body {
  margin-top: 10px;
}

.learning-history {
  margin-top: 10px;
}

.history-entry {
  margin-bottom: 20px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

/* 添加鼠标悬停效果 */
.video-title {
  font-size: 16px;
  cursor: pointer;
  color: black;
  transition: color 0.3s ease, text-decoration 0.3s ease;
}

.video-title:hover {
  color: blue; /* 悬停时字体变为蓝色 */
  text-decoration: underline; /* 悬停时加下划线 */
}

.progress-text {
  font-size: 14px;
  color: #606266;
}
</style>

<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-08-01 11:27:34
-->
<template>
  <div>
    <el-space wrap>
      <div v-for="video in videos" :key="video.videoNumber">
        <div class="video-card">
          <VideoCoverCard :video="video"></VideoCoverCard>
          <div class="link-font__outer">
            <el-link type="default" :href="`/video/${video.videoId}/play`" :underline="false">
              <div class="link-font">
                {{ video.videoName }}
              </div>
            </el-link>
          </div>
        </div>
      </div>
    </el-space>
  </div>
</template>
<script setup>
import { getTypeName } from '@/utils/mockVideoInfo.js';
import VideoCoverCard from './VideoCoverCard.vue';
defineProps({
  videos: {
    type: Array,
    required: true,
  }
})

</script>
<style scoped>
.video-card {
  width: 250px;
  margin: 8px;
}

.link-font {
  font-size: medium;
  font-weight: bold;
}

.link-font__outer {
  text-align: center;
  margin-top: 5px;
}
</style>
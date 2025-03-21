<template>
  <div class="video-info-line">
    <div class="video-cover">
      <VideoCoverCard :video="video" />
    </div>
    <div class="video-info">
      <div class="video-info__left">
        <span class="video-name">{{ video.videoName }}</span>
        <!-- <span class="operator-name">主刀医生：张三</span> -->
        <span class="remarks">备注：XXX</span>
      </div>
      <div class="video-info__mid">
        <span class="patient-age">受术者年龄：xx</span>
      </div>
      <div class="video-info__right">
        <span class="video-length">视频时长：</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import VideoCoverCard from './VideoCoverCard.vue';
defineProps({
  video: {
    type: Object,
    required: true,
  }
})
</script>
<style lang="css" scoped>
.video-cover {
  width: 200px;
  margin: 8px;
}

.video-info-line {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.video-info__left {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.video-info {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex: auto;
}
</style>
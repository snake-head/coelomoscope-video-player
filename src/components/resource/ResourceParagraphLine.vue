<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2024-05-13 17:12:21
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-05-23 15:41:05
-->
<template>
    <div class="video-info-line">
      <div class="video-cover">
        <ResourceCoverCard :resource="resource" />
      </div>
      <div class="video-info">
        <div class="video-info__left">
          <span class="video-name">{{ resource.resourceName }}</span>
          <span class="operator-name">类型：无</span>
          <span class="remarks">术种：无</span>
        </div>
        <div class="video-info__mid">
          <span class="patient-age">资源类型：PPT</span>
        </div>
        <div class="video-info__right">
          <span class="video-length">备注：无</span>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import ResourceCoverCard from './ResourceCoverCard.vue';
  defineProps({
    resource: {
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
    min-width: 150px;
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
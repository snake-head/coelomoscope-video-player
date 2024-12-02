<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-01 12:52:35
 * @LastEditors: MaZhe
 * @LastEditTime: 2024-07-18 14:47:05
-->
<template>
  <div>
    <h3>{{ firstChar }}</h3>
    <div class="subpages-column">
      <el-link
        v-for="(pageName, index) in subpages"
        :key="index"
        :href="`/knowledge/${pageName}/content`"
        type="default"
        :underline="true"
      >
        <span class="subpage-link">{{ pageName }}</span>
      </el-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  subpages: {
    type: Array,
    required: true,
  },
});

function getFirstChar(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return null;
  }
  const firstChar = str.charAt(0);
  return /^[a-zA-Z]+$/.test(firstChar) ? firstChar.toUpperCase() : firstChar;
}

const firstChar = computed(() => getFirstChar(props.subpages[0]));
</script>

<style scoped>
.subpages-column {
  display: flex;
  flex-direction: column; /* 设置为纵向排列 */
  gap: 0.5em; /* 控制每个子项之间的间距 */
}

.el-link {
  width: fit-content !important;
}

.subpage-link {
  font-family: "STSong", "华文中宋", serif; /* 确保标题使用华文中宋 */
  /*font-family: Inter, Avenir, Helvetica, Arial, sans-serif;*/
  font-size: medium;
  color: #3366cc;
  white-space: nowrap; /* 确保文字内容横向显示 */
}
</style>
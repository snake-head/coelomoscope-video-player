<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-01 12:52:35
 * @LastEditors: MaZhe
 * @LastEditTime: 2024-07-18 14:47:05
-->
<template>
  <div class="main-container">
    <header class="my-header">
      <h1 class="first-heading">
        <span class="mw-page-title-namespace">分类:{{ category.categoryName }}</span>
      </h1>
    </header>
    <p>本分类含有 {{ subpageLinksLength }} 个页面。</p>
    <div class="category-container">
      <div class="subpage-link-box" v-for="(subpages, index) in filteredSubpages" :key="index">
        <div class="subpages-container">
          <SubGroup :subpages="subpages" />
        </div>  
      </div>
    </div>
  </div>
</template>

<script setup>
import SubGroup from './SubGroup.vue';
import { computed } from 'vue';

const props = defineProps({
  category: {
    type: Object,
    required: true,
  }
});

const subpageLinksLength = computed(() => props.category.subpages.length);

function filterByFirstChar(stringList) {
  // 创建一个空对象，用于存储分组后的子列表
  const groupedLists = {};

  // 遍历字符串列表
  stringList.forEach((str) => {
    // 获取字符串的首字母或第一个汉字
    const firstChar = str.charAt(0);

    // 如果首字母是中文字符，可以使用正则表达式来判断是否为中文
    if (/[\u4e00-\u9fa5]/.test(firstChar)) {
      // 使用中文字符的首字母作为键
      const key = firstChar;
      // 如果键不存在，则创建一个新的数组
      groupedLists[key] = groupedLists[key] || [];
      // 将字符串添加到相应的子列表中
      groupedLists[key].push(str);
    } else {
      // 使用英文字符的首字母作为键，将小写字母转换为大写，以便区分大小写
      const key = firstChar.toUpperCase();
      // 如果键不存在，则创建一个新的数组
      groupedLists[key] = groupedLists[key] || [];
      // 将字符串添加到相应的子列表中
      groupedLists[key].push(str);
    }
  });

  // 现在，groupedLists 包含了按首字母或汉字分组后的子列表
  return groupedLists;
}

const filteredSubpages = computed(() => filterByFirstChar(props.category.subpages));
</script>

<style scoped>
.main-container {
  padding: 0 50px;
  text-align: left;
  font-family: "STSong", "华文中宋", serif; /* 设置字体为华文中宋 */
}

.my-header {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  box-shadow: 0 1px #a2a9b1;
  align-items: center;
  margin-bottom: 5px;
}

.category-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 使每个子版块最小宽度为300px */
  gap: 1em; /* 控制子版块之间的间距 */
  margin-top: 1em;
}

.subpage-link-box {
  display: flex;
  flex-direction: column;
  border: none;
}

.subpages-container {
  padding: 0.5em;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.subpages-container:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.subpages-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1em; /* 控制每个 subpage 间的间距 */
}

.subpage-item {
  font-size: 1em;
  color: #666;
  white-space: normal; /* 允许文字正常换行 */
  word-break: break-word; /* 防止文字过长而溢出 */
}

.first-heading {
  margin-bottom: 10px; /* 添加底部间距 */
  text-align: left; /* 将标题文本靠左对齐 */
  font-size: 1.8em;
  font-family: "STSong", "华文中宋", serif; /* 确保标题使用华文中宋 */
  /*font-family: 'Linux Libertine', 'Georgia', 'Times', serif;*/
  line-height: 1.375;
  font-weight: normal;
}
</style>

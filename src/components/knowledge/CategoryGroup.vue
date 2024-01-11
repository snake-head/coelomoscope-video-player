<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-01 12:52:35
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-09-04 14:52:40
-->
<template>
  <div class="main-container">
    <header class="my-header">
      <h1 class="first-heading">
        <span class="mw-page-title-namespace">分类:{{ category.categoryName }}</span>
      </h1>
    </header>
    <p>本分类含有{{ subpageLinksLength }}个页面。</p>
    <div class="category-container">
      <div class="subpage-link-box" v-for="(subpages, index) in fiteredSubpages" :key="index">
        <div>
          <SubGroup :subpages="subpages" />
        </div>  
      </div>
    </div>
  </div>
</template>
<script setup>
import SubGroup from './SubGroup.vue';
import { ref, reactive, onMounted, computed } from 'vue';
defineProps({
  category: {
    type: Object,
    required: true,
  }
})
const subpages = ref([
  '肾上腺',
  '前列腺癌',
  '前列腺',
  '肾癌',
  '膀胱',
  '睾丸',
])

const subpageLinksLength = computed(() => subpages.value.length);

function filterByFirstChar(stringList){
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
  return groupedLists
}

const fiteredSubpages = computed(()=>filterByFirstChar(subpages.value))

// onMounted(()=>{
//   filterByFirstChar(subpages.value)
// })
</script>
<style>
.main-container {
  padding: 0 50px;
  text-align: left;
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
  display: flex;
  flex-direction: row; /* 主轴方向为垂直列排列 */
  flex-wrap: wrap; /* 当容器宽度不足时换行 */
}

.subpage-link-box {
  display: inline-block;
  width: 33%;
  height: 100px;
  border: none;
  margin-bottom: 20px;
  /* 可以添加更多的样式属性 */
}

.first-heading{
  margin-bottom: 10px; /* 添加底部间距 */
  text-align: left; /* 将标题文本靠左对齐 */
  font-size: 1.8em;
  font-family: 'Linux Libertine','Georgia','Times',serif;
  line-height: 1.375;
  font-weight: normal;
}
</style>
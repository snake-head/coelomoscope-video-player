<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-08-31 22:43:50
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-07-25 13:04:19
-->
<template>
  <div class="category-display-table">
    <div class="category-display-table-row" v-for="category in categories" :key="category.categoryId">
      <div class="category-display-table-row__item">
        <CategoryGroup :category="category" />
      </div>
    </div>
  </div>
</template>


<script setup>
import CategoryGroup from '../../components/knowledge/CategoryGroup.vue';
import { ref } from 'vue';

const categories = ref([
  {
    categoryName: '泌尿外科',
    categoryId: 0,
    subpages: ['肾上腺', '前列腺癌', '前列腺', '肾癌', '膀胱', '睾丸']
  },
  {
    categoryName: '肝胆系统',
    categoryId: 1,
    subpages: ['肝炎', '肝硬化', '胆结石', '肝癌', '胆囊炎']
  },
  {
    categoryName: '脾腺疾病',
    categoryId: 2,
    subpages: ['脾功能亢进', '脾破裂', '脾肿瘤', '脾炎', '脾脏手术']
  },
  {
    categoryName: '胃肠外科',
    categoryId: 3,
    subpages: ['胃癌', '残胃癌', '胃及十二指肠溃疡', '胃灼热']
  },
  {
    categoryName: '妇科疾病',
    categoryId: 4,
    subpages: ['月经失调', '卵巢囊肿', '子宫肌瘤', '子宫内膜异位症', '妇科肿瘤']
  },
  {
    categoryName: '胸外科',
    categoryId: 5,
    subpages: ['肺癌', '支气管镜检查', '胸痛', '胸部X光']
  }
]);
</script>

<style scoped>
.category-display-table {
  font-family: "STSong", "华文中宋", serif; /* 设置为华文中宋字体 */
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每行最多显示 3 个板块 */
  gap: 1em; /* 控制板块之间的间距 */
  max-width: 90%; /* 占据整个页面的 90% 宽度 */
  margin: 0 auto;
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 8px;
}


.category-display-table-row {
  display: flex;
  align-items: stretch;
}

.category-display-table-row__item {
  flex-grow: 1;
  padding: 1em;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  word-break: break-word; /* 防止文字过长导致溢出 */
}

.category-display-table-row__item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.category-display-table-row__item h3 {
  margin-top: 0;
  font-size: 1.2em;
  color: #333;
  font-weight: 600;
  text-align: center;
}

.category-display-table-row__item p {
  line-height: 1.5;
  margin: 0;
  color: #666;
  font-size: 0.9em;
  word-wrap: break-word; /* 确保长文字在宽度不足时换行 */
}

/* 媒体查询，确保在小屏幕时每个板块宽度足够 */
/* 使用媒体查询确保在小屏幕上板块适应性显示 */
@media (max-width: 1500px) {
  .category-display-table {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕每行显示 2 个板块 */
  }
}

@media (max-width: 1200px) {
  .category-display-table {
    grid-template-columns: 1fr; /* 小屏幕每行显示 1 个板块 */
  }
}

</style>

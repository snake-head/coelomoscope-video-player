<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-08-31 22:43:50
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-09-08 13:01:35
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
import { ref, reactive, onMounted, computed } from 'vue';
const categories = ref([
  {
    categoryName: '泌尿外科',
    categoryId: 0,
  },
  {
    categoryName: '胃肠外科',
    categoryId: 1,
  }
])
</script>
<style>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.category-display-table{
  position: relative;
  z-index: 0;
  padding-top: 0;
  padding-bottom: 0.05px;
  max-width: 99.75em;
  min-width: 31.25em;
  margin: 0 auto;
  padding-left: 1.5em;
  padding-right: 1.5em;
  background-color: #ffffff;
  box-sizing: border-box;
}
.category-display-table-row__item {
  margin-bottom: 10px;
}
</style>

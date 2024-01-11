<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-01 12:52:35
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-09-08 13:13:15
-->
<template>
   <div>
    <h3>{{ firstChar }}</h3>
    <ul>
        <li v-for="(pageName, index) in subpages" :key="index">
            <el-link type="default" :href="`/knowledge/${pageName}/content`" :underline="true">
                <span class="subpage-link">{{ pageName }}</span>
            </el-link>
        </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
const props = defineProps({
subpages: {
    type: Array,
    required: true,
}
})

function getFirstChar(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return null; // 返回 null 或其他适当的默认值
  }

  const firstChar = str.charAt(0); // 获取字符串的首个字符

  if (/^[a-zA-Z]+$/.test(firstChar)) {
    // 如果首个字符是英文字母，将其转换为大写
    return firstChar.toUpperCase();
  }

  return firstChar; // 如果不是英文字母，则保持不变
}

const firstChar = computed(()=>getFirstChar(props.subpages[0]))
</script>
<style>
.el-link{
  width: fit-content !important;
}
.el-link__inner {
  justify-content: left;
  width: auto;
}
.subpage-link {
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    font-size: medium;
    color: #3366cc;
}
</style>
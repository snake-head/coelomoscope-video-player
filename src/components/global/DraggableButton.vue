<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: MaZhe
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: MaZhe
 * @LastEditTime: 2024-01-12 15:15:06
-->
<template>
  <div class="button-container" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <button 
      ref="agent"
      class="draggable"
      :disabled="!canDrag"  
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="handleClick"
    >
      <img src="/agent.png" alt="AI Agent Icon" />
    </button>

    <!-- Tooltip -->
    <div v-show="showTooltip" 
         class="tooltipAgent"
         ref="tooltipAgent"
         :style="tooltipStyle">
      我是AI助手，欢迎来问我问题
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Emit事件，控制显示浮窗
const emit = defineEmits(['toggleModal']);

// 获取按钮的引用
const agent = ref(null);

// 控制对话框显示状态
const showTooltip = ref(false);

// 获取tooltip元素
const tooltipAgent = ref(null);

// 存储 tooltip 的位置样式
const tooltipStyle = ref({
  position: 'absolute',
  top: '0px',
  left: '0px',
  visibility: 'hidden',
  opacity: '0',
  transition: 'visibility 0s, opacity 0.3s ease',
});

// 控制是否允许拖动
const { canDrag } = defineProps({
  canDrag: {
    type: Boolean,
    required: true
  }
});

// 存储拖动状态
const isDragging = ref(false);
const initialX = ref(0);
const initialY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);

let isMoved = ref(false); // 判断是否拖动

// 允许的最小移动距离（像素）
const dragThreshold = 5;


const showModal = () => {
  emit('toggleModal', true);
};

// 处理按钮点击显示浮窗
const handleClick = (event) => {
  if (!isMoved.value) {
    // 如果没有移动过，就认为是点击，显示浮窗
    showModal();
  }
  isMoved.value = false; // 重置判断
};

// 开始拖动
const startDrag = (event) => {
  if (!canDrag) return; // 如果不能拖动，跳过

  // 只有在鼠标按下时，才能开始拖动
  console.log("startDrag triggered");
  isDragging.value = true; // 开始拖动
  const e = event.type === 'mousedown' ? event : event.touches[0];

  initialX.value = e.clientX;
  initialY.value = e.clientY;

  // 获取按钮的位置偏移量
  offsetX.value = e.clientX - agent.value.getBoundingClientRect().left;
  offsetY.value = e.clientY - agent.value.getBoundingClientRect().top;

  // 初始化按钮位置立即跟随鼠标
  agent.value.style.left = `${e.clientX - offsetX.value}px`;
  agent.value.style.top = `${e.clientY - offsetY.value}px`;

  // Log for debugging
  console.log("Initial Position:", e.clientX, e.clientY);
  console.log("Offset:", offsetX.value, offsetY.value);

  // 监听鼠标移动和触摸移动事件
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
};

// 拖动过程中更新按钮位置
const onDragMove = (event) => {
  event.preventDefault();  // 阻止默认行为，防止事件被中断

  if (!isDragging.value || !agent.value) return;

  const e = event.type === 'mousemove' ? event : event.touches[0];
  const dx = e.clientX - initialX.value;
  const dy = e.clientY - initialY.value;

  // 更新 initialX 和 initialY，以便下一次移动计算
  initialX.value = e.clientX;
  initialY.value = e.clientY;

  // 如果移动的距离超过阈值，认为是拖动
  if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
    isMoved.value = true; // 标记为拖动
    // 更新按钮的位置
    agent.value.style.left = `${e.clientX - offsetX.value}px`;
    agent.value.style.top = `${e.clientY - offsetY.value}px`;
    // 更新tooltip位置
    updateTooltipPosition();
  }
};


// 停止拖动
const stopDrag = () => {
  isDragging.value = false;

  // 移除事件监听
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('touchend', stopDrag);
};

// 更新 tooltip 的位置
const updateTooltipPosition = () => {
  const agentElement = agent.value;
  const tooltipElement = tooltipAgent.value;

  if (!agentElement || !tooltipElement) return;

  const rect = agentElement.getBoundingClientRect();

  // 更新 tooltip 的位置，保持与按钮相对位置不变
  tooltipStyle.value = {
    position: 'fixed', // 固定定位
    top: `${rect.top - 50}px`, // 距离按钮上方 50px
    left: `${rect.left + rect.width / 2 }px`, // 水平居中
    visibility: showTooltip.value ? 'visible' : 'hidden',
    opacity: showTooltip.value ? 1 : 0,
    zIndex: 1001, // 确保 tooltip 层级高于其他元素
  };
};

// 鼠标进入按钮时显示 tooltip
const handleMouseEnter = () => {
  showTooltip.value = true;
  updateTooltipPosition();
};

// 鼠标离开按钮时隐藏 tooltip
const handleMouseLeave = () => {
  showTooltip.value = false;
  updateTooltipPosition();
};
</script>


<style scoped>
.button-container {
  position: relative;
  display: inline-block;  /* 确保它是 inline-block */
}


.tooltipAgent {
  position: fixed;

  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;

  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
}

.button-container:hover .tooltipAgent {
  visibility: visible;
  opacity: 1;
}

button {
  width: 120px;
  height: 100px;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  position: fixed;
  left: 20px;
  bottom: 20px;
  transition: background-color 0.3s ease;
  z-index: 9999;
}

button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 拖动时的光标样式 */
.draggable {
  cursor: grab;
}

.draggable:active {
  cursor: grabbing;
}
</style>


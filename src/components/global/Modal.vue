<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: MaZhe
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-12-02 13:35:09
-->
<template>
  <div v-if="visible" class="modal" @mouseup="stopDrag" @touchend="stopDrag">
    <div class="modal-header" @mousedown.prevent="startDrag" @touchstart.prevent="startDrag">
      AI Agent
    </div>
    <button class="close-btn" @click="closeModal">关闭</button>
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
</template>

  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  
  const props = defineProps({
    visible: Boolean
  });
  
  const emit = defineEmits(['closeModal']);
  
  const offsetX = ref(0);
  const offsetY = ref(0);
  const isDragging = ref(false);
  
  // Start dragging (mousedown or touchstart)
  const startDrag = (event) => {
    isDragging.value = true;
  
    const e = event.type === 'mousedown' ? event : event.touches[0]; // Handle touchstart event
    const header = e.target.closest('.modal-header');
    if (header) {
      const modal = header.closest('.modal');
      offsetX.value = e.clientX - modal.offsetLeft;
      offsetY.value = e.clientY - modal.offsetTop;
  
      // Add mousemove or touchmove event listener to document
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
    }
  };
  
  // Stop dragging (mouseup or touchend)
  const stopDrag = () => {
    isDragging.value = false;
  
    // Remove mousemove or touchmove event listener from document
    document.removeEventListener('mousemove', dragWindow);
    document.removeEventListener('touchmove', dragWindow);
  };
  
  // Drag window (mousemove or touchmove)
  const dragWindow = (event) => {
    if (isDragging.value) {
      event.preventDefault();
  
      const e = event.type === 'mousemove' ? event : event.touches[0]; // Handle touchmove event
      const modal = document.querySelector('.modal');
      modal.style.left = `${e.clientX - offsetX.value}px`;
      modal.style.top = `${e.clientY - offsetY.value}px`;
    }
  };
  
  const closeModal = () => {
    emit('closeModal', false); // Close the modal
  };
  
  // Clean up event listeners before component is destroyed
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', dragWindow);
    document.removeEventListener('touchmove', dragWindow);
  });
  
  </script>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 70%;
  transform: translate(-50%, -50%);
  width: 43%;
  height: 85%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  z-index: 9999; /* 设定浮窗的 z-index 确保浮窗在最上层 */
  cursor: default; /* 默认移动光标 */
  border: 5px solid #274e6a; /* 添加边框，颜色可以根据需求修改 */
}


.modal-header {
    position: absolute; /* Fix the header at the top */
    top: -1px;
    left: 0;
    width: 100%; /* Header width matches modal */
    height: 40px; /* Adjust the height of the header */
    background-color: rgb(150, 208, 229);
    color: white;
    text-align: center;
    line-height: 40px;
    font-size: 16px;
    user-select: none; /* Prevent text selection */
    z-index: 10000; /* 确保横条在最上层 */
    cursor: move; /* 鼠标放在横条上时显示移动光标 */
}

.close-btn {
position: absolute;
top: 2px;
right: 10px;
background: rgb(51, 95, 97);
color: white;
border: none;
padding: 5px;
cursor: pointer;
z-index: 10001; /* 确保横条在最上层 */
}

.modal-content {
width: 60%;
flex-grow: 1;
height: calc(100% - 40px); /* 内容区高度减去横条的高度 */
background: white;
border-radius: 8px;
overflow-y: auto;
padding: 20px;
}
</style>
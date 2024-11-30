<template>
  <div class="chat-container">
    <div class="mode-selector">
      <button :class="['mode-btn', mode === 'chat' ? 'active' : '']" @click="switchMode('chat')">AI助手模式</button>
      <button :class="['mode-btn', mode === 'image' ? 'active' : '']" @click="switchMode('image')">文生图模式</button>
    </div>
    <div class="chat-messages" ref="messageContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.type === 'sent' ? 'sent' : 'received']"
      >
        <el-icon class="avatar-icon">
          <User v-if="message.type === 'sent'" />
          <Avatar v-else />
        </el-icon>
        <div class="message-content">
          <img v-if="message.image" :src="message.image" class="generated-image" />
          <span v-else>{{ message.text }}</span>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input
        type="text"
        v-model="newMessage"
        @keyup.enter="sendMessage"
        :placeholder="mode === 'chat' ? '输入问题...' : '输入图片描述...'"
      />
      <button @click="sendMessage" class="send-button">
        <el-icon><Promotion /></el-icon>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';
import { Avatar, User, Promotion } from '@element-plus/icons-vue';

export default {
  components: {
    Avatar,
    User,
    Promotion,
  },
  setup() {
    const messages = ref([]);
    const newMessage = ref('');
    const mode = ref('chat'); // 'chat' 或 'image'
    const messageContainer = ref(null);

    const switchMode = (newMode) => {
      mode.value = newMode;
      messages.value = []; // 切换模式时清空消息
    };

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        messages.value.push({
          text: newMessage.value,
          type: 'sent',
        });

        if (mode.value === 'chat') {
          // AI助手模式
          setTimeout(() => {
            messages.value.push({
              text: '这是一条AI助手的回复消息',
              type: 'received',
            });
            scrollToBottom();
          }, 1000);
        } else {
          // 文生图模式
          setTimeout(() => {
            messages.value.push({
              image: 'https://via.placeholder.com/300', // 这里替换为实际的图片生成API
              type: 'received',
            });
            scrollToBottom();
          }, 1000);
        }

        newMessage.value = '';
        nextTick(() => {
          scrollToBottom();
        });
      }
    };

    const scrollToBottom = () => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    };

    return {
      messages,
      newMessage,
      mode,
      switchMode,
      sendMessage,
      messageContainer,
    };
  },
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 1200px;
  height: 900px;
  margin: 0 auto;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding-top: 20px; /* 添加顶部内边距 */
}

.mode-selector {
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.mode-btn {
  padding: 8px 16px;
  border: 1px solid #007AFF;
  border-radius: 5px;
  background-color: white;
  color: #007AFF;
  cursor: pointer;
}

.mode-btn.active {
  background-color: #007AFF;
  color: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.message {
  margin: 15px 0;
  display: flex;
  align-items: center;
}

.message.sent {
  flex-direction: row-reverse;
}

.avatar-icon {
  font-size: 24px;
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  word-wrap: break-word;
  text-align: left;
}

.generated-image {
  max-width: 300px;
  border-radius: 10px;
}

.sent .message-content {
  background-color: #007AFF;
  color: white;
}

.received .message-content {
  background-color: white;
  color: black;
}

.chat-input {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
}

.chat-input button {
  padding: 10px 20px;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #0056b3;
}
</style>
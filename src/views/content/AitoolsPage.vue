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
          <div v-else v-html="md.render(message.text)"></div>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <button @click="clearHistory" class="clear-history-button">清空历史</button>
      <!-- 根据模式显示不同的输入界面 -->
      <div v-if="mode === 'chat'" class="single-input">
        <input
          type="text"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          :placeholder="'输入问题...'"
        />
        <button @click="sendMessage" class="send-button">
          <el-icon><Promotion /></el-icon>
        </button>
      </div>
      <div v-else class="triplet-input">
        <select v-model="selectedEquipment" class="select-input">
          <option disabled value="">请选择器械</option>
          <option v-for="item in equipments" :key="item" :value="item">{{ item }}</option>
        </select>
        <select v-model="selectedAction" class="select-input">
          <option disabled value="">请选择动作</option>
          <option v-for="item in actions" :key="item" :value="item">{{ item }}</option>
        </select>
        <select v-model="selectedBodyPart" class="select-input">
          <option disabled value="">请选择部位</option>
          <option v-for="item in bodyParts" :key="item" :value="item">{{ item }}</option>
        </select>
        <button @click="sendTriplet" class="send-button">
          <el-icon><Promotion /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from 'vue';
import { Avatar, User, Promotion } from '@element-plus/icons-vue';
import OpenAI from 'openai';
import MarkdownIt from 'markdown-it'; // 添加这行
const md = new MarkdownIt(); 
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_API_KEY
});

export default {
  components: {
    Avatar,
    User,
    Promotion,
  },
  setup() {
    const chatMessages = ref([]);
    const imageMessages = ref([]);
    const newMessage = ref('');
    const mode = ref('chat'); // 'chat' 或 'image'
    const messageContainer = ref(null);
    
    // 系统提示
    const systemPrompt = "你是微创手术视频示教平台的ai助手，你需要回答用户所有关于医学或手术相关的问题，其他问题你可以拒绝回答。";

    const loadHistory = () => {
      const chatHistory = localStorage.getItem('chatHistory');
      const imageHistory = localStorage.getItem('imageHistory');
      if (chatHistory) {
        chatMessages.value = JSON.parse(chatHistory);
      }
      if (imageHistory) {
        imageMessages.value = JSON.parse(imageHistory);
      }
    };

    const saveHistory = () => {
      if (mode.value === 'chat') {
        localStorage.setItem('chatHistory', JSON.stringify(chatMessages.value));
      } else {
        localStorage.setItem('imageHistory', JSON.stringify(imageMessages.value));
      }
    };

    const switchMode = (newMode) => {
      mode.value = newMode;
      // 不清空消息，只切换显示
    };

    // 计算属性用于显示当前模式的消息
    const messages = computed(() => {
      return mode.value === 'chat' ? chatMessages.value : imageMessages.value;
    });

    const clearHistory = () => {
      if (mode.value === 'chat') {
        chatMessages.value = [];
        localStorage.removeItem('chatHistory');
      } else {
        imageMessages.value = [];
        localStorage.removeItem('imageHistory');
      }
    };

    const scrollToBottom = () => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    };

    const sendMessage = async () => {
      if (newMessage.value.trim()) {
        const userMessage = newMessage.value;
        if (mode.value === 'chat') {
          chatMessages.value.push({ text: userMessage, type: 'sent' });
        } else {
          imageMessages.value.push({ text: userMessage, type: 'sent' });
        }
        saveHistory();

        if (mode.value === 'chat') {
          try {
            // 创建一个临时消息索引
            const messageIndex = messages.value.length;
            messages.value.push({ text: '', type: 'received' });

            // 使用流式响应
            const stream = await openai.chat.completions.create({
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.value.map(msg => ({ role: msg.type === 'sent' ? 'user' : 'assistant', content: msg.text })),
                { role: 'user', content: userMessage }
              ],
              model: "deepseek-chat", 
              stream: true,
            });

            // 使用响应式更新
            let accumulatedText = '';
            for await (const part of stream) {
              if (part.choices && part.choices[0].delta.content) {
                accumulatedText += part.choices[0].delta.content;
                // 使用数组索引更新来触发响应式更新
                messages.value[messageIndex] = {
                  text: accumulatedText,
                  type: 'received'
                };
                await nextTick();
                scrollToBottom();
              }
            }

            saveHistory();
          } catch (error) {
            console.error('Error fetching data from API:', error);
            messages.value.push({
              text: '抱歉,发生了一些错误,请稍后再试。',
              type: 'received'
            });
          }
        } else {
          setTimeout(() => {
            messages.value.push({
              image: 'https://via.placeholder.com/300',
              type: 'received',
            });
            saveHistory();
          }, 1000);
        }

        newMessage.value = '';
        await nextTick();
        scrollToBottom();
      }
    };

    // 三元组相关状态
    const selectedEquipment = ref('');
    const selectedAction = ref('');
    const selectedBodyPart = ref('');

    const equipments = ['grasper', 'bipolar', 'hook', 'scissors', 'clipper', 'irrigato'];
    const actions = ['grasp', 'retract', 'dissect', 'coagulate', 'clip', 'cut', 'aspirate', 'irrigate', 'pack', 'null_verb'];
    const bodyParts = ['gallbladder', 'cystic_plate', 'cystic_duct', 'cystic_artery', 'cystic_pedicle', 'blood_vessel', 'fluid', 'abdominal_wall_cavity', 'liver', 'adhesion', 'omentum'];

    const sendTriplet = async () => {
      if (selectedEquipment.value && selectedAction.value && selectedBodyPart.value) {
        const triplet = {
          equipment: selectedEquipment.value,
          action: selectedAction.value,
          bodyPart: selectedBodyPart.value,
        };

        const userTripletMessage = {
          text: `器械: ${triplet.equipment}, 动作: ${triplet.action}, 部位: ${triplet.bodyPart}`,
          type: 'sent',
        };
        imageMessages.value.push(userTripletMessage);
        saveHistory();

        try {
          const messageIndex = messages.value.length;
          messages.value.push({ image: '', type: 'received' });

          // 调用生成图片的接口
          // 这里假设有一个生成图片的 API，可根据实际情况修改
          const imageUrl = await generateImageURL(triplet);

          messages.value[messageIndex] = {
            image: imageUrl,
            type: 'received',
          };

          saveHistory();
        } catch (error) {
          console.error('Error generating image:', error);
          messages.value.push({
            text: '抱歉,生成图片时发生错误。',
            type: 'received',
          });
        }

        selectedEquipment.value = '';
        selectedAction.value = '';
        selectedBodyPart.value = '';

        await nextTick();
        scrollToBottom();
      } else {
        messages.value.push({
          text: '请完整选择器械、动作和部位。',
          type: 'received',
        });
        await nextTick();
        scrollToBottom();
      }
    };

    const generateImageURL = async (triplet) => {
      // 实现图片生成的逻辑
      // 这里只是模拟生成一个占位图片
      const placeholderUrl = `https://via.placeholder.com/300?text=${triplet.equipment}+${triplet.action}+${triplet.bodyPart}`;
      return placeholderUrl;
    };

    onMounted(() => {
      loadHistory();
    });

    return {
      messages,
      chatMessages,
      imageMessages,
      newMessage,
      mode,
      switchMode,
      sendMessage,
      clearHistory,
      messageContainer,
      md, 
      selectedEquipment,
      selectedAction,
      selectedBodyPart,
      equipments,
      actions,
      bodyParts,
      sendTriplet,
    };
  },
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 1200px;
  height: 700px;
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
  align-self: flex-start;
  font-size: 24px;
  margin: 0px 10px;
}

.message-content {
  max-width: 70%;
  padding: 0px 15px;
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
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #ddd;
  gap: 10px;
}

.single-input {
  flex: 1;
  display: flex;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
}

.chat-input input:focus {
  border-color: #007AFF;
}

.send-button {
  padding: 8px 16px;
  border: none;
  background-color: #007AFF;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px; /* 与输入框保持一定间距 */
}

.send-button:hover {
  background-color: #005BBB;
}

.select-input {
  width:310px;
  margin: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  min-width: 150px;
}

.clear-history-button {
  padding: 10px 20px;
  background-color: #3484c6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px; /* 与输入框保持一定间距 */
}
</style>

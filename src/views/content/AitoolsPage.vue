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
          <ElImage
            v-if="message.image"
            :src="message.image"
            fit="contain"
            class="generated-image"
            style="cursor: pointer;"
            :preview-src-list="imageSrcList"
            :preview-index="getImageIndex(message.image)"
          >
          </ElImage>
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
          placeholder="输入问题..."
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

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { Avatar, User, Promotion } from '@element-plus/icons-vue';
import { ElImage, ElMessage } from 'element-plus';
import OpenAI from 'openai';
import axios from '../../utils/request/axios';
import MarkdownIt from 'markdown-it';

// 初始化 Markdown 渲染器
const md = new MarkdownIt(); 

// 初始化 OpenAI
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_API_KEY
});

// 响应式变量
const chatMessages = ref([]);
const imageMessages = ref([]);
const newMessage = ref('');
const mode = ref('chat'); // 'chat' 或 'image'
const messageContainer = ref(null);
const selectedImageUrl = ref('');

// 选择器械、动作和部位
const selectedEquipment = ref('');
const selectedAction = ref('');
const selectedBodyPart = ref('');

// 选项数据
const equipments = ['抓钳', '双极电凝钳', '电凝勾', '手术剪', '夹持器', '冲洗吸引器','无器械'];
const actions = ['抓', '牵拉', '解剖', '凝结', '夹持', '切割', '吸引', '灌注', '填塞', '无动作'];
const bodyParts = ['胆囊', '胆囊板', '胆囊管', '胆囊动脉', '胆囊蒂', '血管', '液体', '腹腔壁', '肝脏', '粘连', '大网膜', '腹膜', '肠', '无操作部位'];

// 映射对象
const equipmentMapping = {
  '抓钳': 'grasper',
  '双极电凝钳': 'bipolar',
  '电凝勾': 'hook',
  '手术剪': 'scissors',
  '夹持器': 'clipper',
  '冲洗吸引器': 'irrigator',
  '无器械': 'null_instrument'
};

const actionMapping = {
  '抓': 'grasp',
  '牵拉': 'retract',
  '解剖': 'dissect',
  '凝结': 'coagulate',
  '夹持': 'clip',
  '切割': 'cut',
  '吸引': 'aspirate',
  '灌注': 'irrigate',
  '填塞': 'pack',
  '无动作': 'null_verb'
};

const bodyPartMapping = {
  '胆囊': 'gallbladder',
  '胆囊板': 'cystic_plate',
  '胆囊管': 'cystic_duct',
  '胆囊动脉': 'cystic_artery',
  '胆囊蒂': 'cystic_pedicle',
  '血管': 'blood_vessel',
  '液体': 'fluid',
  '腹腔壁': 'abdominal_wall_cavity',
  '肝脏': 'liver',
  '粘连': 'adhesion',
  '大网膜': 'omentum',
  '腹膜': 'peritoneum',
  '肠': 'gut',
  '无操作部位': 'null_target'
};

// 系统提示
const systemPrompt = "你是微创手术视频示教平台的ai助手，你需要回答用户所有关于医学或手术相关的问题，其他问题你可以拒绝回答。";

// 计算属性：根据模式显示消息
const messages = computed(() => {
  return mode.value === 'chat' ? chatMessages.value : imageMessages.value;
});

// 计算属性：图片预览列表
const imageSrcList = computed(() => {
  return messages.value
    .filter(message => message.image)
    .map(message => message.image);
});

// 方法，获取当前图片的索引
const getImageIndex = (imageSrc) => {
  console.log('imageSrcList:', imageSrcList.value);
  console.log('Current imageSrc:', imageSrc);
  const index = imageSrcList.value.indexOf(imageSrc);
  console.log('Computed index:', index);
  return index !== -1 ? index : 0;
};

// 保存历史
const saveHistory = () => {
  if (mode.value === 'chat') {
    localStorage.setItem('chatHistory', JSON.stringify(chatMessages.value));
  } else {
    localStorage.setItem('imageHistory', JSON.stringify(imageMessages.value));
  }
};

// 加载历史
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

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 延时函数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 切换模式
const switchMode = (newMode) => {
  mode.value = newMode;
  // 不清空消息，只切换显示
};

// 清空历史
const clearHistory = () => {
  if (mode.value === 'chat') {
    chatMessages.value = [];
    localStorage.removeItem('chatHistory');
  } else {
    imageMessages.value = [];
    localStorage.removeItem('imageHistory');
  }
};

// 发送消息（AI助手）
const sendMessage = async () => {
  if (newMessage.value.trim()) {
    const userMessage = newMessage.value;
    if (mode.value === 'chat') {
      chatMessages.value.push({ text: userMessage, type: 'sent' });
    }
    saveHistory();
    scrollToBottom();

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
        saveHistory();
        scrollToBottom();
      }
    } else {
      setTimeout(() => {
        imageMessages.value.push({
          image: 'https://via.placeholder.com/300',
          type: 'received',
        });
        saveHistory();
        scrollToBottom();
      }, 1000);
    }

    newMessage.value = '';
    await nextTick();
    scrollToBottom();
  }
};

// 发送三元组（文生图）方法
const sendTriplet = async () => {
  if (selectedEquipment.value && selectedAction.value && selectedBodyPart.value) {
    const triplet = {
      equipment: equipmentMapping[selectedEquipment.value],
      action: actionMapping[selectedAction.value],
      bodyPart: bodyPartMapping[selectedBodyPart.value],
    };

    const userTripletMessage = {
      text: `器械: ${selectedEquipment.value}, 动作: ${selectedAction.value}, 部位: ${selectedBodyPart.value}`,
      type: 'sent',
    };
    imageMessages.value.push(userTripletMessage);
    saveHistory();

    // 推送占位符消息
    const messageIndex = imageMessages.value.length;
    imageMessages.value.push({ text: '生成中...', type: 'received' });
    saveHistory();
    scrollToBottom();

    // 添加两秒延时
    await sleep(2000);

    try {
      // 调用生成图片的接口
      const imageUrl = await generateImageURL(triplet);
      if (typeof imageUrl === 'string' && imageUrl !== '') {
        imageMessages.value[messageIndex] = {
          image: imageUrl,
          type: 'received',
          text: '', // 设置 text 为字符串，防止 undefined
        };
        console.log('Replaced placeholder with image.');
      } else {
        throw new Error('Invalid imageUrl received from API');
      }

      saveHistory();
      scrollToBottom();
    } catch (error) {
      console.error('Error generating image:', error);
      ElMessage.error('生成图片时发生错误。');
      imageMessages.value.push({
        text: '抱歉, 生成图片时发生错误。',
        type: 'received',
      });
      saveHistory();
      scrollToBottom();
    }

    // 重置选择
    selectedEquipment.value = '';
    selectedAction.value = '';
    selectedBodyPart.value = '';

    await nextTick();
    scrollToBottom();
  } else {
    imageMessages.value.push({
      text: '请完整选择器械、动作和部位。',
      type: 'received',
    });
    saveHistory();
    await nextTick();
    scrollToBottom();
  }
};

// 生成图片URL
const generateImageURL = async (triplet) => {
  try {
    const response = await axios.get('/get_pictures', {
      params: {
        equipment: triplet.equipment,
        action: triplet.action,
        bodyPart: triplet.bodyPart,
      },
    });
    console.log('API response:', response.data); // 调试日志
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error fetching image URL:', error);
    throw error;
  }
};

// 防止背景滚动
watch(selectedImageUrl, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// 生命周期钩子
onMounted(() => {
  loadHistory();
});
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
  height: 40px;
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #ddd;
  gap: 10px;
}

.single-input {
  margin-left: 5px;
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
  height: 36px;
  display: flex;
  align-items: center; /* 竖直方向居中 */
  justify-content: center; /* 水平方向居中 */
}

.send-button:hover {
  background-color: #005BBB;
}

.select-input {
  width: 30%;
  margin: 0px 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  min-width: 150px;
}

/* 未选择时的默认文字颜色 */
.select-input:invalid {
  color: #999;
}

/* 选择后的文字颜色 */
.select-input:valid {
  color: #000;
}

.clear-history-button {
  padding: 10px 20px;
  background-color: #3484c6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px; /* 与输入框保持一定间距 */
  width: 15%;
}

.triplet-input{
  flex: 1;
  display: flex;
  align-items: center; /* 竖直方向居中 */
  justify-content: center; /* 水平方向居中 */
}

/* 图片放大覆盖层样式 */
.image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.enlarged-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}
</style>
<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages" :key="index"
        :class="['message', message.type === 'sent' ? 'sent' : 'received']">
        <div class="message-content">
          {{ message.text }}
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="输入消息...">
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        messages: [],
        newMessage: ''
      }
    },
    methods: {
      sendMessage() {
        if (this.newMessage.trim()) {
          this.messages.push({
            text: this.newMessage,
            type: 'sent'
          });
          this.newMessage = '';
          // 模拟回复
          setTimeout(() => {
            this.messages.push({
              text: '这是一条自动回复消息',
              type: 'received'
            });
          }, 1000);
        }
      }
    },
    updated() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        container.scrollTop = container.scrollHeight;
      });
    }
  }
</script>

<style scoped>
  .chat-container {
    width: 100%;
    max-width: 800px;
    height: 600px;
    margin: 0 auto;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f5f5f5;
  }

  .message {
    margin: 10px 0;
    display: flex;
  }

  .message.sent {
    justify-content: flex-end;
  }

  .message.received {
    justify-content: flex-start;
  }

  .message-content {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 15px;
    word-wrap: break-word;
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
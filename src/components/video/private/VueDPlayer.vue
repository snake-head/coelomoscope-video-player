<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-07-05 10:31:53
-->
<script>
import DPlayer from 'dplayer'
import { defineComponent, h } from 'vue'

const VueDPlayer = defineComponent({
  props: {
    options: {
      type: Object
    }
  },
  data() {
    return {
      dp: null
    }
  },
  mounted() {
    this.options.container = this.$el;
    const player = this.dp = new DPlayer(this.options);
    const events = player.events;
    Object.keys(events).forEach(item => {
      if (item === 'events') {
        return false;
      } else {
        events[item].forEach(event => {
          player.on(event, () => this.$emit(event));
        });
      }
    });

    // 动态修改样式
    this.$nextTick(() => {
      const subtitleElement = this.$el.querySelector('.dplayer-subtitle');
      if (subtitleElement) {
        // subtitleElement.style.fontSize = '20px';
        subtitleElement.style.color = '#fff';
        subtitleElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        // subtitleElement.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
        // subtitleElement.style.width = 'fit-content';
      }
    });
  },
  render() {
    return h('div', {
      class: 'dplayer'
    }, [])
  }
})

export default VueDPlayer
</script>
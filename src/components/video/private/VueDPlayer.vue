<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-08-01 17:53:40
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
    const player = this.dp = new DPlayer(this.options)
    const events = player.events
    Object.keys(events).forEach(item => {
      if (item === 'events') {
        return false
      } else {
        events[item].forEach(event => {
          player.on(event, () => this.$emit(event))
        })
      }
    })
  },
  render() {
    return h('div', {
      class: 'dplayer'
    }, [])
  }
})

export default VueDPlayer
</script>
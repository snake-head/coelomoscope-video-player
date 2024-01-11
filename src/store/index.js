import {
  createStore
} from 'vuex'

const defaultState = {
  count: 0,
  videoPlaybackTimes: {},
}

export default createStore({
  state() {
    return defaultState
  },
  actions: {
    increment(context) {
      context.commit('increment')
    },
    updateVideoPlaybackTimes(context, value) {
      context.commit('UpdateVideoPlaybackTimes', value)
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
    UpdateVideoPlaybackTimes(state, value) {
      Object.assign(state.videoPlaybackTimes, {[value.videoId]: value.time});
    }
  },
  getters: {
    double(state) {
      return 2 * state.count
    }
  }
})
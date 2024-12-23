/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-12-01 14:04:31
 */
import axios from "./axios";

export const getVideosByCourseId = async ({
  courseId,
  page = 1,
  limit = 10
} = {}) => {
  console.log(courseId)
  return axios.get('/data/video', {
    params: {
      courseId: courseId,
      _page: page,
      _limit: limit
    }
  })
    .then(res => res.data)
    .catch(err => err);
}

export const getVideoByVideoId = async (videoId) => {
  console.log(videoId)
  return axios.get('/data/video', {
    params: {
      videoId: videoId
    }
  })
    .then(res => res.data)
    .catch(err => err);
}

export const getAllVideos = async (page = 1, limit = 1000) => {
  return axios.get('/data/video', {
    params: {
      _page: page,
      _limit: limit
    }
  })
    .then(res => res.data)
    .catch(err => err);
}

export const getVideoCaption = async (video_id, play_time) => {
  return axios.post('/data/video/getCaption', {
    video_id: video_id,
    play_time: play_time
  })
    .then(res => res.data)
    .catch(err => err);
}
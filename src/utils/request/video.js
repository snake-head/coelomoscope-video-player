/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-01-19 09:44:50
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

export const getAllVideos = async (page = 6, limit = 48) => {
  return axios.get('/data/video', {
    params: {
      _page: page,
      _limit: limit
    }
  })
    .then(res => res.data)
    .catch(err => err);
}
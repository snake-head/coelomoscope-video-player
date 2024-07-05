/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-05-23 11:09:48
 */
import axios from "./axios";

export const getResourceByCourseId = async ({
  courseId,
  page = 1,
  limit = 10
} = {}) => {
  return axios.get('/data/resource', {
      params: {
        courseId: courseId,
        _page: page,
        _limit: limit
      }
    })
    .then(res => res.data)
    .catch(err => err);
}

export const getResourceAll = async ({
  page = 1,
  limit = 10
} = {}) => {
  return axios.get('/data/resource', {
      params: {
        _page: page,
        _limit: limit
      }
    })
    .then(res => res.data)
    .catch(err => err);
}

export const getResourceByResourceId = async (resourceId) => {
  return axios.get('/data/resource', {
      params: {
        id: resourceId
      }
    })
    .then(res => res.data)
    .catch(err => err);
}
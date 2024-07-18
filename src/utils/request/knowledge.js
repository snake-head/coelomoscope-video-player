/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-06 16:58:39
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-09-06 17:00:18
 */
import axios from "./axios";

export const getPagesByPageName = async ({
  pageName,
  page = 1,
  limit = 10
} = {}) => {
  console.log(pageName)
  return axios.get('/data/knowledge', {
      params: {
        pageName: pageName,
        _page: page,
        _limit: limit
      }
    })
    .then(res => res.data)
    .catch(err => err);
}
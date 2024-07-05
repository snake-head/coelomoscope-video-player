/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-05-13 16:01:11
 */
import {
  courseQueryCriteria,
} from "../global-search/course";
import {
  resetQueryCriteria
} from "../global-search/common";

export const toHome = (router) => {
  resetQueryCriteria(courseQueryCriteria);
  router.push({
    name: 'Home'
  });
}
export const toAccountView = (router) => {
  const accountHomeUrl = router.resolve({
    name: 'AccountHome'
  });
  window.open(accountHomeUrl.href, '_blank');
}
export const toCourseDetail = (router, courseId) => {
  router.push({
    name: 'CourseDetail',
    params: {
      courseId
    }
  })
}

export const toVideoManagement = (router) => {
  router.push({
    name: 'VideoManagement'
  });
}

export const toPPTDetail = (router, pptId) => {
  router.push({
    name: 'PPTDetail',
    params: {
      pptId
    }
  })
}
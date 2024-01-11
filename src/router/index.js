/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2023-09-06 17:05:46
 */
import {
  createRouter,
  createWebHistory
} from 'vue-router'

// TopMenu组件的跳转依赖这里的path，如果修改需要同步
const routes = [{
  path: '/',
  name: 'MainPageFramework',
  redirect: {
    name: 'Home'
  },
  component: () => import('../views/MainPageFramework.vue'),
  children: [{
    path: 'home',
    name: 'Home',
    component: () => import('../views/content/Home.vue'),
  }, {
    path: 'search',
    name: 'CourseSearch',
    component: () => import('../views/content/CourseSearch.vue')
  }, {
    path: 'video/:videoId(vid_?[a-z0-9]+.*)/play',
    name: 'VideoPlay',
    component: () => import('../views/content/VideoPlay.vue')
  }, {
    path: 'course/:courseId(cid_?[a-z0-9]+.*)/detail',
    name: 'CourseDetail',
    component: () => import('../views/content/CourseDetail.vue')
  }, {
    path: 'course/:courseId(cid_?[a-z0-9]+.*)',
    name: 'CourseBrief',
    component: () => import('../views/content/CourseBrief.vue')
  }]
}, {
  path: '/account',
  redirect: {
    name: 'AccountHome'
  },
  children: [{
    path: 'home',
    name: 'AccountHome',
    component: () => import('../views/AccountHome.vue')
  }, {
    path: 'userInfo',
    name: 'AccountUserInfo',
    component: () => import('../views/AccountUserInfo.vue')
  }]
}, {
  path: '/management',
  redirect: {
    name: 'VideoManagement',
  },
  children: [{
    path: 'video',
    name: 'VideoManagement',
    component: () => import('../views/VideoManagement.vue')
  }]
}, {
  path: '/knowledge',
  redirect: {
    name: 'Category',
  },
  component: () => import('../views/KnowledgeHome.vue'),
  children: [{
    path: 'category',
    name: 'Category',
    component: () => import('../views/content/KnowledgeCategory.vue')
  },
  {
    path: ':pageName(.*)/content',
    name: 'KnowledgeContent',
    component: () => import('../views/content/KnowledgeContent.vue')
  }]
}]

const router = createRouter({
  history: createWebHistory('/intelligentSurgery'),
  routes
})

export default router
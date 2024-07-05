/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-05-13 17:28:22
 */
import {
  createRouter,
  createWebHistory, createWebHashHistory
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
},{
  path: '/resource',
  redirect: {
    name: 'ResourceCategory',
  },
  component: () => import('../views/ResourceHome.vue'),
  children: [{
    path: 'category',
    name: 'ResourceCategory',
    component: () => import('../views/content/ResourceCategory.vue')
  },
  {
    path: ':pageName(.*)/content',
    name: 'ResourceContent',
    component: () => import('../views/content/ResourceContent.vue')
  }]
}
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
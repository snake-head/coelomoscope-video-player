/*
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-05-23 15:25:36
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-12-23 15:12:50
 */
import {
  createRouter,
  createWebHistory, createWebHashHistory
} from 'vue-router'
import { recaptchaManager } from '../utils/recapchamanage';

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
    path: '/callback',
    name: 'Callback',
    component: () => import('../views/content/Callback.vue'),
  }, {
    path: 'feedback',
    name: 'feedback',
    component: () => import('../views/content/FeedBack.vue'),
    meta: { requiresAuth: true }
  }, {
    path: 'search',
    name: 'CourseSearch',
    component: () => import('../views/content/CourseSearch.vue'),
    meta: { requiresAuth: true }
  }, {
    path: 'recaptcha',
    name: 'recaptcha',
    component: () => import('../components/global/Recaptcha.vue'),
    meta: { requiresAuth: true }
  }, {
    path: '/totalvideo',
    name: 'totalvideo',
    component: () => import('../views/content/TotalVideo.vue'),
    meta: { requiresAuth: true }
  }, {
    path: '/Statistic',
    name: 'Statistic',
    component: () => import('../views/Statistic.vue'),
    meta: { requiresAuth: true }
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
    component: () => import('../views/AccountHome.vue'),
    meta: { requiresAuth: true },
  }, {
    path: 'userInfo',
    name: 'AccountUserInfo',
    component: () => import('../views/AccountUserInfo.vue')
  }, {
    path: 'experience',
    name: 'AccountExperience',
    component: () => import('../views/AccountExperience.vue'),
  },]
}, {
  path: '/management',
  redirect: {
    name: 'VideoManagement',
  },
  children: [{
    path: 'video',
    name: 'VideoManagement',
    component: () => import('../views/VideoManagement.vue'),
    meta: { requiresAuth: true }
  }]
}, {
  path: '/knowledge',
  redirect: {
    name: 'Category',
  },
  component: () => import('../views/KnowledgeHome.vue'),
  meta: { requiresAuth: true },
  children: [{
    path: 'category',
    name: 'Category',
    component: () => import('../views/content/KnowledgeCategory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ':pageName(.*)/content',
    name: 'KnowledgeContent',
    component: () => import('../views/content/KnowledgeContent.vue'),
    meta: { requiresAuth: true }
  }]
}, {
  path: '/courseware',
  redirect: {
    name: 'ResourceCategory',
  },
  component: () => import('../views/ResourceHome.vue'),
  meta: { requiresAuth: true },
  children: [{
    path: 'category',
    name: 'ResourceCategory',
    component: () => import('../views/content/ResourceCategory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ':pageName(.*)/content',
    name: 'ResourceContent',
    component: () => import('../views/content/ResourceContent.vue'),
    meta: { requiresAuth: true }
  }]
}, {
  path: '/aitools',
  redirect: {
    name: 'AitoolsPage',
  },
  component: () => import('../views/AitoolsHome.vue'),
  meta: { requiresAuth: true },
  children: [{
    path: 'category',
    name: 'AitoolsPage',
    component: () => import('../views/content/AitoolsPage.vue'),
    meta: { requiresAuth: true }
  }]
}
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

router.beforeEach(async (to, from, next) => {
  const isLoggedIn = localStorage.getItem('token') || false;

  if (isLoggedIn) {
    // 比较 fullPath 来决定是否记录
    if (from.fullPath !== to.fullPath) {
      console.log(`记录导航: 从 ${from.fullPath} 到 ${to.fullPath}`);
      // 传递 to.fullPath
      const needsVerification = recaptchaManager.recordNavigation(to.fullPath);
      if (needsVerification) {
        console.log('Router guard: Verification needed, navigation suspended by component.');
        // 注意：导航的挂起和恢复由组件或 recaptchaManager 内部处理
        // 路由守卫通常只负责记录或初始检查，不直接阻止 next()
      }
    }
  }

  next(); // 允许导航继续，由组件或 recaptchaManager 处理挂起
});

export default router
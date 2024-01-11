<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="3" :offset="3">
        <el-card class="left-menu">
          <template #header>
            <div class="left-card-header">
              <el-avatar size="large" :src="userInfo.avatar" />
              <div class="uname">{{ userInfo.uname }}</div>
              <div class="role">{{ userInfo.role }}</div>
            </div>
          </template>
          <el-menu :default-active="activeMenuIndex" :router="true">
            <el-menu-item index="/account/home">
              <template #title>
                <el-icon>
                  <HomeFilled />
                </el-icon>
                <span>首页</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/account/userInfo">
              <el-icon>
                <User />
              </el-icon>
              <span>用户信息</span>
            </el-menu-item>
            <el-menu-item index="/course/append">
              <el-icon>
                <Document />
              </el-icon>
              <span>我的案例</span>
            </el-menu-item>
            <el-menu-item index="/course/like">
              <el-icon>
                <Star />
              </el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="/account/setting">
              <el-icon>
                <Setting />
              </el-icon>
              <span>个人设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="10">
        <slot name="main">
          <div class="main-content" style="background-color:yellow;margin: auto;">
            <h2>展示主体</h2>
          </div>
        </slot>
      </el-col>

      <el-col :span="6">
        <el-row>
          <el-col>
            <el-card class="latest-visited-card">
              <template #header>
                <div class="card-header">
                  <el-icon :size="25">
                    <Clock />
                  </el-icon>
                  <span class="card-header-text">最近观看</span>
                </div>
              </template>
              <div class="latest-visited" style="margin-top:auto">
                <h3>最近观看的视频</h3>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-card class="notification-card">
              <template #header>
                <div class="card-header">
                  <el-icon :size="25">
                    <BellFilled />
                  </el-icon>
                  <span class="card-header-text">通知公告</span>
                </div>
              </template>
              <div class="notification" style="margin-top:auto">
                <h3>暂无通知</h3>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import userInfo from '@/utils/userInfoDto.js';
import {
  useRouter
} from "vue-router";

defineProps({
  activeMenuIndex: {
    type: String,
    default: '/account/home'
  }
})

const router = useRouter();

</script>
<style scoped>
.el-row {
  margin-bottom: 20px;
}

.card-header {
  text-align: left;
  align-items: center;
  display: flex;
}

.card-header-text {
  margin: 8px;
}

:deep(.el-menu) {
  border: 0px;
}

:deep(.el-menu-item) {
  padding-left: 0 !important;
}

.uname {
  font-size: 16px;
}

.role {
  font-size: 12px;
  opacity: 0.5;
}
</style>
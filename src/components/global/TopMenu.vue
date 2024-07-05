<template>
  <div>
    <el-row>
      <el-col>
        <div class="top-menu">
          <el-menu :default-active="route.fullPath" mode="horizontal" background-color="#568ad6" text-color="#fff"
            active-text-color="#ffd04b" :ellipsis="false" :router="true">
            <el-menu-item index="/home">首页</el-menu-item>
            <el-sub-menu index="/search">
              <template #title>案例资源</template>
              <el-menu-item index="/search" v-for="(vType) in additionalTypeList" :key="vType.id"
                @click="typeChange(vType)">{{ vType.label }}</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/course/dept">科系案例</el-menu-item>
            <el-menu-item index="/knowledge">知识库</el-menu-item>
            <el-menu-item index="/resource">课件资源</el-menu-item>
            <el-menu-item index="/data/statistic">数据分析</el-menu-item>
            <el-menu-item index="/questionnaire">问卷填写</el-menu-item>
            <el-menu-item index="/feedback">建议反馈</el-menu-item>
            <div style="flex-grow: 1;" />
            <el-menu-item index="/userInfo">
              <el-dropdown>
                <div class="menu-item__right">
                  <el-avatar :src="userInfo.avatar" />
                </div>
                <template #dropdown>
                  <div style="padding:8px">
                    <el-dropdown-menu>
                      <el-dropdown-item @click="toAccountView(router)">
                        <span>
                          <el-icon>
                            <User />
                          </el-icon>
                        </span>
                        <span>
                          用户中心
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click="toVideoManagement(router)">
                        <span>
                          <el-icon>
                            <Files />
                          </el-icon>
                        </span>
                        <span>
                          影像管理
                        </span>
                      </el-dropdown-item>
                      <el-divider />
                      <el-dropdown-item>
                        <span>
                          <el-icon>
                            <SwitchButton />
                          </el-icon>
                        </span>
                        <span>
                          退出登录
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </div>
                </template>
              </el-dropdown>
            </el-menu-item>
            <el-menu-item index="/notice">
              <el-dropdown>
                <div class="menu-item__right">
                  <el-icon :size="40">
                    <Bell />
                  </el-icon>
                </div>
                <template #dropdown>
                  <div style="padding:8px">
                    <el-dropdown-menu>
                      <el-dropdown-item v-for="(_, index) in 5" :key="index">
                        <h4>这里是第{{ index+ 1}}条通知</h4>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </div>
                </template>
              </el-dropdown>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import userInfo from '../../utils/userInfoDto.js';
import {
  useRouter,
  useRoute
} from "vue-router";
import { onMounted } from "vue";
import { courseQueryCriteria } from "../../utils/global-search/course";
import { getAllCourseType } from "../../utils/request/course";
import { toAccountView, toVideoManagement } from "../../utils/router/routeJumper";

onMounted(() => {
  getAllCourseType()
    .then(res => additionalTypeList.push(...res.data?.results))
    .catch(err => console.log(err))
})

const additionalTypeList = [{ id: 0, name: "", label: "全部案例" }];
const router = useRouter();
const route = useRoute();
const typeChange = (type) => {
  courseQueryCriteria.courseTypeId = type.id;
  router.push({ name: 'CourseSearch' });
}
</script>
<style lang="css" scoped>
.menu-item__right {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  height: var(--el-menu-item-height);
}
</style>
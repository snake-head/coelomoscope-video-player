# 手术视频示教系统

本仓库是系统的前端部分，后端部分在[这里](https://github.com/snake-head/operation_platform_backend)。

## 使用方式
### 搭建环境
```shell
npm install # 安装依赖
```
### 启动项目
```shell
npm run dev # 启动项目，默认端口4000
```
## 项目结构
```txt
coelomoscope-video-player
├── public
│   ├── hash.js
│   ├── spark-md5.min.js
│   └── vite.svg
├── src
│   ├── assets
│   ├── components             # 自定义的一些组件
│   ├── router                 # 路由控制，基于vue-router
│   ├── store                  # 状态管理，基于vuex，不过目前没怎么用到
│   ├── utils                  # 工具，主要是一些js文件，用于发请求等
│   ├── views                  # 系统中的各个页面
│   ├── App.vue                # Vue顶层组件
│   ├── main.js                # 项目入口
│   └── style.css
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
└── volar.config.js
```
这是一个`Vue3`项目的基本结构，其中`src`是主要源代码位置，相关说明已在上面给出。

项目的很多组件和样式基于[element-plus](https://element-plus.org/zh-CN/)，后续维护可以继续基于这个组件库。


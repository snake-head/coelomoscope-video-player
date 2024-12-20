<script setup>
import VideoCoverCard from "../../components/video/VideoCoverCard.vue";
import VideoPlayer from "../../components/video/VideoPlayer.vue";

import { onMounted, reactive, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCourseByCourseId, getCourseTypeById } from "../../utils/request/course";
import {
  getVideoByVideoId,
  getVideosByCourseId,
  getVideoCaption,
} from "../../utils/request/video";
import { toCourseDetail } from "../../utils/router/routeJumper";
import { ElSteps, ElStep } from "element-plus";
import { Panel, Position, VueFlow, isNode, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css';
import { MarkerType } from '@vue-flow/core'
import { useStore } from 'vuex';
import CryptoJS from 'crypto-js'
import OpenAI from 'openai';
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_API_KEY
});
const store = useStore();
const route = useRoute();
const router = useRouter();
const videoId = route.params.videoId;
const videoPlayer = ref();
const otherVideoList = ref([]);
const activeVideoCourse = reactive({
  courseId: "",
  courseName: "",
  courseTypeName: "",
  courseTypeLabel: "",
});
const activeVideo = reactive({
  id: "",
  videoId: "",
  videoName: "",
  videoUrl: "",
  coverImgUrl: "",
  createdAt: "",
  lastViewedAt: "",
  courseId: "",
  resolutionVersion: [],
  metadata: {},
  triplet: "",
  surgery_info: {},
});

const activeName = ref('step')
const handleClick = (tab, event) => {
  console.log(tab, event)
}
function calculateMD5(text) {
    const hash = CryptoJS.MD5(text);
    return hash.toString(CryptoJS.enc.Hex);
}
function createURLWithMD5(text) {
    // 计算MD5哈希值
    const hash = calculateMD5(text);

    // 构建包含哈希值的URL
    const url = `https://omentor.vico-lab.com:3443/videos/audio/${hash}.wav`;

    return url;
}
const captionTime = ref('未指定')
const captionContent = ref('')
const audioUrl = ref('')
const generateCaption = async () => {
  activeName.value = 'caption';
  captionTime.value = formattedTime.value;
  
  // 设置初始状态
  captionContent.value = "分析中...";

  try {
    // 获取原始字幕
    const resp = await getVideoCaption(activeVideo.videoId, videoPlaybackTimes.value[activeVideo.videoId]);
    const originalText = resp.code.description;

    // 调用OpenAI进行翻译
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `请将以下英文翻译成中文:\n${originalText}`
        }
      ],
      model: "deepseek-chat",
      stream: true
    });

    // 流式输出翻译结果
    captionContent.value = '';
    for await (const chunk of completion) {
      if (chunk.choices[0]?.delta?.content) {
        captionContent.value += chunk.choices[0].delta.content;
        captionContent.value = captionContent.value.replace('小肠', '腹壁')
      }
    }

  } catch (error) {
    console.error('获取或翻译字幕失败:', error);
    captionContent.value = "获取字幕失败，请稍后再试。";
  }
}
const enforceOptions = reactive({
  isAiIdentify: false,
  isAiDehazy: false,
});
const activeTabName = ref("讨论");
const activeVideoQualityList = ref([]);
const hasDataPrepared = ref(false);
const playbackProgress = ref(0); // Default value, you can choose a suitable default index.

const videoPlaybackTimes = computed(()=>store.state.videoPlaybackTimes)
const formattedTime = computed(() => {
  // 先取整秒数
  const totalSeconds = Math.floor(videoPlaybackTimes.value[activeVideo.videoId]);

  // 将秒数转换为 hh:mm:ss 格式
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 转换为两位数格式
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
});

watch(() => videoPlaybackTimes, () => {
  const currentTime = videoPlaybackTimes.value[activeVideo.videoId]
  if (activeVideo.metadata.phase) {
    timeList.value.forEach((time, index)=>{
      if (currentTime>time){
        playbackProgress.value = index
      }
    })
    elements.value.forEach((element)=>{
      const id = parseInt(element.id)
      if (!isNaN(id)){
        if (id-1<playbackProgress.value){
          element.style = {backgroundColor: "#caffc9"}
        }else if(id-1==playbackProgress.value){
          element.style = {backgroundColor: "#a9d4ff"}
        }else{
          element.style = {backgroundColor: "#ffffff"}
        }
      }else{
        var regex = /e(-?\d+)/g;
        const sourceId = parseInt(element.id.match(regex)[0].substring(1));
        if(sourceId-1<playbackProgress.value){
          element.style = {  'stroke-width': '2px'}
          element.markerEnd = MarkerType.ArrowClosed
          element.animated = false
        }else if(sourceId-1==playbackProgress.value){
          element.style = { stroke: '#409eff', 'stroke-width': '3px'}
          element.animated = true
        }else{
          element.style = {  'stroke-width': '2px'}
          element.markerEnd = MarkerType.ArrowClosed
          element.animated = false
        }
      }
    })
  }
},{ deep: true });

onMounted(async () => {
  await getActiveVideo();
  getRelatedVideos(activeVideo.courseId);
  getActiveVideoCourse(activeVideo.courseId);
  setQualityForVideo();
  hasDataPrepared.value = true;
});

watch(
  () => enforceOptions.isAiIdentify,
  (isAiIdentify) => {
    videoPlayer.value.switchSmartAnnotationMode(isAiIdentify);
  }
);

watch(
  () => enforceOptions.isAiDehazy,
  (isAiDehazy) => {
    videoPlayer.value.switchHazeMode(isAiDehazy);
  }
);

const elements = ref([])
const timeList = ref([])

const getActiveVideo = async () => {
  try {
    const video = (await getVideoByVideoId(videoId)).data.results[0];
    for (const key in video) {
      if (Object.hasOwnProperty.call(video, key)) {
        if (activeVideo.hasOwnProperty(key)) {
          if(key=='metadata'&&video[key].phase){
            getElements(video[key].phase)
            getTimeList(video[key].phase)
          }
          activeVideo[key] = video[key];
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const getTimeList = (phase)=>{
  phase.forEach(({time})=>{
    timeList.value.push(time)
  })
}

const getElements = (phase)=>{
  const numPhases = phase.length;

  for (let i = 0; i < numPhases; i++) {
    const phaseItem = phase[i];
    const id = i+1

    const element = {
      id: id,
      label: phaseItem.text,
      position: { x: 10 + i * 150, y: 10 },
      class: 'light',
      height: '68px',

    };
    
    if (i===0){
      element.type = 'input'
      element.sourcePosition = Position.Right
    }else if(i===numPhases-1){
      element.type = 'output'
      element.targetPosition = Position.Left
    }else{
      element.sourcePosition = Position.Right
      element.targetPosition = Position.Left
    }

    elements.value.push(element);
  }
  for (let i = 1; i < numPhases; i++){
    const element = {
      id: `e${i}-${i+1}`,
      source: i.toString(),
      target: (i+1).toString(),
      style: {  'stroke-width': '2px'},
      markerEnd: MarkerType.ArrowClosed,
    };
    elements.value.push(element)
  }
  return elements;
}
const setQualityForVideo = () => {
  activeVideoQualityList.value = activeVideo.resolutionVersion?.map(
    (resolution) => {
      const [width, height] = resolution.split("x");
      return {
        name: resolution,
        url: activeVideo.videoUrl,
        meta: { width: parseInt(width), height: parseInt(height) },
      };
    }
  );
};

const getRelatedVideos = async (courseId) => {
  try {
    const videosOfCourse = (await getVideosByCourseId({ courseId })).data
      .results;
    otherVideoList.value = videosOfCourse.filter(
      (video) => video.videoId !== activeVideo.videoId
    );
  } catch (err) {
    console.log(err);
  }
};

const getActiveVideoCourse = async (courseId) => {
  try {
    const course = (await getCourseByCourseId(courseId)).data.results[0];
    activeVideoCourse.courseId = course.courseId;
    activeVideoCourse.courseName = course.courseName;
    activeVideoCourse.courseDescription = course.courseDescription;
    const courseTypeContent = (await getCourseTypeById(course.courseType)).data;
    activeVideoCourse.courseTypeName = courseTypeContent.name;
    activeVideoCourse.courseTypeLabel = courseTypeContent.label;
  } catch (err) {
    console.error(err);
  }
};
const {
  nodesDraggable,
  nodesConnectable,
  elementsSelectable,
  zoomOnScroll,
  zoomOnDoubleClick,
  zoomOnPinch,
  panOnScroll,
  panOnScrollMode,
  panOnDrag,
  onConnect,
  onNodeDragStop,
  onPaneClick,
  onPaneScroll,
  onPaneContextMenu,
  onNodeDragStart,
  onMoveEnd,
  addEdges,
} = useVueFlow()

nodesDraggable.value = false;
zoomOnScroll.value = false;
nodesConnectable.value = false;
zoomOnDoubleClick.value = false;
panOnScroll.value = false;
panOnDrag.value = false;
// elementsSelectable.value = false;

// const elements = ref([
//   { id: '1', type: 'input', label: '开始', position: { x: 50, y: 10 }, sourcePosition: Position.Right, class: 'light', style: {backgroundColor: "#caffc9"} },
//   { id: '2', label: '阶段一', position: { x: 250, y: 10 }, sourcePosition: Position.Right, targetPosition: Position.Left, class: 'light', style: {backgroundColor: "#caffc9"} },
//   { id: '3', label: '阶段二', position: { x: 450, y: 10 }, sourcePosition: Position.Right, targetPosition: Position.Left, class: 'light', style: {backgroundColor: "#a9d4ff"} },
//   { id: '4', label: '阶段三', position: { x: 650, y: 10 }, sourcePosition: Position.Right, targetPosition: Position.Left, class: 'light',  },
//   { id: '5', label: '返回', position: { x: 550, y: 110 }, sourcePosition: Position.Left, targetPosition: Position.Right, class: 'light' },
//   { id: '6', type: 'output', label: '结束', position: { x: 850, y: 10 }, targetPosition: Position.Left, class: 'light' },
//   { id: 'e1-2', source: '1', target: '2', style: {  'stroke-width': '2px'}, markerEnd: MarkerType.ArrowClosed},
//   { id: 'e2-3', source: '2', target: '3', style: { 'stroke-width': '2px'}, markerEnd: MarkerType.ArrowClosed},
//   { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#409eff', 'stroke-width': '3px'}},
//   { id: 'e4-6', source: '4', target: '6', style: { 'stroke-width': '2px'}, markerEnd: MarkerType.ArrowClosed},

//   { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { 'stroke-width': '2px'}, markerEnd: MarkerType.ArrowClosed},
//   { id: 'e5-3', source: '5', target: '3', type: 'smoothstep', style: { 'stroke-width': '2px'}, markerEnd: MarkerType.ArrowClosed},
// ])

</script>

<template>
  <div>
    <el-container direction="horizontal">
      <el-aside width="350px">
        <el-card shadow="never">
            <div class="title-area">
              <div class="course-name">
                {{ activeVideoCourse.courseName }}
              </div>
              <div class="course-type">
                {{ activeVideoCourse.courseTypeName }}
              </div>
            </div>
            <div class="video-info">
              <div class="video-name">
                {{ activeVideo.videoName }}
              </div>
              <div class="operator">
                <span class="operator__label">主刀医师：</span>
                <span class="operator__content">刘备</span>
              </div>
            </div>
          </el-card>
        <div class="video-sidebar left-sidebar-bot">
          <el-card shadow="hover">
            <template #header>
              <div
                class="return-button"
                @click="toCourseDetail(router, activeVideoCourse.courseId)"
              >
                <div class="return-button__item">
                  <el-icon>
                    <ArrowLeft />
                  </el-icon>
                  <span>返回案例</span>
                </div>
              </div>
            </template>
            <div class="other-videos-bar">
              <el-tag effect="plain" round size="large" style="margin: 8px 0">
                本案例下视频选集
              </el-tag>
              <el-divider />
              <div class="video-display-table">
                <div
                  class="video-display-table-row"
                  v-for="video in otherVideoList"
                  :key="video.videoId"
                >
                  <div class="video-display-table-row__item">
                    <div class="video-cover">
                      <VideoCoverCard :video="video" />
                    </div>
                    <div class="video-info">
                      <span class="video-info-name">{{ video.videoName }}</span>
                      <span class="operator-name">主刀医生：张三</span>
                      <span class="remarks">备注：XXX</span>
                    </div>
                  </div>
                  <el-divider />
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="video-sidebar left-sidebar-bot">
          <div class="discussion-area">
            <el-tabs v-model="activeTabName" type="border-card">
              <el-tab-pane label="讨论" name="讨论">讨论区</el-tab-pane>
              <el-tab-pane label="疑问" name="疑问">疑问区</el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-aside>
      <el-main class="video-main">
        <div class="main-container">
          
          <div class="video-area">
            <VideoPlayer
              ref="videoPlayer"
              :quality="activeVideoQualityList"
              :src="activeVideo.videoUrl"
              :phase="activeVideo.metadata.phase"
              :videoId="activeVideo.videoId"
              :triplet="activeVideo.triplet"
              v-if="hasDataPrepared"
            ></VideoPlayer>
          </div>
          <div class="operation-steps" v-if="activeVideo.courseId!='cid202412201519'">
              <div class="step-and-button">
                <!-- <div class="info-header">手术步骤</div> -->
                <el-button type="primary" plain @click="generateCaption">生成描述</el-button>
                <div class="switch-button">
                  <span class="switch-button__item">
                    <el-switch
                      v-model="enforceOptions.isAiIdentify"
                      style="--el-switch-on-color: #13ce66"
                    />
                    <span class="switch-option-text">智能识别</span>
                  </span>
                  <span class="switch-button__item">
                    <el-switch
                      v-model="enforceOptions.isAiDehazy"
                      style="--el-switch-on-color: #13ce66"
                    />
                    <span class="switch-option-text">去烟雾</span>
                  </span>
                </div>
              </div>
              <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="手术步骤" name="step">
                  <div class="operation-steps__content content-textaria">
                    <div style="height: 150px">
                      <!-- <el-steps direction="vertical" :active=playbackProgress>
                        <el-step v-for="({text}, index) in activeVideo.metadata.phase" :key="index" :title="text" />
                      </el-steps> -->
                      <VueFlow v-model="elements" :class="{ dark }" class="basicflow" :default-viewport="{ zoom: 0.8 }" :min-zoom="0.2" :max-zoom="4">
                        <Background :pattern-color="dark ? '#FFFFFB' : '#aaa'" gap="8" />
                      </VueFlow>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="视频描述" name="caption">
                  <div class="video-caption-wrapper">
                    <div class="video-time-audio">
                      <div class="video-caption-time">时间：{{ captionTime }}</div>
                      <!-- <audio :key="audioUrl" controls>
                        <source :src="audioUrl">
                      </audio> -->
                    </div>
                    <div class="video-caption-content">描述：{{ captionContent }}</div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
        </div>
      </el-main>
      <el-aside>
        <div class="video-sidebar right-sidebar">
          <el-card shadow="hover">
            <el-descriptions :column="2">
              <template #title>
                <div class="info-header">受术者信息</div>
              </template>
              <el-descriptions-item label="年龄："
                >{{ activeVideo.surgery_info.age || '不明' }}</el-descriptions-item
              >
              <el-descriptions-item label="性别：">{{ activeVideo.surgery_info.sex || '不明' }}</el-descriptions-item>
              <el-descriptions-item label="身高："
                >{{ activeVideo.surgery_info.height || 'xxx ' }}cm</el-descriptions-item
              >
              <el-descriptions-item label="体重："
                >{{ activeVideo.surgery_info.weight || 'xxx ' }}kg</el-descriptions-item
              >
              <el-descriptions-item label="术前情况：" :span="2">
                {{ activeVideo.surgery_info.condition || '不明' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-card shadow="hover">
            <div class="operation-brief">
              <div class="info-header">手术简介</div>
              <div class="operation-brief__content content-textaria">
                {{activeVideo.courseId=='cid202412201519' ? activeVideo.surgery_info.introduction : activeVideoCourse.courseDescription}}
              </div>
            </div>
            
          </el-card>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<style scoped>
.main-container {
  --el-checkbox-text-color: #606266;
  --el-checkbox-font-weight: 500;
}

.switch-option-text {
  display: inline-block;
  padding-left: 8px;
  line-height: 1;
  font-size: var(--el-checkbox-font-size);
}

.switch-button__item {
  color: var(--el-checkbox-text-color);
  font-weight: var(--el-checkbox-font-weight);
  font-size: var(--el-font-size-base);
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  user-select: none;
  margin-right: 30px;
  height: 32px;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.main-container > div:not(:last-child),
.main-container .el-card__body > div:not(:last-child) {
  margin-bottom: 16px;
}

.course-name {
  font-size: large;
  font-weight: bold;
}

.title-area > div {
  margin-bottom: 4px;
}

.title-area {
  text-align: left;
}

.content-textaria {
  text-align: left;
}

.operation-brief__content {
  text-indent: 2em;
}

.right-sidebar > .el-card {
  margin-bottom: 8px;
}

.info-header {
  display: flex;
  align-items: flex-start;
  color: rgb(0, 0, 0);
  font-weight: bold;
  font-size: large;
  margin: 4px 0;
}

.video-cover {
  width: 55%;
}

.video-display-table-row__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.video-info {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.other-videos-bar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* .main-container {
  margin-top: 30px;
} */
.step-and-button {
  display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.switch-button {
  text-align: left;
  display: flex;
}

/* .video-sidebar {
  margin-top: 50px;
} */
.left-sidebar-bot {
  margin-top: 10px;
}

.return-button {
  display: flex;
}

.return-button__item {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.return-button__item:hover {
  color: var(--el-menu-hover-text-color);
}

:deep(.el-divider--horizontal) {
  margin: 8px 0;
}


:deep(.vue-flow__node) {
  font-size: large;
  width: 100px;
  font-weight: 500;
  border-width: 2px;
  border-color: rgb(59, 59, 59);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  align-items: center;
}

.video-main {
  padding-top: 0;
}

.video-name {
  text-align: left;
  font-weight: 600;
}

.video-info-name {
  max-width: 130px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.video-caption-wrapper{
  justify-items: flex-start;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.video-time-audio{
  width: 100%;
  display: flex;
  align-items: center;
}

.video-caption-time{
  font-weight: bold;
  margin-right: 30px;
}

.video-caption-content{
  text-align: left;
  margin-top: 10px;
}
</style>

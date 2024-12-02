<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-04 15:08:28
 * @LastEditors: MaZhe
 * @LastEditTime: 2024-07-25 11:16:12
-->
<template>
    <div :class="{ dark: isDarkMode }">
        <el-container class="main-container">
        <el-header class="main-header">
            <span>内容来源：https://zh.wikipedia.org/wiki/{{ pageName }}</span>
            <el-button @click="toggleDarkMode" class="dark-mode-toggle">深色模式</el-button>
        </el-header>
        <el-container class="inner-container">
            <!-- 左侧目录（保持不变） -->
            <el-aside class="contents" style="width: 15%;">
            <nav class="nav-contents">
                <div class="contents-title">目录</div>
                <div class="contents-list">
                <div v-html="contents"></div>
                </div>
            </nav>
            </el-aside>

            <!-- 中间正文和右侧媒体部分 -->
            <el-main class="content-area" style="width: 85%;">
            <!-- 中间正文 -->
            <div class="text-section">
                <h1 class="first-heading">{{ pageName }}</h1>
                <div class="abstract" :style="{ color: isDarkMode ? '#ffffff' : '#000000' }">
                <div v-html="abstract"></div>
                </div>
                <div class="content-details" :style="{ color: isDarkMode ? '#ffffff' : '#000000' }">
                <div v-html="mainContent"></div>
                </div>
            </div>

            <!-- 右侧图片和视频 -->
            <div class="media-section">
                <div v-for="(video, index) in videos" :key="`video-${index}`" class="video-container">
                <video controls style="width: 100%; height: auto;">
                    <source :src="video.URL.startsWith('/media') ? video.URL : `/media${video.URL.slice(1)}`" type="video/mp4" />
                    您的浏览器不支持视频播放。
                </video>
                <div class="media-Caption">{{ video.Caption }}</div>
                </div>

                <div v-for="(image, index) in images" :key="`image-${index}`" class="image-container">
                <img :src="image.URL.startsWith('/media') ? image.URL : `/media${image.URL.slice(1)}`" :alt="image.Caption" 
                        style="width: 100%; height: auto;" 
                        @mouseenter="showTooltip(image.Caption)" 
                        @mouseleave="hideTooltip"/>
                <div class="media-Caption">{{ image.Caption }}</div>
                </div>
            </div>

            
            </el-main>
        </el-container>

        <!-- 悬浮提示框 -->
        <div v-if="tooltipVisible" :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }" class="tooltip">
            {{ tooltipContent }}
        </div>
        </el-container>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from "vue-router";
import { getPagesByPageName } from "../../utils/request/knowledge";
import axios from 'axios';


const vocabularyList = ['泌尿系统', '前列腺癌', '前列腺', '前列腺肥大'];
const getHref = (word) => `/knowledge/${word}/content`;

const route = useRoute();
const pageName = route.params.pageName;

const curPage = reactive({
pageName: "",
pageContent: "",
courseTypeId: "",
});
const hasDataPrepared = ref(false);
const abstract = ref('');
const mainContent = ref('');
const contents = ref('');
const images = ref([]);
const videos = ref([]);
const isDarkMode = ref(false);

// 悬浮框的控制
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = reactive({ x: 0, y: 0 });

// 关联知识数据
const corrsepondingKnowledge = ref([]);

// 切换深色模式
const toggleDarkMode = () => {
isDarkMode.value = !isDarkMode.value;
};

onMounted(async () => {
await getCurPage();
// 从静态文件 global_corresponding_know.json 中加载全局知识数据
// try {
//   const response = await axios.get('/static/knowledge/global_corresponding_know.json');
//   // 将静态文件的数据转换为原来 corrsepondingKnowledge 的格式
//   corrsepondingKnowledge.value = Object.entries(response.data).map(([name, info]) => ({ name, info }));
// } catch (error) {
//   console.error('加载 global_corresponding_know 数据失败:', error);
// }
// 从 curPage 数据中获取关联知识并加载到 corrsepondingKnowledge
if (curPage.pageContent.corrseponding_know) {
    curPage.pageContent.corrseponding_know.forEach(section => {
    // 遍历每个分类项（例如“器官”）
    Object.keys(section).forEach(categoryName => {
        // 每个分类的所有子项
        const categoryItems = section[categoryName];
        
        // 遍历该分类中的每个条目
        categoryItems.forEach(item => {
        Object.keys(item).forEach(subCategory => {
            // 将所有子分类和信息保存到 `corrsepondingKnowledge`
            corrsepondingKnowledge.value.push({
            name: subCategory,
            info: item[subCategory].join(', '), // 连接相关的关键词
            });
        });
        });
    });
    });
}
// 获取并处理 abstract 部分
const abstractContent = curPage.pageContent.smi_structure_know.abstract.join(" ");
abstract.value = processAbstract(abstractContent);  // 处理摘要部分

// 获取并处理 content 部分
const contentList = curPage.pageContent.smi_structure_know.paragraphs;
mainContent.value = processMainContent(contentList);  // 处理正文部分

contents.value = processContents(curPage.pageContent.smi_structure_know.paragraphs);

const mediaResources = curPage.pageContent?.smi_structure_know?.media_resources || [];
mediaResources.sort((a, b) => a.Order - b.Order);
images.value = mediaResources.filter(item => item.Type === "Image");
videos.value = mediaResources.filter(item => item.Type === "Video");


console.log('关联知识数据:', corrsepondingKnowledge.value);
hasDataPrepared.value = true;
});

watch(mainContent, () => {
setTimeout(() => {
    const hoverableElements = document.querySelectorAll('.hoverable');
    console.log(`找到 ${hoverableElements.length} 个 hoverable 元素`);
    hoverableElements.forEach(element => {
    element.addEventListener('mouseenter', (event) => {
        const content = event.target.getAttribute('data-info');
        console.log(`显示悬浮内容: ${content}`);
        showTooltip(content, event);
    });
    element.addEventListener('mouseleave', hideTooltip);
    });
}, 100);
});


const getCurPage = async () => {
try {
    const page = (await getPagesByPageName({pageName})).data.results[0];
    for (const key in page) {
    if (curPage.hasOwnProperty(key)) {
        curPage[key] = page[key];
    }
    }
} catch (err) {
    console.error(err);
}
};

// 处理悬浮显示
const showTooltip = (content) => {
tooltipContent.value = content;
tooltipVisible.value = true;
};

const hideTooltip = () => {
tooltipVisible.value = false;
};

const updateTooltipPosition = (event) => {
tooltipPosition.x = event.pageX + 40;
tooltipPosition.y = event.pageY - 10;
};

document.addEventListener('mousemove', updateTooltipPosition);

function processParagraph(pList, className){
let result = '';
pList.forEach(p => {
    let text = '';
    p.forEach(word => {
    text += vocabularyList.includes(word) ? `<a href="${getHref(word)}">${word}</a>` : word;
    });
    result += `<div class="${className}"><p>${text}</p></div>`;
});
return result;
}
// 提取的关键词替换逻辑
function replaceKeywords(text) {
let result = text;

corrsepondingKnowledge.value.forEach(item => {
    const escapedKeyword = item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // 转义正则特殊字符
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    // 替换匹配到的关键词
    if (regex.test(result)) {
    result = result.replace(
        regex,
        `<span style="color: #00bfae;" class="hoverable" data-info="${item.info.replace(/'/g, "\\'")}">$1</span>`
    );
    }
});

return result;
}

function processAbstract(abstractContent) {
let result = abstractContent;

// 使用独立的替换函数进行关键词替换
result = replaceKeywords(result);

// 返回处理后的摘要部分
return `<div class="abstract"><p>${result}</p></div>`;
}

function processMainContent(contentList) {
let result = '';

contentList.forEach(content => {
    // 处理标题
    const titleId = content.title.replace(/\s+/g, '-').toLowerCase();
    if (content.tag === 'h2') {
    result += `<hr class="content-divider"><h2 class="second-heading" id="${titleId}">${content.title}</h2>`;
    } else if (content.tag === 'h3') {
    result += `<h3 class="third-heading" id="${titleId}">${content.title}</h3>`;
    }

    // 处理每个段落内容
    let paragraphText = content.content.join(" ");
    
    // 使用独立的替换函数进行关键词替换
    let processedParagraph = replaceKeywords(paragraphText);

    result += `<div class="main-paragraph"><p>${processedParagraph}</p></div>`;
});

return result;
}


function processContents(contentList) {
let result = '<ul><li><a href="#">序言</a></li>';
contentList.forEach(content => {
    const titleId = content.title.replace(/\s+/g, '-').toLowerCase();
    if (content.tag === 'h2') {
    result += `<li><a href="#${titleId}">${content.title}</a></li>`;
    } else if (content.tag === 'h3') {
    result += `<li class="li-h3"><a href="#${titleId}">${content.title}</a></li>`;
    }
});
result += '</ul>';
return result;
}
</script>

<style scoped>


body, .main-container, .contents, .main-header, .inner-container, .contents-list, .main-content {
font-family: "STSong", "华文中宋", serif; /* 设置为华文中宋，添加后备字体 */
}

.main-container {
max-width: 100%;
margin: 0;
padding: 1em;
background-color: #ffffff;
}

.main-header {
display: flex;
justify-content: space-between;
padding: 1em;
color: #888;
background-color: #ffffff;
border-bottom: 1px solid #e0e0e0;
}

.inner-container {
display: flex;
margin-left: 15%;
}

.contents {
position: fixed;
left: 1em;
top: 13em;
width: 15%;
padding: 1em;
background-color: #fafafa;
border-radius: 8px;
box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
overflow: hidden;
}

.contents-list ul {
list-style: none;
padding: 0;
margin: 0;
text-align: left;
}

.contents-title {
font-weight: bold;
font-size: 1.1rem;
color: #333;
margin-bottom: 0.5em;
text-align: left;
}

.contents-list li {
padding: 0.8em 0;
margin-left: 0;
}

.contents-list li a {
color: #007acc;
font-weight: bold;
text-decoration: none;
}

.contents-list li a:hover {
color: #005999;
}

.contents-list .li-h3 {
margin-left: 1.5em;
padding-top: 0.5em;
padding-bottom: 0.5em;
font-weight: normal;
color: #555;
}
.content-area {
display: flex;
width: 100%;
margin-left: 1em;
}

.text-section {
width: 60%;
padding-right: 20px;
color: inherit;
text-align: left;
}

.media-section {
width: 40%;
display: flex;
flex-direction: column;
gap: 20px;
text-align: left;
margin-top: 138px; /* 下移媒体部分 */
}

.image-container,
.video-container {
position: relative;
}

.media-Caption {
text-align: center;
font-size: 0.9em;
color: #666;
margin-top: 5px;
}

.main-container {
max-width: 100%;
margin: 0;
padding: 1em;
background-color: #ffffff;
}

.dark .contents {
background-color: #242424;
color: #d3d3d3;
}

.dark .contents-title {
color: #e0e0e0;
}

.dark .contents-list li a {
color: #80dfff;
}

.dark .contents-list li a:hover {
color: #a8e0ff;
}

.dark-mode-toggle {
margin-left: auto;
}

.dark {
background-color: #121212;
color: #ffffff;
}

.dark .main-header {
background-color: #1e1e1e;
color: #bbbbbb;
border-color: #333;
}

.dark .main-container {
background-color: #121212;
}

.dark h1, .dark h2, .dark h3, .dark p, .dark .abstract, .dark .content-details, .dark .main-paragraph, .dark .li-h3 {
color: #ffffff;
}
.dark .media-Caption {
color: #cccccc;
}
.nav-contents {
max-height: 70vh;
overflow-y: auto;
padding: 0.5em;
text-align: left;
}

.main-content {
width: calc(100% - 300px);
padding-left: 1em;
text-align: left;
}

.main-content, .contents {
margin-left: 0;
}

:deep(ul) {
list-style-type: none;
padding: 0;
text-align: left;
}

:deep(li) {
padding: 0.6em 0;
font-size: 0.9rem;
color: #444;
text-align: left;
margin-left: 0;
}

.li-h3 {
margin-left: 1.2em;
}

.content-divider {
border: none;
border-bottom: 1px solid #d3d3d3;
margin: 1em 0;
}

:deep(a) {
color: #007acc;
}

:deep(a:hover) {
color: #005999;
}

.first-heading {
font-family: 'Merriweather', 'Georgia', 'Times', serif;
font-size: 2.2em;
color: #222;
}

:deep(h2) {
margin-top: 2em;
font-size: 1.75em;
color: #333;
margin-left: 0;
}

:deep(h3) {
font-weight: bold;
font-size: 1.4em;
}

.content-divider {
border: none;
border-bottom: 1px solid #d3d3d3;
margin: 1em 0;
}

.tooltip {
position: absolute;
background-color: #333;
color: #fff;
padding: 8px;
border-radius: 4px;
z-index: 1000;
white-space: nowrap;
pointer-events: none;
display: inline-block;  /* 确保显示 */
transform: translate(-20%, -100%); /* 将浮窗位置调到鼠标的上方中心 */
}
.hoverable {
color: #3498db;
cursor: pointer;
text-decoration: underline;

}
.hoverable:hover {
color: #00bfae; /* 悬停时的颜色，可以根据需要调整 */
font-weight: bold; /* 悬停时加粗 */
/* 使用内联样式的颜色设置 */
}
.highlighted {
color: #00bfae; /* 蓝绿色 */
font-weight: bold; /* 可选，增加加粗效果 */
}
</style>
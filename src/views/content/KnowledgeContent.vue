<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-04 15:08:28
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-07-25 11:16:12
-->
<template>
    <div>
        <el-container class="main-container">
            <el-header class="main-header">内容来源：https://zh.wikipedia.org/wiki/{{ pageName }}</el-header>
            <el-container class="inner-container">
                <el-aside class="contents">
                    <nav class="nav-contents">
                        <div class="contents-title">目录</div>
                        <div class="contents-list">
                            <div v-html="contents"></div>
                        </div>
                    </nav>
                </el-aside>
                <el-main>
                    <h1 class="first-heading">{{ pageName }}</h1>
                    <div>
                        <div class="abstract">
                            <div v-html="abstract"></div>
                        </div>
                        <div class="main-content">
                            <div v-html="mainContent"></div>
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { getPagesByPageName } from "../../utils/request/knowledge";
const text = '这是一段测试文本，其中包含了一些词汇，如泌尿系统、前列腺癌等，还有前列腺癌';
const vocabularyList = ['泌尿系统', '前列腺癌', '前列腺', '前列腺肥大'];
const getHref = (word) => {
    return `/knowledge/${word}/content`;
}
const formattedText = ref(text.replace(new RegExp(vocabularyList.join('|'), 'g'), (match) => {
  return `<a href="${(() => getHref(match))()}">${match}</a>`;
}));

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
onMounted(async () => {
  await getCurPage();
  abstract.value = processParagraph(curPage.pageContent.smi_structure_know.abstract, 'abstract-paragraph')
  mainContent.value = processMainContent(curPage.pageContent.smi_structure_know.paragraphs)
  contents.value = processContents(curPage.pageContent.smi_structure_know.paragraphs)
  hasDataPrepared.value = true;
});

const getCurPage = async () => {
  try {
    const page = (await getPagesByPageName({pageName})).data.results[0];
    for (const key in page) {
      if (Object.hasOwnProperty.call(page, key)) {
        if (curPage.hasOwnProperty(key)) {
            curPage[key] = page[key];
        }
      }
    }
    console.log(curPage)
  } catch (err) {
    console.error(err);
  }
};

function processParagraph(pList, className){
    var result = '';
    pList.forEach(p=>{
        var text = '';
        p.forEach(word=>{
            if (vocabularyList.includes(word)){
                text = text + `<a href="${(() => getHref(word))()}">${word}</a>`
            }else{
                text += word
            }
        })
        text = `<div class="${className}"><p>${text}</p></div>`
        result += text;
    })
    return result;
}

function processMainContent(contentList){
    var result = '';
    contentList.forEach(content=>{
        if (content.tag=='h2'){
            result += `<h2 class="second-heading" id="${content.title}">${content.title}</h2>`
        }else if(content.tag=='h3'){
            result += `<h3 class="third-heading" id="${content.title}">${content.title}</h3>`
        }
        const paras = processParagraph(content.content, 'main-paragraph')
        if(paras.length>0){
            result += paras
        }
    })
    return result;
}

function processContents(contentList){
    var result = '';
    result += '<ul><li><a href="#">序言</li>'
    contentList.forEach(content=>{
        if (content.tag=='h2'){
            result += `<li><a href="#${content.title}">${content.title}</a></li>`
        }else if(content.tag=='h3'){
            result += `<li class="li-h3"><a href="#${content.title}">${content.title}</a></li>`
        }
    })
    result += '</ul>'
    return result;
}
</script>

<style lang="css" scoped>
.main-container {
    position: relative;
    z-index: 0;
    padding-top: 0;
    padding-bottom: 0.05px;
    max-width: 99.75em;
    min-width: 31.25em;
    margin: 0 auto;
    padding-left: 1.5em;
    padding-right: 1.5em;
    background-color: #ffffff;
    box-sizing: border-box;
}
.main-header {
    height: auto;
    font-family: sans-serif;
    font-size: small;
}
.inner-container {
    text-align: left;
    
    .contents {
        width: 270px;
        padding-left: 22px;
        .nav-contents{
            position: fixed;
            width: 200px;
            height: 80%;
            overflow-y: scroll;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* IE 10+ */
            .contents-title {
                padding: 12px 0 7px 0;
                margin-top: 17px;
                margin-bottom: -1px;
                border-bottom: 1px solid #eaecf0;
                color: #54595d;
                font-size: 0.875rem;
            }
            :deep(ul){
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            :deep(li){
                padding: 6px 0;
                font-weight: bold;
                font-family: sans-serif;
                font-size: 0.875rem;
            }
            :deep(.li-h3){
                margin-left: 15px;
            }
            :deep(a){
                color: #3366cc;
            }
        }
    }

    .first-heading {
        padding: 0;
        font-family: 'Linux Libertine','Georgia','Times',serif;
        line-height: 1.375;
        word-wrap: break-word;
        margin-bottom: 0;
        margin-top: 0;
        flex-grow: 1;
        border: 0;
        font-size: 1.8em;
        box-shadow: 0 1px #a2a9b1;
    }
    :deep(h2) {
        margin-top: 1em;
        font-size: 1.5em;
        margin-bottom: 0.25em;
        padding: 0;
        font-family: 'Linux Libertine','Georgia','Times',serif;
        line-height: 1.375;
        font-weight: normal;
        border-bottom: 1px solid #a2a9b1;
    }
    :deep(h3) {
        font-weight: bold;
        font-size: 1.2em;
        line-height: 1.6;
    }
    :deep(a){
        color: #3366cc;
    }
    :deep(p){
        font-size: 0.938rem;
        line-height: 1.6;
        color: #202122;
        font-family: sans-serif;
    }
}

</style>
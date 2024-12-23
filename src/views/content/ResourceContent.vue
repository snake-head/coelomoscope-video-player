<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: ZhuYichen
 * @Date: 2023-09-04 15:08:28
 * @LastEditors: ZhuYichen
 * @LastEditTime: 2024-12-23 13:51:36
-->
<template>
    <div>
        <div class="banner"></div>
        <div class="show-iframe">
            <iframe ref="myIframe" top="10px" id="iframe1" width="1600" height="900" frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' allowtransparency='yes' :src="'https://view.officeapps.live.com/op/view.aspx?src='+curPage.resourceUrl"></iframe>
        </div>
        <div class="placeholder"></div>
    </div>
  </template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { getResourceByResourceId } from "../../utils/request/resource";
const pathUrl = 'https://slaw-wx-static.oss-cn-hangzhou.aliyuncs.com/SoniCure.pptx'

const route = useRoute();
const pageName = route.params.pageName;

const curPage = reactive({
    resourceName: "",
    resourceUrl: "",
    courseId: "",
});
const hasDataPrepared = ref(false);

onMounted(async () => {
  await getCurPage();
  hasDataPrepared.value = true;
})

const getCurPage = async () => {
  try {
    const page = (await getResourceByResourceId(pageName)).data.results[0];
    for (const key in page) {
      if (Object.hasOwnProperty.call(page, key)) {
        if (curPage.hasOwnProperty(key)) {
            curPage[key] = page[key];
        }
      }
    }
    console.log(curPage)
    curPage.resourceUrl = curPage.resourceUrl.replace('omentor.vico-lab.com:3443', 'www.medevice.pro');
    // curPage.resourceUrl = 'https://slaw-wx-static.oss-cn-hangzhou.aliyuncs.com/SoniCure.pptx'
  } catch (err) {
    console.error(err);
  }
};
</script>

<style lang="scss" scoped>
.banner {
    position: absolute;
    top: 106px;
    width: 100%;
    height: 78px;
    background-color: #F8F9FA;
    z-index: 1000;
    display: none;
}
.show-iframe{
    position: absolute;
    left: calc(50% - 800px);
    top: 26px;
}
.placeholder{
    width: 100%;
    height: 820px;
    background-color: #F8F9FA;
}
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
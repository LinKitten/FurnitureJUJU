<template>
    <link type="text/css" rel="stylesheet" href="css/typelist.css" />

    <van-nav-bar title="商品分类" />
    <van-tree-select v-model:main-active-index="activeIndex" height="100vw" :items="items">
        <template #content>
            <van-image v-if="activeIndex === 0" src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg" />
        </template>
    </van-tree-select>
    <!-- 底部标签栏 -->
    <Menu></Menu>
</template>

<script setup>
// 引入组件
import Menu from "@/components/common/Menu.vue";    
import { onBeforeMount, reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";
// 引入城市省市区数据包
import { areaList } from "@vant/area-data";
// 引入封装的post方法
import { POST, UPLOAD } from "@/services/request";

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

const activeId = ref(1);
const activeIndex = ref(0);
const items = [
    {
        text: "浙江",
        children: [
            { text: "杭州", id: 1 },
            { text: "温州", id: 2 },
            { text: "宁波", id: 3, disabled: true },
        ],
    },
    {
        text: "江苏",
        children: [
            { text: "南京", id: 4 },
            { text: "无锡", id: 5 },
            { text: "徐州", id: 6 },
        ],
    },
    { text: "福建", disabled: true },
];
</script>

<style></style>
<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <link type="text/css" rel="stylesheet" href="/css/typelist.css" />
  <!-- 搜索框 -->

  <div class="topBox">
    <div class="L">{{ site }}</div>
    <div class="C">
      <div class="saerchbox">
        <input name="" type="text" placeholder="请输入您要搜索的内容" /><img
          src="/images/ss.png"
        />
      </div>
    </div>
    <div class="R"><img src="/images/tr.png" /></div>
  </div>

  <div class="clear"></div>
  <!-- 轮播图 -->
  <van-swipe :autoplay="3000" :height="200" lazy-render>
    <van-swipe-item v-for="item in banner">
      <router-link :to="{ path: '/product/info', query: { proid: item.id } }">
        <img :src="item.bannerimg_text" />
      </router-link>
    </van-swipe-item>
  </van-swipe>

  <div class="clear"></div>

  <!-- 分类 金刚区 -->
  <div class="lqgwBox">
    <ul>
      <li>
        <!-- 全部商品 -->
        <router-link to="/product/list">
          <img src="/images/icon_5.png" />
          <p>全部分类</p>
        </router-link>
      </li>

      <li v-for="item in typelist">
        <!-- 单品分类需要传递该分类id -->
        <router-link
          :to="{ path: '/product/list', query: { typeid: item.id } }"
        >
          <img :src="item.thumb_text" />
          <p>{{ item.name }}</p>
        </router-link>
      </li>
    </ul>
  </div>

  <!--新品 广告 -->
  <van-swipe :autoplay="3000" :height="200" lazy-render>
    <van-swipe-item v-for="item in news">
      <img :src="item.bannerimg_text" />
    </van-swipe-item>
  </van-swipe>

  <div class="clear"></div>
  <!-- 热销 -->
  <ul class="proul">
    <li v-for="item in hots" class="procart">
      <div class="con">
        <router-link :to="{ path: '/product/info', query: { proid: item.id } }">
          <img :src="item.thumbs_text" />
          <p><span>￥</span>{{ item.price }}</p>
        </router-link>
      </div>
    </li>
  </ul>

    <Menu></Menu>
</template>

<script setup>
import { POST, UPLOAD } from "@/services/request";
import { useRouter } from "vue-router";
import { reactive, ref, onBeforeMount } from "vue";

// 引入组件
import Menu from "@/components/common/Menu.vue";

let typelist = ref([]);
//初始化轮播图数据
let banner = ref([]);
//初始化新品数据
let news = ref({});
//初始化热销商品数据
let hots = ref([]);
//初始化logo
let site = ref("FAST");

// 挂载前加载
onBeforeMount(async () => {
  var result = await POST({
    url: "/index/index",
  });

  // 赋值
  typelist.value = result.data.typelist;
  banner.value = result.data.banner;
  news.value = result.data.news;
  hots.value = result.data.hots;
  site.value = result.data.site;
});
</script>

<style>
.proul .procart{
  width: 47%;
  border-radius: 10px;
}
</style>


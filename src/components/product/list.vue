<template>
  <link type="text/css" rel="stylesheet" href="/css/style1.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      :title="TypeName"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    >
      <!-- 点击弹出搜索框 -->
      <template #right>
        <van-icon name="search" size="18" @click="SearchShow = true" />
      </template>
    </van-nav-bar>
    <!-- 弹出层 -->
    <van-popup v-model:show="SearchShow" position="top">
      <!-- 搜索框 -->
      <van-search
        @search="search"
        v-model="keywords"
        placeholder="请输入搜索关键词"
      />
    </van-popup>

    <!-- 下拉菜单 筛选  -->
    <van-dropdown-menu>
      <!-- 分类 -->
      <van-dropdown-item
        v-model="TypeActive"
        :options="TypeList"
        @change="TypeToggle"
      />
      <!-- 商品状态 -->
      <van-dropdown-item
        v-model="FlagActive"
        :options="FlagList"
        @change="FlagToggle"
      />
      <!-- 时间、库存、价格 -->
      <van-dropdown-item
        v-model="SortActive"
        :options="SortList"
        @change="SortToggle"
      />
      <!-- 排序 -->
      <van-dropdown-item
        v-model="ByActive"
        :options="ByList"
        @change="ByToggle"
      />
    </van-dropdown-menu>
  </van-sticky>

  <!-- 商品利列表  pullRef下拉刷新 list上拉加载-->

  <van-pull-refresh v-model="refreshing" @refresh="refresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :offset="5"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onload"
    >
      <ul class="proul">
        <li v-for="item in list">
          <router-link
            :to="{ path: '/product/info', query: { proid: item.id } }"
            ><img :src="item.thumbs_text"
          /></router-link>
          <router-link
            :to="{ path: '/product/info', query: { proid: item.id } }"
          >
            <p class="tit">{{ item.name }}</p>
          </router-link>
          <div class="price">
            <p>￥{{ item.price }}</p>
          </div>
        </li>
      </ul>
    </van-list>
  </van-pull-refresh>

  <!-- 返回顶部 -->
  <van-back-top right="20" bottom="60" />

  <!-- 底部标签 -->
  <Menu></Menu>
</template>


<script setup>
import { useRouter, useRoute } from "vue-router";
import { reactive, ref, onBeforeMount } from "vue";
import { POST, UPLOAD } from "@/services/request";
import Menu from "@/components/common/Menu.vue";

// 初始化路由
const router = useRouter();
const route = useRoute();

/* ------------初始参数begin------ */

// 获取传递的商品分类参数
let TypeActive = route.query.hasOwnProperty("typeid") ? route.query.typeid : 0;
TypeActive = parseInt(TypeActive);
TypeActive = ref(TypeActive); //响应式数据

let list = ref([]); // 列表数据

// 上拉下拉数据
let loading = ref(false);
let finished = ref(false);
let refreshing = ref(false);
// 初始化页数
let page = ref(1);

// 初始化商品分类名称
let TypeName = ref("全部商品");
// 初始化商品状态
let FlagActive = ref("0");
// 初始化创建时间
let SortActive = ref("createtime");
// 初始化排序
let ByActive = ref("desc");
// 弹出搜索框状态
let SearchShow = ref(false);
// 搜素关键词
let keywords = ref("");

// 商品分类
let TypeList = [{ text: "全部分类", value: 0 }];

// 商品状态
let FlagList = [
  { text: "全部商品", value: "0" },
  { text: "新品", value: "1" },
  { text: "热销", value: "2" },
  { text: "推荐", value: "3" },
];

let SortList = [
  { text: "按上架时间", value: "createtime" },
  { text: "按价格", value: "price" },
  { text: "按库存", value: "stock" },
];

// 排序
let ByList = [
  { text: "降序", value: "desc" },
  { text: "升序", value: "asc" },
];

/* ------------初始参数end----- */

/* ---------------- 下拉菜单切换选项触发事件begin----------------------- */

// 分类
const TypeToggle = async (value) => {
  TypeActive.values= value;
  console.log( TypeActive.values );
  refresh();
};

//商品属性
const FlagToggle = async (value) => {
  FlagActive.value = value;
  refresh();
};

//时间、库存、价格切换
const SortToggle = async (value) => {
  SortActive.value = value;
  refresh();
};

//排序切换
const ByToggle = async (value) => {
  ByActive.value = value;
  refresh();
};

//搜索
const search = async (value) => {
  SearchShow.value = false;
  keywords.value = value;
  refresh();
};

/* ---------------- 下拉菜单切换选项触发事件ends----------------------- */

//下拉刷新 触发
const refresh = async () => {
  // 清空数据
  list.value = [];
  //   恢复第一个页数
  page.value = 1;
  //更改状态下拉状态
  finished.value = false;
  //   更改加载状态
  loading.value = true;
  onload();
};

//上拉加载触发
const onload = async () => {
//   console.log(222);
  // 更改状态
  if (refreshing.value) {
    refreshing.value = false;
  }
  ListData();
};

//发送请求商品数据
const ListData = async () => {
  // 搭建数据
  var data = {
    typeid: TypeActive.value,
    page: page.value,
    flag: FlagActive.value,
    sort: SortActive.value,
    by: ByActive.value,
    keywords: keywords.value,
  };

  // 请求接口
  var result = await POST({
    url: "/index/list",
    params: data,
  });

  //  更新加载状态
  loading.value = false;

  //   获取分类名
  TypeName.value = result.data.TypeName;

  if (result.code == 0 || result.data.list.length <= 0) {
    finished.value = true;
  } else {
    list.value = list.value.concat(result.data.list);
    page.value++;
  }
};

//请求分类
const type = async () => {
//   console.log(111);
  var result = await POST({
    url: "/index/type",
  });

  for (var item of result.data) {
    TypeList.push({
      text: item.name,
      value: item.id,
    });
  }
};

// 挂载前加载
onBeforeMount(() => {
  type();
  onload();
});

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};


</script>

<style>
</style>
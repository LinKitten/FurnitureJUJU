<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="消费记录"
    left-text="返回"
    left-arrow
    @click-left="onClickLeft"
  />

  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :offset="4"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 消费记录卡片 -->
      <van-cell-group inset v-for="item in recordList">
        <van-cell
          :border="false"
          size="large"
          title="消费金额"
          :value="item.total"
        />x
        <van-cell
          :border="false"
          title="消费描述"
          :value="item.content"
          :label="item.createtime_text"
        />
      </van-cell-group>
    </van-list>
  </van-pull-refresh>
</template>
<script setup>
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

// 获取用户信息
var business = cookies.get("business") ? cookies.get("business") : {};
let recordList = ref([]);

let limit = ref(6);
let page = ref(1);

//挂载前获取数据
// onBeforeMount(async () => {
//   //组建数据
//   var data = {
//     busid: business.id,
//     limt: limt,
//     page: page,
//   };

//   // 发送请求
//   var result = await POST({
//     url: "/business/record",
//     params: data,
//   });

//   result.data.forEach((item) => {
//     recordList.push(item);
//   });
// });

// 上拉加载，下拉刷新
let loading = ref(false); //是否处于加载状态
let finished = ref(false); //加载完成该为false
let refreshing = ref(false); //下拉刷新是的成功

// 当组件滚动到底部 触发
const onLoad = async () => {
  if (refreshing.value) {
    // 状态
    refreshing.value = false;
  }

  List(); //请求数据
};

const List  = async () => {
  //组建数据
  var data = {
    busid: business.id,
    limit: limit.value,
    page: page.value,
  };
  // 发送请求
  var result = await POST({
    url: "/business/record",
    params: data,
  });

  loading.value = false;

  if (result.code == 0 || result.data.list.length <= 0) {
    finished.value = true;
  } else {
    recordList.value = recordList.value.concat(result.data.list);
    page.value++;
  }
};
// 下拉刷新时会触发
const onRefresh = async () => {
  // 清空列表数据
  finished.value = false;

  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true;

  recordList.value = [];
  // 设置为第一个页面
  page.value = 1;
  onLoad();
};

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};
</script>

<style>
.van-cell-group {
  box-shadow: 0px 4px 10px 4px rgba(172, 192, 212, 0.383) !important;
  margin-top: 10px !important;
}
</style>
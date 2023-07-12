<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <link type="text/css" rel="stylesheet" href="/css/typelist.css" />
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar title="物流信息" left-text="返回" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
  </van-sticky>

  <!-- 步骤条 物流信息   -->
  <van-steps direction="vertical" :active="0">
    <van-step v-for="item in expressList">
      <h3>{{ item.status }}</h3>
      <p>{{ item.time }}</p>
    </van-step>
  </van-steps>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";
// 引入router
import { useRouter, useRoute } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";
// 引入封装的post方法
import { POST, UPLOAD } from "@/services/request";

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();
var route = useRoute();

// 获取用户
var business = cookies.get("business") ? cookies.get("business") : {};
//获取用户id
var busid = business.hasOwnProperty("id") ? business.id : 0;
//获取订单ID
var orderid = route.query.hasOwnProperty('orderid') ? route.query.orderid : 0;

// 物流信息列表
var expressList = ref([]);

onBeforeMount(async () => {

  var result = {
    data: {
      courier: "",
      courierPhone: "",
      expName: "",
      list: [
        { time: "2023-07-03 12:31:35",status: "【广州市】 您的包裹已妥投，如有疑问请电联快递员：杨涌(18620582420) "},
        { time: "2023-07-03 08:48:15",status: "【广州市】广东广州番禺区星河湾服务部 快递员 杨涌（18620582420） 正在为您派送【95121为韵达快递员外呼专属号码，请放心接听】" },
        { time: "2023-07-03 07:54:43", status: "【广州市】已到达 广东广州番禺区星河湾服务部[020-32435526]" },
        { time: "2023-07-03 03:50:37", status: "【佛山市】已离开 广东佛山分拨交付中心；发往 广东广州番禺区星河湾服务部" },
        { time: "2023-07-03 02:55:58", status: "【佛山市】已到达 广东佛山分拨交付中心" },
        { time: "2023-07-03 00:57:34", status: "【广州市】已离开 广东广州分拨交付中心；发往 广东佛山分拨交付中心" },
        { time: "2023-07-02 23:09:55", status: "【广州市】已到达 广东广州分拨交付中心" },
        { time: "2023-07-02 22:11:51", status: "【广州市】广东广州誉承公司-杨振威（17620227486） 已揽收" },
      ],
    },
    msg: "查询物流信息成功",
    url: "http://localhost:3000/",
    wait: 3
  }

  // // 发送请求
  // var result = await POST({
  //   url: "/order/express",
  //   params: {
  //     busid: busid,
  //     orderid: orderid,
  //   }
  // })

  if (result.code == 0) {
    showFailToast({
      message: result.msg,
      onClose: () => {
        router.go(-1);
      }
    })
    return false;

  }

  //赋值物流信息
  expressList.value = result.data.list;
  console.log(result.data.list);



});

// 返回上一历史
var onClickLeft = () => {
  router.go(-1)
};

</script>

<style>
.btn {
  float: right;
  margin: 2px !important;
  min-width: 5em;
}

.ordernum {
  flex: 2 !important;
}

.time_price {
  text-align: center;
}

.pirce {
  font-size: 1.4em;
  font-weight: bold;
  color: rgb(229, 103, 58);
}
</style>
<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar title="退货售后" left-text="返回" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
  </van-sticky>

  <van-cell-group>
    <!-- 步骤条 -->
    <van-steps :active="active" active-icon="success" active-color="#07c160">
      <van-step v-for="item in backList">
        <p>{{ item.title }}</p>
      </van-step>
    </van-steps>
  </van-cell-group>

  <van-form @submit="onSubmit" v-if='!flag'>

    <van-cell-group inset>
      <!-- 快递公司 -->
      <van-field v-model="exp" is-link readonly name="expressid" label="快递公司" placeholder="点击选择快递公司"
        @click="showPicker = true" />

      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker :columns="explist" @confirm="onConfirm" @cancel="showPicker = false" />
      </van-popup>


      <van-field v-model="expresscode" name="expresscode" placeholder="请填写快递单号" label="快递单号" />

      <div style="margin: 14px;">
        <van-button round block type="primary" native-type="submit">
          提交单号
        </van-button>
      </div>
    </van-cell-group>
  </van-form>
  <van-form @submit="onSubmit" v-else>

    <van-cell-group inset>
      <!-- 快递公司 -->

      <van-field v-model="expresscode" name="expresscode" :placeholder="code" label="快递单号" disabled />

    </van-cell-group>
  </van-form>
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
// 获取当前订单状态
var backstatus = route.query.hasOwnProperty('backstatus') ? route.query.backstatus : 0;
let expresscode = ref("");
let code = ref(); //获取物流单号
let flag = ref(); //是否有提交物流
// 退货进度初始化
let active = ref('');


let backList = ref([]); //标签数据
backList = [
  {
    id: 0,
    title: "未审核",
  },
  {
    id: 1,
    title: "已审核",
  },
  {
    id: 2,
    title: "商家待收货",
  },
  {
    id: 3,
    title: "商家已收货",
  },
  {
    id: 4,
    title: "退款成功",
  }

];



// 表单
const exp = ref('');
const showPicker = ref(false);
const explist = ref([]) //快递公司数据
let expressid = ref('')
// 选择器点击事件
const onConfirm = ({ selectedOptions }) => {
  exp.value = selectedOptions[0]?.text;
  showPicker.value = false;
  expressid.value = selectedOptions[0]?.value;
};

// 提交 更新退货物流信息
const onSubmit = async (values) => {
  var data = {
    busid,
    orderid,
    expressid: expressid.value, //快递公司
    expresscode: values.expresscode //快递单号
  }

  // 发送请求
  var result = await POST({
    url: "/back/orderexp",
    params: data
  })
  console.log(result);
  if (result.code == 0) {
    showFailToast(result.msg);
    return false;
  } else {
    showSuccessToast({
      message: result.msg,
      onClose: () => {
        router.go(-1);
      }
    });
  }


}


// 获取快递公司数据
const getExpList = async () => {
  // 获取快递公司信息
  var result = await POST({
    url: "/back/expressquery",
    params: {
      busid: busid,
    }
  })

  console.log(result);
  // 赋值快递公司数据
  explist.value = result.data;
}

// 获取退货单
const getBack = async () => {
  // 获取快递公司信息
  var result = await POST({
    url: "/back/info",
    params: {
      busid: busid,
      orderid: orderid
    }
  })
  code.value = result.data.expresscode//快递单号
  flag.value = result.data.expressid ? true : false;

}

onBeforeMount(async () => {
  await getExpList();
  switch (backstatus) {
    case "0":
      active.value = "0";
      break;
    case "1":
      active.value = "2";
      break;
    case "2":
      active.value = "4";
      break;
    default:
      break;
  }

  await getBack();

});




// 返回上一历史
var onClickLeft = () => {
  router.go(-1)
};
</script>


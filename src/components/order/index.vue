<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <link type="text/css" rel="stylesheet" href="/css/typelist.css" />
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      title="全部订单"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    >
    </van-nav-bar>

    <!-- 标签栏 -->
    <van-tabs
      v-model:active="active"
      animated
      offset-top="46px"
      @change="TabChange"
    >
      <van-tab v-for="item in statusList" :title="item.title" :name="item.id">
      </van-tab>
    </van-tabs>
  </van-sticky>
  <!-- 标签页 -->

  <!-- 上拉加载，下拉刷新 -->
  <van-pull-refresh v-model="refreshing" @refresh="refresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :offset="5"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onload"
    >
      <!-- 标签内容 -->
      <div class="cart" v-for="order in orderList">
        <!-- 编号 -->
        <van-cell title="订单编号" :value="order.code" value-class="ordernum" />
        <!-- 商品卡片 -->

        <div v-for="pro in order.productlist">
          <van-card
            :num="pro.pronum"
            :price="pro.price"
            :title="pro.order_product.name"
            :thumb="pro.order_product.thumbs_text"
          >
            <template #tags>
              <van-tag plain type="primary">
                {{ order.status_text }}
              </van-tag>
              <!-- <van-tag plain type="primary">标签</van-tag> -->
            </template>
          </van-card>
        </div>

        <!-- 时间+价格 -->
        <van-row justify="center" class="time_price">
          <van-col span="8">{{ order.createtime_text }}</van-col>
          <van-col span="8"></van-col>
          <van-col span="8" class="pirce">￥{{ order.amount }}</van-col>
        </van-row>
        <!-- 按钮-->
        <van-cell>
          <template #title>
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              v-if="order.status == '1'"
              @click="goBackMoney(order.status, order.id)"
              >退款</van-button
            >
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              v-if="order.status == '2'"
              @click="goBackGoods(order.status, order.id)"
              >退货退款</van-button
            >
            <van-button
              class="btn"
              hairline
              size="small"
              type="warning"
              v-if="
                order.status == '-2' &&
                order.backstatus_text == '1' &&
                !order.backexp_text
              "
              @click="goGetExpressquery(order.id, order.backstatus_text)"
              >填写退货单号</van-button
            >
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              v-if="order.status == '-2' && order.backstatus_text == '0'"
              >审核中</van-button
            >
            <van-button
              class="btn"
              hairline
              size="small"
              type="warning"
              v-if="
                order.status == '-2' &&
                order.backstatus_text != '0' &&
                order.backexp_text
              "
              @click="goGetExpressquery(order.id, order.backstatus_text)"
              >退货进度</van-button
            >
            <van-button
              class="btn"
              hairline
              size="small"
              type="primary"
              v-if="order.status == '2'"
              @click="ConfirmReceipt(order.id)"
              >确认收货</van-button
            >
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              type="primary"
              v-if="order.status == '3'"
              @click="orderComment(order.id)"
              >待评价</van-button
            >
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              v-if="order.status == '4'"
              @click="orderComment(order.id)"
              >已评价</van-button
            >
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              type="primary"
              v-if="order.status == '2' && order.expresscode"
              @click="express(order.id)"
              >查看物流</van-button
            >
            <van-button
              class="btn"
              plain
              hairline
              size="small"
              type="primary"
              @click="orderInfo(order.id)"
              >详情</van-button
            >
          </template>
        </van-cell>
      </div>
    </van-list>
  </van-pull-refresh>

  <!-- 填写退货单号 -->
  <van-dialog
    v-model:show="diaShow"
    title="填写退货物流单号"
    show-cancel-button
  >
    <van-dropdown-menu>
      <van-dropdown-item v-model="value1" :options="option1" />
    </van-dropdown-menu>
    <van-field v-model="digit" type="digit" placeholder="物流单号" />
  </van-dialog>
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

let statusList = ref([]); //标签数据
let orderList = ref([]); //订单商品数据
let active = ref(0);

// 上拉下拉数据
let loading = ref(false);
let finished = ref(false);
let refreshing = ref(false);

// 初始化页数
let page = ref(1);

statusList = [
  {
    id: 0,
    title: "全部订单",
  },
  {
    id: 1,
    title: "已支付",
  },
  {
    id: 2,
    title: "已发货",
  },
  {
    id: 3,
    title: "已收货",
  },

  {
    id: -1,
    title: "退货",
  },
  {
    id: -2,
    title: "售后中",
  },
  {
    id: 4,
    title: "已完成",
  },
];
// 标签栏切换
let TabChange = (name, number) => {
  console.log(name, number);
  //调用获取订单的请求方法
  // 清空数据
  orderList.value = [];
  //   恢复第一个页数
  page.value = 1;
  //更改状态下拉状态
  finished.value = false;
  //   更改加载状态
  loading.value = true;
  onload();
};

// 退款
const goBackMoney = (status, orderid) => {
  // 弹出确认框
  showConfirmDialog({
    title: "退款提醒",
    message: "是否确定申请退款",
  })
    .then(async () => {
      console.log(status);

      var data = {
        status: status,
        busid: busid,
        orderid: orderid,
      };

      if (status == "1") {
        // 发送请求
        var result = await POST({
          url: "/back/gobackMoney",
          params: data,
        });
        console.log(result);
      }

      if (result.code == 0) {
        showFailToast(result.msg);
        return false;
      } else {
        showSuccessToast({
          message: result.msg,
          onClose: () => {
            router.go(0);
          },
        });
      }
    })
    .catch(() => {});
};
// 退货退款
const goBackGoods = (status, orderid) => {
  // 弹出确认框
  showConfirmDialog({
    title: "退货/退款提醒",
    message: "是否确定申请退货/退款",
  })
    .then(async () => {
      console.log(status);
      router.push({
        path: "/order/backgoods",
        query: {
          orderid: orderid,
        },
      });
    })
    .catch(() => {});
};

// 确认收货
const ConfirmReceipt = async (orderid) => {
  // console.log("确认收货", orderid, active.value);

  var data = {
    busid: busid,
    orderid: orderid,
  };
  // 弹出确认框
  showConfirmDialog({
    title: "更改提醒",
    message: "是否确认收货，确认收货后将无法申请退货",
  })
    .then(async () => {
      // 发送请求
      var result = await POST({
        url: "/order/edit",
        params: data,
      });

      if (result.code == 0) {
        showFailToast(result.msg);
        return false;
      }
      showSuccessToast({
        message: result.msg,
      });
      refresh();
    })
    .catch(() => {});
};

// 查看物流按钮
const express = async (orderid) => {
  console.log("物流");
  router.push({
    path: "/order/express",
    query: { orderid: orderid },
  });
};

//评价
const orderComment = async (orderid) => {
  console.log("评价");
  router.push({
    path: "/order/comment",
    query: { orderid: orderid },
  });
};

//下拉刷新 触发
const refresh = async () => {
  // 清空数据
  orderList.value = [];
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
  // 更改状态
  if (refreshing.value) {
    refreshing.value = false;
  }
  OrderList();
};

const OrderList = async () => {
  var result = await POST({
    url: "/order/index",
    params: {
      busid: busid, //用户id
      status: active.value, //订单状态
      page: page.value, //当前页数
    },
  });

  if (result) {
    //  更新加载状态 为结束
    loading.value = false;
    if (result.code == 0 || result.data.length <= 0) {
      finished.value = true;
    } else {
      // 追加数据
      orderList.value = orderList.value.concat(result.data);
      page.value++;
    }
  } else {
    return;
  }
};

// 查看订单详情
const orderInfo = (orderid) => {
  // 跳转到详情页
  router.push({
    path: "/order/info",
    query: { orderid: orderid },
  });
};

// 查询售后订单情况
const goGetExpressquery = (orderid, backstatus) => {
  router.push({
    path: "/order/expressquery",
    query: {
      orderid: orderid,
      backstatus: backstatus,
    },
  });
};

onBeforeMount(async () => {
  OrderList();
});

// 返回上一历史
var onClickLeft = () => {
  router.push("/");
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
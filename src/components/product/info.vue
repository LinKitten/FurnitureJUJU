<template>
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar :title="product.name" left-text="返回" left-arrow @click-left="onClickLeft">
      <!-- 点击弹出分享面板 -->
      <template #right>
        <van-icon name="ellipsis" size="18" @click="showShare = true" />
      </template>
    </van-nav-bar>
  </van-sticky>
  <!-- 分享面板 -->
  <van-share-sheet v-model:show="showShare" title="立即分享给好友" :options="options" round @select="share" />
  <!-- 商品图 -->
  <van-swipe :autoplay="4000" lazy-render>
    <van-swipe-item v-for="thumb in product.thumbs_list">
      <img style="width: 100%" :src="thumb" />
    </van-swipe-item>
  </van-swipe>

  <!-- 商品信息 -->
  <div class="detailbox">
    <h4>{{ product.name }}</h4>
    <van-row justify="space-between">
      <van-col span="8">
        <div class="price"><b>￥</b>{{ product.price }}</div>
      </van-col>
      <van-col span="8">
        <div class="ku">
          库存：{{ product.stock }} {{ product.unit ? product.unit.name : "" }}
        </div>
      </van-col>
    </van-row>
  </div>

  <div class="allkbox"></div>

  <!-- 商品详情 -->
  <div class="detailbox_2">
    <p class="tit">产品参数：</p>
    <div v-html="product.content"></div>
  </div>

  <!-- 动作栏 加入购物车  -->
  <van-action-bar>
    <van-action-bar-icon icon="chat-o" text="客服" dot @click="CallTel" />
    <van-action-bar-icon icon="cart-o" text="购物车" color="#ee0a24" :badge="count" v-if="count > 0" @click="gocart" />
    <van-action-bar-icon icon="cart-o" text="购物车" v-else />
    <van-action-bar-button type="warning" text="加入购物车" @click="CartAdd" />
    <van-action-bar-button type="danger" text="立即购买" @click="BuyNow" />
  </van-action-bar>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
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

// 获取商品id
let proid = route.query.hasOwnProperty("proid") ? route.query.proid : 0;

let product = ref({}); //商品详情
let count = ref(0); //购物车商品数量
let mobile = ref(""); //客户电话

const showShare = ref(false); //分享面板状态
// 面板内容
const options = [
  [
    { name: "微信", icon: "wechat" },
    { name: "朋友圈", icon: "wechat-moments" },
    { name: "微博", icon: "weibo" },
    { name: "QQ", icon: "qq" },
  ],
  [
    { name: "复制链接", icon: "link" },
    { name: "分享海报", icon: "poster" },
    { name: "二维码", icon: "qrcode" },
    { name: "小程序码", icon: "weapp-qrcode" },
  ],
];

// 客服
const CallTel = async () => {
  console.log(mobile.value);
  showConfirmDialog({
    title: "拨打提醒",
    message: "是否确认拨打客服电话",
  })
    .then(() => {
      location.href = `tel:${mobile.value}`;
    })
    .catch(() => { });
};
// 添加购物车
const CartAdd = async () => {
  // 需要登录
  if (!busid) {
    showFailToast("请先登录哦");
    return;
  }

  // 请求接口
  var result = await POST({
    url: "/cart/add",
    params: {
      proid: proid,
      busid: busid,
    },
  });

  if (result.code == 0) {
    // 无法获取商品详情
    showFailToast({
      message: result.msg,
      duration: 2500, //提示时间
    });
  } else {
    // 提示前往购物车
    showConfirmDialog({
      title: "跳转提醒",
      message: "是否前往购物车提交订单",
    })
      .then(() => {
        router.push("/cart/index")
      })
      .catch(() => {
        // 更新数据
        productList();
      });
  }
};

const productList = async () => {
  // 获取商品详情信息
  var result = await POST({
    url: "/index/info",
    params: {
      proid: proid,
      busid: busid,
    },
  });

  if (result.code == 0) {
    // 无法获取商品详情
    showFailToast({
      message: result.msg,
      duration: 1000, //提示时间
      onClose: () => {
        // 跳转回上一级
        router.go(-1);
      },
    });
    return false;
  }
  //   赋值
  product.value = result.data.porduct;
  count.value = result.data.count;
  mobile.value = result.data.contact;
};

// 点击分享面板的选项
const share = async (options) => {
  // 关闭面板
  showShare.value = false;
  console.log(options);
};

// 立即购买
const BuyNow = () => {

  //需要传递被选中的商品id
  router.push({
    path: "/cart/confirm",
    query: {
      proid: proid,
    },
  });
}
// 挂载前加载数据
onBeforeMount(async () => {
  productList();
});

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};

// 前往购物车
const gocart = () => {
  router.push("/cart/index");
}
</script >

<style>
.ku {
  height: 0px;
  text-align: center;
  padding-top: 12px;
}
</style>
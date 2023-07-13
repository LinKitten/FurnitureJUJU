<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <link href="/css/indent-details.css" rel="stylesheet" type="text/css">
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar title="订单详情" left-text="返回" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
  </van-sticky>

  <!-- 标签页 -->

  <div class="near-box">

    <div class="jd-qrdd-bigbox">
      <!--商品地址管理部分-->
      <div class="indent-details-box">
        <span class="indent-details-img1"></span>
        <span class="indent-details-text1">{{ order.status_text }}</span>
        <span class="indent-details-text2" v-if="express">物流信息：{{ express.list[0]["status"] }}</span>
        <span class="indent-details-text2" v-else>暂无物流信息</span>
        <span class="indent-details-text3" v-if="express">{{ express.list[0]["time"] }}</span>

      </div>
      <!--地址部分-->
      <div class="jd-qrdd-a1">
        <span class="qrdd-a1-t1">{{ address.consignee }}</span>
        <span class="qrdd-a1-t1">{{ address.mobile }}</span>
        <span class="qrdd-a1-t2" v-if="address.status == '1'">默认</span>
        <div class="qrdd-a1-b1">
          <span class="qrdd-a1-img1"></span>
          <span class="qrdd-a1-t3">{{ address.address_text }} {{ address.address }}</span>
        </div>
        <span class="qrdd-a1-img2"></span>
      </div>
      <!--商品部分-->
      <div class="zjzz-buylist-goods1">
        <div class="zjzz-buylist-gtime">
          <span class="zjzz-buylist-gtime1"><i class="indent-details-img2"></i>保洁官方旗舰店</span>
          <span class="zjzz-buylist-gtime2">联系客服</span>
        </div>
        <div class="zjzz-buylist-det">
          <div v-for="pro in product">
            <van-card :num="pro.pronum" :price="pro.price" :title="pro.order_product.name"
              :thumb="pro.order_product.thumbs_text">
              <template #tags>
                <!-- <van-tag plain type="primary">标签</van-tag> -->
              </template>
            </van-card>
          </div>
        </div>
        <div class="zjzz-buylist-btn">
          <a class="zjzz-buylist-btn3">申请售后</a>
        </div>
      </div>
      <!--商品金额部分-->
      <div class="indent-details-box2">
        <span class="indent-details-text4">应付总额</span>
        <span class="indent-details-text5">￥{{ order.amount }}</span>
      </div>
      <div class="indent-details-box2">
        <span class="indent-details-text4 tcolor-grey">商品总价</span>
        <span class="indent-details-text5 tcolor-black">￥{{ order.amount }}</span>
      </div>
      <!-- <div class="indent-details-box2">
        <span class="indent-details-text4 tcolor-grey">运费</span>
        <span class="indent-details-text5 tcolor-black">￥0.00</span>
      </div>
      <div class="indent-details-box2">
        <span class="indent-details-text4 tcolor-grey">税费</span>
        <span class="indent-details-text5 tcolor-black">￥0.00</span>
      </div> -->
      <div class="indent-details-box2">
        <span class="indent-details-text4 tcolor-grey">发票信息</span>
        <span class="indent-details-text5 tcolor-black">不需要发票</span>
      </div>
      <!--订单编号部分-->
      <div class="indent-details-box3">
        <van-cell class="indent" title="订单编号" :value="order.code" value-class="ordernum" />
        <van-cell class="indent" title="支付方式" value="支付宝" value-class="ordernum" />
        <van-cell class="indent" title="订单编号" :value="order.code" value-class="ordernum" />
        <van-cell class="indent" title="下单时间" :value="order.createtime_text" value-class="ordernum" />
      </div>

      <!-- 订单评价
      <div class="indent-details-box4" >
        <van-cell-group inset>
          <van-field v-model="message" rows="2"
            label-align="top"
             autosize label="订单评价" 
             type="textarea" 
              placeholder="这里是订单评价"
            show-word-limit disabled/>
        </van-cell-group>
      </div> -->


    </div>
  </div>
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

let order = ref([]);//存放订单详情
let product = ref([]); //订单商品
let express = ref(false);//存放物流信息
let address = ref([]);//存放物流信息

let message = ref("");//评价

// 获取订单详情信息
const orderInfo = async () => {
  // 获取商品详情信息
  var result = await POST({
    url: "/order/info",
    params: {
      orderid: orderid,
      busid: busid,
    },
  });
  console.log(result);

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
  } else {
    //   赋值
    order.value = result.data.order;
    product.value = result.data.productList;
    address.value = result.data.address;
    if (result.data.express) {
      express.value = result.data.express;
    }

  }


}


onBeforeMount(async () => {
  orderInfo();
});

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};
</script>


<style>
.indent {
  padding: 0.2em 0px !important;
}
.indent-details-box4 {
    width: 100%;
    float: left;
    margin: 0 auto;
    padding: 2px 0px;
    background: #fff;
    margin-top: 10px;
    line-height: 22px;
    font-size: 14px;
}
</style>
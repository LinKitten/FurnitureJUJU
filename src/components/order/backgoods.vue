<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar title="退货申请" left-text="返回" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
  </van-sticky>

  <!-- 收货地址 -->

  <van-contact-card type="edit" v-if="address" :tel="address.mobile" :name="address.consignee" @click="onAddressToggle" />
  <!-- 编号 -->
  <!-- 商品评价 -->

  <!-- <van-form @submit="onSubmit"> -->
  <van-cell-group inset>
    <van-cell title="退货商品" />

    <div v-for="pro in product">
      <van-card :num="pro.pronum" :price="pro.price" :title="pro.order_product.name"
        :thumb="pro.order_product.thumbs_text">
        <template #tags>
          <!-- <van-tag plain type="primary">标签</van-tag> -->
        </template>
      </van-card>

    </div>
    <van-cell title="退款金额" :value="order.amount" value-class="ordernum" />
    <van-cell title="订单编号" :value="order.code" value-class="ordernum" />

    <van-field v-model="remark" rows="2" autosize label="退货备注" type="textarea" required maxlength="50"
      placeholder="请输入退货理由" show-word-limit />


    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit" @click="onSubmit">
        提交申请
      </van-button>
    </div>

  </van-cell-group>


  <!-- </van-form> -->
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
// 获取存在cookie上的地址id（选中的地址）
//获取用户id
var busid = business.hasOwnProperty("id") ? business.id : 0;
//获取订单ID
var orderid = route.query.hasOwnProperty('orderid') ? route.query.orderid : 0;
let address = ref(null); //收货地址数据


let order = ref([]);//存放订单详情
let product = ref([]); //订单商品
let remark = ref("");//存放订单

var addrid = cookies.get("address") ? cookies.get("address") : order.businessaddrid;



// 获取当前用户的收货地址
const checkAddress = async () => {
  var result = await POST({
    url: "/address/order",
    params: {
      busid: busid,
      addrid: addrid,
    },
  });
  // 设置收货地址
  address.value = result.data;
};

// 切换收货地址
const onAddressToggle = () => {
  // 携带一个action用来确认是否来选中地址
  router.push({
    path: "/business/address/index",
    query: {
      action: "addresstoggle",
    },
  });
};
// 提交退货申请
const onSubmit = async () => {



  var data = {
    busid: busid,
    orderid: orderid,
    remark:remark.value,
    businessaddrid: address.value.id, //收货地址外键
  };

  // console.log(data);


    // 发送请求
    var result = await POST({
      url: "/back/gobackGoods",
      params: data,
    });
    console.log(result);

  
  cookies.remove("address");

  if (result.code == 0) {
    showFailToast(result.msg);
    return false;

  } else {
    showSuccessToast({
      message: result.msg,
    });
    router.go(-1)

  }



}

const orderList = async () => {
  // 获取详情信息
  var result = await POST({
    url: "/order/info",
    params: {
      busid: busid,
      orderid: orderid,
    }
  })


  // console.log(result);

  if (result.code == 0) {
    showFailToast({
      message: result.msg,
      onClose: () => {
        router.go(-1);
      }
    })
    return false;
  }
  order.value = result.data.order;
  product.value = result.data.productList;
  // address.value = result.data.address;


}


onBeforeMount(async () => {
  await orderList();
  await checkAddress();


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
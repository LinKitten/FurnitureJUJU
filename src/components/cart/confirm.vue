<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <link type="text/css" rel="stylesheet" href="/css/typelist.css" />
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar title="确认订单" left-text="返回" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
  </van-sticky>

  <!-- 收货地址 -->
  <van-contact-card type="edit" v-if="address" :tel="address.mobile" :name="address.consignee" @click="onAddressToggle" />
  <van-contact-card type="add" v-else @click="onAddAddress" add-text="添加收货地址" />

  <!-- 商品卡片 -->
  <div class="cartbox" v-if="proid.length <= 0">
    <div class="cart" v-for="cart in cartList">
      <van-card :price="cart.total" :title="cart.product.name" class="goods-card" :thumb="cart.product.thumbs_text"
        :num="cart.nums">
        <template #desc>
          <div style="color: #969799">库存：{{ cart.product.stock }}</div>
          <div>单价：{{ cart.price }}</div>
        </template>
      </van-card>
    </div>
  </div>
  <div class="cartbox" v-else>
    <div class="cart">
      <van-card :title="prolist.name" class="goods-card" :thumb="prolist.thumbs_text" num="1">
        <template #desc>
          <div style="color: #969799">库存：{{ prolist.stock }}</div>
          <div>单价：{{ prolist.price }}</div>
        </template>
      </van-card>
    </div>
  </div>


  <!-- 订单备注 -->
  <van-cell-group inset id="mess">
    <van-field v-model="remark" rows="2" autosize label="订单备注" type="textarea" maxlength="50" placeholder="请输入该订单备注"
      show-word-limit />
  </van-cell-group>

  <!-- 底部提交订单 -->
  <van-submit-bar :price="total" button-text="提交订单" @submit="onSubmit">
  </van-submit-bar>
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
// 获取存在cookie上的地址id（选中的地址）
var addrid = cookies.get("address") ? cookies.get("address") : 0;

// 要下单的商品在购物车的id
var cartids = route.query.hasOwnProperty("cartids") ? route.query.cartids : [];

// 获取来自立即购买页面的商品id
var proid = route.query.hasOwnProperty("proid") ? route.query.proid : "";



let cartList = ref([]); //购物车商品数据
let prolist = ref({}); //商品数据
let address = ref(null); //收货地址数据
var remark = ref(""); //订单备注
var CartListids = Array.isArray(cartids) ? cartids.join(",") : cartids;



// 获取购物车信息
const CartList = async () => {
  // 获取商品详情信息
  var result = await POST({
    url: "/cart/index",
    params: {
      busid: busid,
      cartids: CartListids,
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
  cartList.value = result.data.cartList;
};


const productinfo = async () => {
  // 获取商品详情信息
  var result = await POST({
    url: "/index/info",
    params: {
      proid: proid,
      busid: busid,
      action: "now"
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
  prolist.value = result.data.porduct;

};


//总价格
//累计总价 计算价格 计算属性
let total = computed(() => {
  var count = 0; //复原
  //   获取总价格
  /* 从购物车进入的 */
  if (proid.length <= 0) {
    //   循环所有商品
    cartList.value.forEach((item) => {
      // 根据被选中的复选框所绑定的商品id 存在

      // 进行累计
      count += parseFloat(item.total);
    });

  } else {
    // 直接购买的
    count = parseFloat(prolist.value.price);
  }



  //   需要转换为2.00 == 2000
  return count * 100;
});

// 获取当前用户的收货地址
const CartAddress = async () => {
  var result = await POST({
    url: "/address/order",
    params: {
      busid: busid,
      addrid: addrid,
    },
  });
  // 设置收货地址
  address.value = result.data;
  console.log(address.value);
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
// 添加收货地址
const onAddAddress = () => {
  router.push("/business/address/add");
};
// 挂载前加载数据
onBeforeMount(async () => {
  await CartList();
  await productinfo();
  await CartAddress();
});


var ids = Array.isArray(cartids) ? cartids.join(",") : cartids;
// 提交订单s
const onSubmit = async () => {
  var data = {
    busid: busid, //客户ID
    businessaddrid: address.value.id, //收货地址外键
    remark: remark.value, //订单备注
    cartids: ids, //下单的商品在购物车的id
    proid: proid, //下单的商品的id
  };
  showConfirmDialog({
    title: "订单提醒",
    message: "是否确认订单",
  })
    .then(async () => {
      var result = [];
      if (proid.length <= 0) {
        // 发送请求
        result = await POST({
          url: "/order/add",
          params: data,
        });
      } else {
        // 发送请求
        result = await POST({
          url: "/order/buynow",
          params: data,
        });
      }

      if (result.code == 0) {
        showFailToast(result.msg);
        return false;
      }

      showSuccessToast({
        message: result.msg,
        onClose: () => {
          //跳转
          router.push(result.url);
        },
      });
    })
    .catch(() => { });
};
// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};

</script>

<style>
:root:root {
  --van-card-background: white;
  --van-font-bold: 700;
}

.van-card__title {
  font-weight: var(--van-font-bold);
}

.cartbox .cart {
  display: block;
  width: 96%;
  background: var(--van-card-background);
  box-shadow: 0px 0px 10px 1px rgba(172, 192, 212, 0.383);
  margin: 10px auto;
}

.van-checkbox {
  height: 100%;
  display: flex;
  justify-content: right;
  text-align: center;
}

.van-swipe-cell {
  width: 100%;
}

.goods-card {
  margin: 0 !important;
}

#mess {
  width: 96%;
  box-shadow: 0px 0px 10px 0px rgba(172, 192, 212, 0.2) !important;
  margin: 10px auto !important;
}

.van-card__price-integer {
  color: darkslateblue;
}

.proul {
  width: 95%;
  margin: 10px auto;
}

.cart {
  display: flex;
  width: 100%;
  box-shadow: 0px 0px 20px 1px #00000010;
  margin-top: 12px;
  flex-direction: column;
}
</style>
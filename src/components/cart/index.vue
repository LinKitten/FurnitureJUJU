<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <link type="text/css" rel="stylesheet" href="/css/typelist.css" />
  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar
      :title="count"
      left-text="返回"
      right-text="取消"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"

    >
    </van-nav-bar>
  </van-sticky>

  <!-- 商品卡片 -->
  <van-checkbox-group v-model="checked" @change="CheckList">
    <div class="cart" v-for="cart in cartList">
      <!-- 滑动卡片 -->
      <van-swipe-cell>
        <!-- 卡片 -->
        <van-row>
          <van-col span="2">
            <van-checkbox :name="cart.id"></van-checkbox>
          </van-col>
          <van-col span="22">
            <van-card
              :price="cart.total"
              :title="cart.product.name"
              class="goods-card"
              :thumb="cart.product.thumbs_text"
            >
              <template #desc>
                <!-- <div style="color: #969799">库存：{{ cart.product.stock }}</div> -->
                <div>单价：{{ cart.price }}</div>
              </template>
              <!-- 步进器 -->
              <template #num>
                <van-stepper
                  v-model="cart.nums"
                  :name="cart.id"
                  theme="round"
                  disable-input
                  @change="numsChange"
                />
              </template>
            </van-card>
          </van-col>
        </van-row>

        <!-- 插槽 删除按钮 -->
        <template #right>
          <van-button
            square
            text="删除"
            type="danger"
            class="delete-button"
            @click="cartDel(cart.id)"
          />
        </template>
      </van-swipe-cell>
    </div>
  </van-checkbox-group>

  <van-empty
    image="/images/kgwc.png"
    image-size="80"
    description="购物车空空"
    v-if="emyptyShow == true"
  />

  <div class="clear"></div>
  <!-- 推荐商品 -->
  <div class="likebox">
    <div class="tit">•●●<span>猜你喜欢</span>●●•</div>
    <ul class="proul">
      <li v-for="item in recommend">
        <div class="con">
          <router-link
            :to="{ path: '/product/info', query: { proid: item.id } }"
          >
            <img :src="item.thumbs_text" />
            <p><span>￥</span>{{ item.price }}</p>
          </router-link>
        </div>
      </li>
    </ul>
  </div>

  <!-- 底部提交订单 --><van-submit-bar
    :price="total"
    button-text="提交订单"
    @submit="onSubmit"
  >
    <van-checkbox v-model="toggle" @click="ToggleCheck">全选</van-checkbox>
  </van-submit-bar>
</template>

<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";
// 引入封装的post方法
import { POST, UPLOAD } from "@/services/request";

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

// 获取用户
var business = cookies.get("business") ? cookies.get("business") : {};
//获取用户id
var busid = business.hasOwnProperty("id") ? business.id : 0;
let cartList = ref([]); //购物车商品数据
let count = ref(""); //购物车商品数量
let checked = ref([]); //复选框切换
let toggle = ref(false); //全选框状态

let recommend = ref([]);
let emyptyShow = ref(false);

const CartList = async () => {
  // 获取商品详情信息
  var result = await POST({
    url: "/cart/index",
    params: {
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
  cartList.value = result.data.cartList;
  count.value = `购物车(${result.data.count})`;
  emyptyShow.value = result.data.count > 0 ? false : true;
};
// 推荐商品
const recommendPro = async () => {
  var result = await POST({
    url: "/index/index",
  });

  // 赋值
  recommend.value = result.data.banner;
};
//切换全选
const ToggleCheck = () => {
  if (toggle.value) {
    for (var item of cartList.value) {
      checked.value.push(item.id);
    }
  } else {
    checked.value = [];
  }
  //   更新总结
  // addTotal();
};

//单个切换 复选框组 发送改变
const CheckList = (value) => {
  var list = [];

  //   获取购物车所有商品id
  cartList.value.map((item) => {
    list.push(item.id);
  });

  // 累计总价
  // addTotal();
  //   console.log(checked.value); //被选中的复选框id：绑定的商品id

  // 判断选中的商品和购物车所有商品是否一致
  var result =
    checked.value.length === list.length &&
    checked.value.sort().toString() === list.sort().toString();

  if (result) {
    // 更改全选框的状态
    toggle.value = true;
  } else {
    toggle.value = false;
  }
};

// 步进器切换
const numsChange = async (value, detail) => {
  var nums = value;
  var cartid = detail.name;
  console.log(nums, cartid);

  // 发送请求
  var result = await POST({
    url: "/cart/edit",
    params: {
      id: cartid,
      nums: nums,
      busid: busid,
    },
  });
  if (result.code == 1) {
    // 更新购物车数据
    cartList.value = result.data.cart;
    // 更新购物车商品数量
    count.value = `购物车(${result.data.count})`;
    emyptyShow.value = result.data.count > 0 ? false : true;

    // // 累计总价
    // addTotal();
  } else {
    showFailToast(result.msg);
    return false;
  }
};

// 删除购物车商品
const cartDel = async (id) => {
  // 弹出确认框
  showConfirmDialog({
    title: "删除提示",
    message: "确认从购物车删除该商品吗？",
  })
    .then(async () => {
      //确认删除 发送请求
      // 组装数据
      var data = {
        id: id,
        busid: business.id,
      };
      console.log(data);

      // 发送删除请求
      var result = await POST({
        url: "/cart/del",
        params: data,
      });

      console.log(result);

      // 提示信息
      if (result.code == 0) {
        // 删除失败
        showFailToast(result.msg);
        return false;
      }
      // 更新购物车
      // 更新购物车数据
      cartList.value = result.data.cart;
      // 更新购物车商品数量
      count.value = `购物车(${result.data.count})`;
      emyptyShow.value = result.data.count > 0 ? false : true;
    })
    .catch(() => {
      // 取消后的操作
    });
};

//总价格
//累计总价 计算价格 计算属性
let total = computed(() => {
  var count = 0; //复原
  //   获取总价格
  //   循环所有商品
  cartList.value.forEach((item) => {
    // 根据被选中的复选框所绑定的商品id 存在
    if (checked.value.includes(item.id)) {
      // 进行累计
      count += parseFloat(item.total);
    }
  });
  //   需要转换为2.00 == 2000
  return count * 100;
});

// 提交订单
const onSubmit = () => {
  // 判断是否有下选择商品下单
  if (checked.value.length <= 0) {
    showFailToast("请选择要下单的商品");
    return false;
  }
  //需要传递被选中的商品id
  router.push({
    path: "/cart/confirm",
    query: {
      cartids: checked.value,
    },
  });
};
// 挂载前加载数据
onBeforeMount(async () => {
  CartList();
  recommendPro();
});
// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};
// 取消  回到home页面
var onClickRight =()=>{
  router.push("/");
}
</script>

<style>
:root:root {
  --van-card-background: white;
  --van-font-bold: 700;
}

.van-card__title {
  font-weight: var(--van-font-bold);
}
.cart {
  display: flex;
  width: 100%;
  background: var(--van-card-background);
  box-shadow: 0px 0px 20px 1px #00000010;
  margin-top: 12px;
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

.delete-button {
  height: 100% !important;
}
.van-card__price-integer {
  color: darkslateblue;
}
.proul {
  width: 95%;
  margin: 10px auto;
}
</style>
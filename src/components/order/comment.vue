<template>
  <!-- 引入样式 -->
  <link type="text/css" rel="stylesheet" href="/css/style.css" />

  <van-sticky>
    <!-- 导航栏 -->
    <van-nav-bar title="订单评价" left-text="返回" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
  </van-sticky>
  <!-- 编号 -->
  <!-- 商品评价 -->

  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <van-cell title="订单编号" :value="order.code" value-class="ordernum" />

      <div v-for="pro in product">
        <van-card :num="pro.pronum" :price="pro.price" :title="pro.order_product.name"
          :thumb="pro.order_product.thumbs_text">
          <template #tags>
            <!-- <van-tag plain type="primary">标签</van-tag> -->
          </template>
        </van-card>
        <van-field v-model="pro.comment" rows="2" autosize label="评价" type="textarea" :name="pro.proid.toString()"
          maxlength="50" placeholder="请输入评价" show-word-limit :disabled="order.status == '4' ? true : false" />
      </div>

    </van-cell-group>




    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit" v-if="order.status != '4'">
        提交评价
      </van-button>
    </div>
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


let order = ref([]);//存放订单详情
let product = ref([]); //订单商品




// let message = ref("");


// 提交评价
const onSubmit = async (values) => {

  var comment = [];

  for (let key in values) {
    comment.push({
      id: key,
      content: values[key]
    })
  }




  // 组装数据
  var data = {
    orderid: orderid,//当前订单id
    busid: busid,//用户id
    commentList: comment,
  }

  console.log(data);
  // 发送请求
  var result = await POST({
    url: "/order/comment",
    params: data
  })


  console.log(result);


  if (result.code == 0) {
    showFailToast({
      message: result.msg,
      onClose: () => {
        router.push("/order/index");
      }
    })
    return false;
  } else {
    showSuccessToast({
      message: result.msg,
      onClose: () => {
        router.go(-1);
      }
    })
  }

}



onBeforeMount(async () => {


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
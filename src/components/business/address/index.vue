<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="收货地址"
    left-text="返回"
    left-arrow
    @click-left="onClickLeft"
  />
  <div>
    <van-address-list
      v-if="action == 'addresstoggle'"
      v-model="chosenAddressId"
      :list="addressList"
      default-tag-text="默认"
      @add="onAdd"
      @edit="onEdit"
      @select="addresstoggle"
    />
    <van-address-list
      v-else
      v-model="chosenAddressId"
      :list="addressList"
      default-tag-text="默认"
      @add="onAdd"
      @edit="onEdit"
      @select="select"
    />
  </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast } from "vant";
// 引入router
import { useRouter,useRoute } from "vue-router";
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

// 收获地址列表
const addressList = reactive([]);
const chosenAddressId = ref(""); //被选中的id


//获取自定义的参数
var action = route.query.hasOwnProperty("action") ? route.query.action : "";
action = ref(action);
// 挂载前发送请求拿到数据
onBeforeMount(async () => {
  const result = await POST({
    url: "/address/index",
    params: {
      busid: business.id,
    },
  });

  if (result.code == 0 || result.data.length <= 0) {
    showFailToast(result.msg);
    return false;
  }
  // 循环修改地址列表
  result.data.forEach((item) => {
    var status = item.status == "1" ? true : false;

    // 如果是默认地址
    if (status) {
      // 需要默认选中默认地址
      chosenAddressId.value = item.id;
    }
    addressList.push({
      id: item.id, //每条地址的唯一标识
      name: item.consignee, //姓名
      tel: item.mobile, //手机号
      address: `${item.address_text} ${item.address}`, //详细地址
      isDefault: status, //是否为默认地址
    });
  });

  // console.log(addressList);
});

const onAdd = () => {
  // 跳转到添加地址页面
  router.push("/business/address/add");
};
const onEdit = (item, index) => {
  // 跳转到编辑页面 需要传递当前id
  router.push({ path: "/business/address/edit", query: { id: item.id } });
};

// 选中地址触发 (选中便默认)
const select = async (item, index) => {
  //封装数据
  var data = {
    busid: business.id,
    id: item.id,
  };

  //发请求
  var result = await POST({
    url: "/address/toggle",
    params: data,
  });

  //更新失败
  if (result.code == 0) {
    showFailToast(result.msg);
    return false;
  }

  //切换默认标签
  chosenAddressId.value = item.id;

  //清除全部的默认选中
  addressList.map((item) => {
    item.isDefault = false;
  });

  addressList[index].isDefault = true;
};

// 从订单页面过来的  切换地址
const addresstoggle = async (item, index) => {
  console.log(111);
  cookies.set("address", item.id);
  router.go(-1);
};

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};
</script>

<style></style>
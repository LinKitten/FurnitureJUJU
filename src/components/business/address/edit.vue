<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="编辑地址"
    left-text="返回"
    left-arrow
    @click-left="onClickLeft"
  />
  <van-address-edit
    :area-list="areaList"
    :address-info="address"
    show-delete
    show-set-default
    @save="onSave"
    @delete="onDelete"
  />
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
// 引入城市省市区数据包
import { areaList } from "@vant/area-data";

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();
var route = useRoute();

// 获取传递的当前收获地址的id
var addrId = route.query.hasOwnProperty("id") ? route.query.id : 0;

// 获取用户
var business = cookies.get("business") ? cookies.get("business") : {};
// 初始化地址信息数据
const address = reactive({});

//添加地址点击保存
const onSave = async (info) => {
  // 保存数据
  // 组装请求数据
  var data = {
    id: addrId, //地址id
    busid: business.id, //客户id
    consignee: info.name, //收货人名称
    code: info.areaCode, //地区码
    address: info.addressDetail, //详细地址
    mobile: info.tel, //手机号码
    status: info.isDefault, //设置默认地址
  };
  //   发送请求
  var result = await POST({
    url: "/address/edit",
    params: data,
  });

  if (result.code == 0) {
    showFailToast(result.msg);
    return false;
  } else {
    showSuccessToast({
      message: result.msg,
      duration: 1000, //提示时间
      onClose: () => {
        // 跳转回上一级
        router.go(-1);
      },
    });
  }
};

// 点击删除地址
const onDelete = () => {
  // 弹出确认框
  showConfirmDialog({
    title: "删除提示",
    message: "确认删除当前地址吗？",
  })
    .then(async () => {
      //确认删除 发送请求
      // 组装数据
      var data = {
        id: addrId,
        busid: business.id,
      };
      console.log(data);

      // 发送删除请求
      var result = await POST({
        url: "/address/del",
        params: data,
      });
      console.log(result);
      // 提示信息
      if (result.code == 0) {
        showFailToast(result.msg);
        return false;
      } else {
        showSuccessToast({
          message: result.msg,
          duration: 1000, //提示时间
          onClose: () => {
            // 跳转回上一级
            router.go(-1);
          },
        });
      }
    })
    .catch(() => {
      // 取消后的操作
    });
};

// 获取收获地址
const info = async () => {
  // 组装数据
  var data = {
    busid: business.id, //用户id
    id: addrId, //当前地址的id
  };

  // 发送请求
  var result = await POST({
    url: "/address/info",
    params: data,
  });

  // 请求失败
  if (result.code == 0) {
    showFailToast(result.msg);
    return false;
  }
  // 请求成功
  // 追加address内容
  var list = result.data; //获取内容
  address.name = list.consignee; //姓名
  address.tel = list.mobile; //手机号
  address.addressDetail = list.address; //详细地址
  address.areaCode = list.district || list.city || list.province; //地区编码，通过 省市区选择 获取（必填
  address.isDefault = list.status == "1" ? true : false; //是否为默认地址
  console.log(address);
};
// 在挂载前获取到当前收获地址的数据
onBeforeMount(() => {
  info();
});

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};
</script>

<style></style>
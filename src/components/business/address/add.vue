<template>
  <!-- 导航栏 -->
  <van-nav-bar
    title="添加地址"
    left-text="返回"
    left-arrow
    @click-left="onClickLeft"
  />
  <van-address-edit :area-list="areaList" show-set-default @save="onSave" />
</template>

<script setup>
import { onBeforeMount, reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";

// 引入封装的post方法
import { POST, UPLOAD } from "@/services/request";
// 引入城市省市区数据包
import { areaList } from "@vant/area-data";

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

// 获取用户cookie
var business = cookies.get("business") ? cookies.get("business") : {};

//添加地址点击保存
const onSave = async (info) => {
  // 保存数据
  // 组装请求数据
  var data = {
    busid: business.id, //客户id
    consignee: info.name, //收货人名称
    code: info.areaCode, //地区码
    address: info.addressDetail, //详细地址
    mobile: info.tel, //手机号码
    status: info.isDefault, //设置默认地址
  };
  //   发送请求
  var result = await POST({
    url: "/address/add",
    params: data,
  });
  if (result.code == 0) {
        showFailToast(result.msg)
        return false;
    } else {
        showSuccessToast({
            message: result.msg,
            duration: 1000, //提示时间
            onClose: () => {
                // 跳转回上一级
                router.go(-1);
            }
        })
    }
  
};

// 返回上一历史
var onClickLeft = () => {
  router.go(-1);
};
</script>

<style></style>
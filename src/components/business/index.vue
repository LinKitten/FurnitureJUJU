<template>
  <link type="text/css" rel="stylesheet" href="/css/style.css" />
  <div class="myBox">
    <div class="L">
      <van-image round :src="business.avatar_text" />
    </div>
    <div class="C">
      <div class="tit">{{ business.nickname }}</div>
      <div class="sub">手机号：{{ business.mobile }}</div>
    </div>
  </div>

  <div class="clear"></div>
  <div class="allkbox"></div>

  <van-field
    v-model="fieldValue"
    is-link
    readonly
    label="基本资料"
    to="/business/profile"
  />
  <div v-if="business.auth == '0'">
    <van-field
      v-model="fieldValue"
      is-link
      readonly
      label="邮箱认证"
      to="/business/email"
    />
  </div>
  <van-field
    v-model="fieldValue"
    is-link
    readonly
    label="我的收货地址"
    to="/business/address/index"
  />
  <van-field v-model="fieldValue" is-link readonly label="我的订单" to="/order/index" />
  <van-field v-model="fieldValue" is-link readonly label="消费记录" to="/business/record" />
  <van-field v-model="fieldValue" is-link readonly label="充值记录" to="/" />
  <van-field
    v-model="fieldValue"
    is-link
    readonly
    label="注销"
    @click="loginOut"
  />

  <Menu></Menu>
</template>

<script setup>
import Menu from "@/components/common/Menu.vue";
import { reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showConfirmDialog } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

// 获取用户信息
var login = cookies.get("business") ? cookies.get("business") : {};
const business = reactive(login);

var loginOut = () => {
  showConfirmDialog({
    title: "退出提示",
    message: "是否确认退出登录?",
  })
    .then(() => {
      // 确认退出
      //   清除cookie
      cookies.remove("business");
      // 跳转
      showSuccessToast({
        message: "退出登录成功",
        duration: 1000,
        onClose: () => {
          router.push("/login");
        },
      });
    })
    .catch(() => {
      //取消 无需操作
    });
};
</script>

<style>
div .C .tit {
  font-weight: 700;
}
</style>

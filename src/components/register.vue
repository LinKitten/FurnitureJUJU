<template>
  <!--图标样式-->
  <link
    rel="stylesheet"
    type="text/css"
    href="/fonts/font-awesome-4.7.0/css/font-awesome.min.css"
  />

  <!--布局框架-->
  <link rel="stylesheet" type="text/css" href="/css/util.css" />

  <!--主要样式-->
  <link rel="stylesheet" type="text/css" href="/css/main.css" />

  <div class="limiter">
    <div
      class="container-login100"
      style="background-image: url('/images/img-01.jpg')"
    >
      <div class="wrap-login100 p-t-190 p-b-30">
        <form class="login100-form validate-form">
          <div class="login100-form-title">
            <h2>Welcome，JUJU</h2>
          </div>

          <span class="login100-form-title p-t-20 p-b-45">Hello</span>

          <!-- 组件默认提交 -->
          <van-form @submit="registerSubmit">
            <van-cell-group inset>
              <!-- 手机号 -->
              <van-field
                v-model="business.mobile"
                name="mobile"
                label="手机号"
                placeholder="请输入手机号"
                :rules="rules.mobile"
              />
              <van-field
                v-model="business.password"
                type="password"
                name="password"
                label="密码"
                placeholder="请输入密码"
                :rules="rules.password"
              />
            </van-cell-group>
            <div
              class="container-login100-form-btn p-t-10"
              style="width: 16rem; margin: 0 auto"
            >
              <van-button round block type="success" native-type="submit">
                注 册
              </van-button>
            </div>
          </van-form>

          <div class="text-center w-full">
            <router-link to="/login">
              立即登录
              <i class="fa fa-long-arrow-right"></i>
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

// 引入封装的post方法
import { POST } from "@/services/request";
// 轻提醒
import { showSuccessToast, showFailToast } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

/* 判断是否有cookie */
// 获取cookie
var businessCheck = cookies.get("business") ? cookies.get("business") : {};
if (Object.keys(businessCheck).length > 0) {
  // 有cookie的情况下跳转到business/index (有判断cookie是否为为伪造)
  router.push("/business/index");
}

  // 数据
let business = reactive({
  mobile: "13822015555",
  password: "123123",
});

// 规则
let rules = reactive({
  mobile: [
    {
      required: true,
      message: "请输入手机号",
    },
    {
      pattern: /(^1[3|4|5|7|8][0-9]{9}$)/,
      message: "手机号码格式有误",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
    {
      pattern: /.{6,}/,
      message: "密码需要6位数及以上",
    },
  ],
});

//提交方法
let registerSubmit = async (values) => {
  // 组装数据
  const data = {
    mobile: values.mobile,
    password: values.password,
  };

  // 发送post请求
  let result = await POST({
    url: "/business/register",
    params: data,
  });

  if (result.code == 0) {
    showFailToast(result.msg);
  } else {
    showSuccessToast({
      duration: 1000, //提示时间
      message: result.msg, //提示内容
      onClose: () => {
        router.push(result.url);
      },
    });
  }
};
</script>

<style></style>
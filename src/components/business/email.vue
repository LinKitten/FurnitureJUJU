<template>
    <link rel="stylesheet" href="css/profile.css" />
    <!-- 导航栏 -->
    <van-nav-bar title="邮箱验证" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div>
        <!-- 组件默认提交 -->
        <van-form @submit="emailAuth" style="margin-top: 10px">
            <van-cell-group inset>
                <!-- 头像 -->
                <van-col class="avt">
                    <van-image round width="6rem" height="6rem" :src="business.avatar_text" />
                </van-col>

                <!-- 邮箱 -->
                <van-field v-model="business.email" label="邮箱" readonly />
                <van-row justify="space-between">
                    <!-- 输入框 -->
                    <van-col span="18">
                        <van-field v-model="code" name="code" label="验证码" placeholder="请输入验证码" />
                    </van-col>
                    <!-- 发送验证码 -->
                    <van-col span="6"
                        style="display: flex;align-content: center;justify-content: center;align-items: center;">
                        <van-button size="small" plain type="primary" :disabled="isSmsSend" @click="startCountdown">
                            <!-- 验证器 -->
                            <van-count-down ref="countDown" millisecond :time="60000" :auto-start="false" format="ss"
                                @finish="onFinish" v-show="isSmsSend" class="countDown" />
                            {{ buttonText }}
                        </van-button>


                    </van-col>
                </van-row>
            </van-cell-group>

            <div class="container-login100-form-btn p-t-10" style="width: 16rem; margin: 20px auto">
                <van-button round block type="success" native-type="submit" color="#333333">
                    邮箱验证
                </van-button>


            </div>
        </van-form>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast, showConfirmDialog, Empty } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";

// 引入封装的post方法
import { POST, UPLOAD } from "@/services/request";

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

// 验证码
var code = ref();

// 获取用户cookie
var login = cookies.get("business");
var business = reactive(login);
// console.log(business);

// 是否点击
const isSmsSend = ref(false);
const countDown = ref(null);
// 初始化按钮文字
const buttonText = ref("发送验证码")

// 点击按钮开始倒计时
const startCountdown = async () => {
    isSmsSend.value = true;
    buttonText.value = "秒后重发";
    // 开始倒计时
    start();
    const email = business.email;
    var data = {
        email: email
    }
    // 发送邮件请求
    var result = await POST({
        url: "/business/sendmail",
        params: data
    })
    if (result.code == 0) {
        showFailToast(result.msg)
        return false;
    } else {
        showSuccessToast({
            message: result.msg,
            duration: 1000, //提示时间
        })
    }

};

// 开始倒计时
const start = () => {
    countDown.value.start();
};
// 重设倒计时
const reset = () => {
    countDown.value.reset();
};
// 倒计时结束后调用
const onFinish = () => {
    isSmsSend.value = false;
    buttonText.value = "重新发送";
    reset();
};



// 验证邮箱 的请求
var emailAuth = async (values) => {
    const email = business.email;

    // 组装数据
    var data = {
        email: email,
        code: values.code,
        id: business.id

    };

    //发送post请求
    let result = await UPLOAD({
        url: "/business/emailCheck",
        params: data,
    });

    // console.log(result);
    if (result.code == 0) {
        showFailToast(result.msg)
        return false;
    } else {
        showSuccessToast({
            message: result.msg,
            duration: 1000, //提示时间
            onClose: () => {
                // 更新cookie
                cookies.set("business", result.data);
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

<style>
.avt {
    display: block;
    box-sizing: border-box;
    min-height: 1px;
    margin: 10px;
    display: flex !important;
    align-content: center;
    justify-content: center;
}

.countDown {
    display: inline-block;
}
</style>
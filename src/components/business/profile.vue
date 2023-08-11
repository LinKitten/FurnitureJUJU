<template>
    <link rel="stylesheet" href="css/profile.css" />
    <!-- 导航栏 -->
    <van-nav-bar title="基本资料" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div>
        <!-- 组件默认提交 -->
        <van-form @submit="eidtProfile" style="margin-top: 20px;">
            <van-cell-group inset class="group">
                <!-- 头像 -->
                <van-field name="avatar">
                    <template #input>
                        <!-- 文件上传的组件 -->
                        <van-uploader  v-model="avatarDefind" :max-count="1" />
                    </template>
                </van-field>
                <!-- 手机号 -->
                <van-field v-model="business.mobile" name="mobile" label="手机号" placeholder="请输入手机号" :rules="rules.mobile" />
                <!-- 昵称 -->
                <van-field v-model="business.nickname" name="nickname" label="昵称" placeholder="请输入昵称"
                    :rules="rules.nickname" />
                <!-- 邮箱 -->
                <van-field v-model="business.email" name="email" label="邮箱" placeholder="请输入邮箱" :rules="rules.email" />
                <!-- 密码 -->
                <van-field v-model="business.password" type="password" name="password" label="密码" placeholder="修改密码才需输入" />
                <!-- 性别 -->
                <van-field name="genter" label="性别">
                    <template #input>
                        <van-radio-group v-model="business.gender" direction="horizontal">
                            <van-radio name="0" id="secrecy">保密</van-radio>
                            <van-radio name="1" id="man">男</van-radio>
                            <van-radio name="2" id="woman">女</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>

                <!-- 地区选中 -->
                <van-field v-model="business.region_text" is-link readonly name="region" label="地区选择" placeholder="点击选择省市区"
                    @click="showArea = true" />
                <van-popup v-model:show="showArea" position="bottom">
                    <van-area :area-list="areaList" @confirm="onConfirmArea" @cancel="showArea = false" />
                </van-popup>

            </van-cell-group>

            <div class="container-login100-form-btn p-t-10" style="width: 16rem; margin: 20px auto">
                <van-button round block type="success" native-type="submit" color="#333333">
                    修改个人信息
                </van-button>
            </div>
        </van-form>
    </div>
</template>

<script setup>

import { reactive, ref } from "vue";
// 轻提醒
import { showSuccessToast, showFailToast, showConfirmDialog } from "vant";
// 引入router
import { useRouter } from "vue-router";
// 引入cookie
import { useCookies } from "vue3-cookies";
// 引入城市省市区数据包
import { areaList } from '@vant/area-data';
// 引入封装的post方法
import { POST, UPLOAD } from '@/services/request'

const { cookies } = useCookies();
// 初始化路由 (返回当前的路由地址)
var router = useRouter();

// 表单验证规则
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
    email: [
        {
            required: true,
            message: "请输入邮箱",
        },
        {
            pattern: /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/,
            message: '邮箱格式有误'
        },
    ],
    nickname: [
        {
            required: true,
            message: '请输入昵称',
        },
    ],


});


// 获取用户cookie
var login = cookies.get("business");
var business = reactive(login);


// 头像预览地址
const avatarDefind = ref([
    { url: business.avatar_text }
]);



//初始化城市组件状态
const showArea = ref(false);
// Area组件 点击完成按钮时触发
const onConfirmArea = ({ selectedOptions }) => {
    showArea.value = false;
    business.region_text = selectedOptions.map((item) => item.text).join('/');

    // const [province, city, district] = selectedOptions;
    // //修改文字
    // var region_text = '';
    // if (province.text) {
    //     region_text += province.text
    // }

    // if (city.text) {
    //     region_text += `/${city.text}`
    // }

    // if (district.text) {
    //     region_text += `/${district.text}`
    // }


    // 获取省市区城市码
    var code = selectedOptions.map((item) => item.value);

    business.region_code = code[2];//最深城市码

};




// 表单提交
var eidtProfile = async (values) => {

    // console.log(values);
    // console.log(business);
    // 组装数据
    var data = {
        id: business.id,
        mobile: values.mobile,
        nickname: values.nickname,
        email: values.email,
        gender: business.gender,
        region: business.region_code,
    }
    // 密码不为空，追加字段
    if (values.password) {
        data.password = values.password;
    }
    // 如果有头像上传 追加
    var avatar = values.avatar[0].file; //File

    if (avatar) {
        data.avatar = avatar;
    }

    console.log(data);
    // // 发送post请求
    let result = await UPLOAD({
        url: "/business/profile",
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

}


// 返回上一历史
var onClickLeft = () => {
    router.go(-1);
};


</script>

<style>
.van-field__control--custom {
    display: flex;
    align-items: center;
    min-height: var(--van-cell-line-height);
    justify-content: center;
}
.group{
    padding: 20px 0px;
}
</style>
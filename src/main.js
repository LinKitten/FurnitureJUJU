import { createApp } from 'vue'
import App from './App.vue'
import Router from './routers/index'
import Cookies from 'vue3-cookies'


//引入VantUI组件
import 'vant/lib/index.css'
import Vant from "vant"
var app = createApp(App)
    .use(Router)
    .use(Vant)
    .use(Cookies)
    .mount('#app')

import { POST } from "@/services/request";
import { showFailToast } from 'vant'
// console.log(app.$cookies);


// 判断是否登录
Router.beforeEach(async (to, from, next) => {

    // 拿到设置的自定义函数
    var isLogin = to.meta.Islogin ? to.meta.Islogin : false;

    // 如果 Islogin 为false 那就无需判断登录
    if (!isLogin) {
        // 直接放行
        next();
        return false;
    }

    /* 需要判断登录 */

    // 获取cookie 
    // console.log(app.$cookies);s
    var business = app.$cookies.get("business") ? app.$cookies.get("business") : {};

    // 如果没有cookie
    if (Object.keys(business).length <= 0) {
        // 提示登录并跳转
        showFailToast({
            message: "请先登录",
            duration: 1000,
            onClose: next("/login")
        })


    } else {


        //如果对象不为空，就获取属性
        var id = business.hasOwnProperty('id') ? business.id : 0;
        var mobile = business.hasOwnProperty('mobile') ? business.mobile : 0;

        //组装数据
        var data = {
            id,
            mobile
        };

        var result = await POST({
            url: "/business/check",
            params: data
        })
        // 有cookie但是没有查到数据
        if (result.code == 0) {
            //证明cookie伪造
            app.$cookies.remove('business');

            //提醒
            showFailToast({
                message: result.msg,
                duration: 1000,
            })
            // 跳转
            next(result.url)
        } else {
            //覆盖一下cookie
            app.$cookies.set('business', result.data)
            next()
        }
    }

    // 返回 false 以取消导航
    return false
})

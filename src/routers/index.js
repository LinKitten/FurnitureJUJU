import { createRouter, createWebHashHistory } from "vue-router";


//引入组件
import Home from '@/components/home.vue'
import BusinessIndex from '@/components/business/index.vue'
import BusinessProfile from '@/components/business/profile.vue'
import BusinessEmail from '@/components/business/email.vue'
import BusinessAddress from '@/components/business/address.vue'
import Login from '@/components/login.vue'
import Register from '@/components/register.vue'

// 创建路由
export default createRouter({
    // 使用hash模式
    history: createWebHashHistory(),

    //路由列表
    routes: [
        {
            //默认首页
            path: '/',
            name: 'home',
            component: Home,
        },
        { //登录页面
            path: '/login',
            name: 'login',
            component: Login
        },
        { //index.js
            path: '/register',
            name: 'register',
            component: Register
        },
        {  //"我的"页面
            path: '/business/index',
            name: 'BusinessIndex',
            component: BusinessIndex,
            meta: {
                Islogin: true,
            }
        },
        {  //个人资料页面
            path: '/business/profile',
            name: 'BusinessProfile',
            component: BusinessProfile,
            meta: {
                Islogin: true,
            }
        },
        {  //邮箱验证
            path: '/business/email',
            name: 'BusinessEmail',
            component: BusinessEmail,
            meta: {
                Islogin: true,
            }
        },
        {  //收获地址
            path: '/business/address',
            name: 'BusinessAddress',
            component: BusinessAddress,
            meta: {
                Islogin: true,
            }
        },
    ]
})
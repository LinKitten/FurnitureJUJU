import { createRouter, createWebHashHistory } from "vue-router";


//引入组件
import Home from '@/components/home.vue'
import OrderIndex from '@/components/order/index.vue'
import CartIndex from '@/components/cart/index.vue'
import CartConfirm from '@/components/cart/confirm.vue'
import ProductList from '@/components/product/list.vue'
import ProductInfo from '@/components/product/info.vue'
import BusinessIndex from '@/components/business/index.vue'
import BusinessProfile from '@/components/business/profile.vue'
import BusinessEmail from '@/components/business/email.vue'
import BusinessRecord from '@/components/business/record.vue'
import AddressIndex from '@/components/business/address/index.vue'
import AddressAdd from '@/components/business/address/add.vue'
import AddressEdit from '@/components/business/address/edit.vue'
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
        { //分类列表
            path: '/product/list',
            name: 'ProductList',
            component: ProductList,
        },
        { //商品详情
            path: '/product/info',
            name: 'ProductInfo',
            component: ProductInfo,
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
        {  //收货地址
            path: '/business/address/index',
            name: 'AddressIndex',
            component: AddressIndex,
            meta: {
                Islogin: true,
            }
        },
        {  //新增收货地址
            path: '/business/address/add',
            name: 'AddressAdd',
            component: AddressAdd,
            meta: {
                Islogin: true,
            }
        },
        {  //编辑收货地址
            path: '/business/address/edit',
            name: 'AddressEdit',
            component: AddressEdit,
            meta: {
                Islogin: true,
            }
        },
        {  //编辑收货地址
            path: '/business/record',
            name: 'BusinessRecord',
            component: BusinessRecord,
            meta: {
                Islogin: true,
            }
        },
        {  //购物车列表
            path: '/cart/index',
            name: 'CartIndex',
            component: CartIndex,
            meta: {
                Islogin: true,
            }
        },
        {  //购物车列表
            path: '/cart/confirm',
            name: 'CartConfirm',
            component: CartConfirm,
            meta: {
                Islogin: true,
            }
        }, {  //订单列表
            path: '/order/index',
            name: 'OrderIndex',
            component: OrderIndex,
            meta: {
                Islogin: true,
            }
        },
    ]
})
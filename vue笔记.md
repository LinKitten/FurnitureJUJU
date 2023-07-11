fastadmin

vue家具商城对接模块 shop

<!-- 创建模块 -->
php think build --module shop

<!-- 创建控制器 -->
php think make:controller shop/Business

访问出现 404问题，需要配置请求代理
vite.config.js  ->server配置


安装cookie插件包
yarn add vue3-cookies -S

需要引入并使用
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();

cookies.set()
cookies.get()


main.js 全局判断是否登录?(判断条件为meta)


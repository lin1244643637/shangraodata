import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
	{
		path: "/",
		redirect: "/main",
	},
	{
		path: "/main",
		component: () => import("../views/Main.vue"),
		redirect: "/Home",
		children: [
			{
				path: "/Home",
				component: () => import("../views/Home.vue"),
				name: "Home",
			},
			{
				path: "/commodity",
				component: () => import("../views/Commodity.vue"),
				name: "Commodity",
			},
			{
				path: "/order",
				component: () => import("../views/Order.vue"),
				name: "Order",
			},
		],
	},
	{
		path: "/login",
		component: () => import("../views/Login.vue"),
		name: "Login",
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});
router.beforeEach((to, _from, next) => {
	// 进行权限验证或登录判断
    if (to.path === '/login') {
		next();
	} else {
		if (!window.localStorage.getItem("cookiename")) {
            console.log("sss")
			next("/login"); // 重定向到登录页面
		}else {
            next(); // 允许路由跳转
        }
    }
	
});

router.afterEach((_to, _from) => {});

router.beforeResolve((_to, _from, next) => {
	next(); // 允许路由跳转
});

export default router;

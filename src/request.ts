import axios, { AxiosInstance, AxiosResponse } from "axios";

import router from "./router";
import { ElMessage } from "element-plus";
// 创建一个 Axios 实例
const axiosInstance: AxiosInstance = axios.create({
	baseURL: "https://data.andupchain.com", // 替换为你的 API 基础 URL
	timeout: 100000, // 设置请求超时时间
});
// 响应拦截器
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		// 对响应数据做点什么
        if (JSON.parse(response.data.data).ret == 401) {
            ElMessage.error("登录已过期，请重新登录");
            window.localStorage.removeItem("cookiename");
			router.push("/login");
        }
		return response;
	},
	(error) => {
		// 对响应错误做点什么
		if (error.response && error.response.status === 400) {
			// 如果状态码为 400，跳转到 /login 页面
            
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;

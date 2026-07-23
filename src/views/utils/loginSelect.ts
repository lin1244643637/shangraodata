import { ElButton, ElMessageBox } from "element-plus";
import axiosInstance from "../../request";
import { h } from "vue";
import router from "../../router";
const buttons = [
	{
		text: "18688821224上饶地区",
		type: "primary",
		action: "18688821224上饶地区",
	},
	// { text: '外部工厂（企业微信）', type: 'warning', action: '外部工厂（企业微信）' },
	// 可以根据需要添加更多按钮
];
const handleButtonClick = (action: string) => {
	// 根据按钮的 action 执行对应的操作
	console.log(action);
	if (action === "18688821224上饶地区") {
		axiosInstance
			.post("https://data.andupchain.com/api/Test/CommonApi", {
				url: "https://api.xiaocan.com.cn/admin/api/v2/account/login",
				
      header: {
        authentication: window.localStorage.getItem("cookiename"),
        "show-all-subject": "0",
        referer: "https://huoban.xiaocan.com.cn/",
      },
				type: "2",
				json: JSON.stringify({
					mobile: "18688821224",
					password: "123456",
					pickedId: 80001,
					from: "partner",
					corpId: "",
					randstr: 2,
					ticket: 1
				}),
			})
			.then((res) => {
				console.log(JSON.parse(res.data.data).data.token);
				window.localStorage.setItem('cookiename',JSON.parse(res.data.data).data.token)
                ElMessageBox.close();
                router.push("/main");
			});
	} else if (action === "飞书（芙清）") {
		// 按钮2的操作逻辑
	}
	// 可以根据需要添加更多按钮的操作逻辑
};
export function showConfirm() {
	ElMessageBox({
		title: "请选择登录渠道",
		customClass: "custom-message-box",
		showCancelButton: false, // 不显示默认的取消按钮
		showConfirmButton: false, // 不显示默认的确认按钮
		closeOnClickModal: false,
        closeOnHashChange: true,
		showClose: false,
		// 将自定义组件作为 message 的值传递
		message: h(
			"div",
			buttons.map((button) => {
				return h("div", { style: "margin: 5px" }, [
					h(
						ElButton,
						{
							onClick: () => handleButtonClick(button.action),
						},
						button.text
					),
				]);
			})
		),
	});
}

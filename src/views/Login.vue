<template>
	<div class="login-container">
		<el-form
			ref="loginForm"
			:model="loginForm"
			:rules="loginRules"
			class="login-form"
			auto-complete="on"
			label-position="left"
		>
			<div class="title-container">
				<h3 class="title">登录</h3>
			</div>

			<el-form-item prop="username">
				<span class="svg-container">
					<svg-icon icon-class="user" />
				</span>
				<el-input
					ref="username"
					v-model="loginForm.username"
					placeholder="用户名"
					name="username"
					type="text"
					tabindex="1"
					auto-complete="on"
				/>
			</el-form-item>

			<el-form-item prop="password">
				<span class="svg-container">
					<svg-icon icon-class="password" />
				</span>
				<el-input
					:key="passwordType"
					ref="password"
					v-model="loginForm.password"
					:type="passwordType"
					placeholder="密码"
					name="password"
					tabindex="2"
					auto-complete="on"
					@keyup.enter="handleLogin"
				/>
				<span class="show-pwd" @click="showPwd">
					<svg-icon
						:icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
					/>
				</span>
			</el-form-item>

			<el-button
				:loading="loading"
				type="primary"
				style="width: 100%; margin-bottom: 30px"
				@click="handleLogin"
				>登录</el-button
			>

			<div class="tips">
				<span style="margin-right: 20px">用户名: admin</span>
				<span>密码: any</span>
			</div>
		</el-form>
	</div>
</template>

<script>
import axios from "axios";
import {showConfirm } from "./utils/loginSelect";
import { ElMessage } from "element-plus";
export default {
	name: "Login",
	data() {
		const validateUsername = (rule, value, callback) => {
			if (!value) {
				callback(new Error("请输入用户名"));
			} else {
				callback();
			}
		};
		const validatePassword = (rule, value, callback) => {
			if (!value) {
				callback(new Error("请输入密码"));
			} else {
				callback();
			}
		};
		return {
			loginForm: {
				username: "",
				password: "",
			},
			loginRules: {
				username: [
					{ required: true, trigger: "blur", validator: validateUsername },
				],
				password: [
					{ required: true, trigger: "blur", validator: validatePassword },
				],
			},
			loading: false,
			passwordType: "password",
			redirect: undefined,
		};
	},
	watch: {
		$route: {
			handler: function (route) {
				this.redirect = route.query && route.query.redirect;
			},
			immediate: true,
		},
	},
	methods: {
		showPwd() {
			if (this.passwordType === "password") {
				this.passwordType = "";
			} else {
				this.passwordType = "password";
			}
			this.$nextTick(() => {
				this.$refs.password.focus();
			});
		},
		handleLogin() {
			this.$refs.loginForm.validate((valid) => {
				if (valid) {
					this.loading = true;
					axios.post('https://data.andupchain.com/api/Test/CommonLogin',{
                        UserName:this.loginForm.username,
                        PassWord:this.loginForm.password
                    }).then((res) => {
                        if(res.data.data){
                            this.loading =false
                            showConfirm()
                        }else{
							ElMessage.error("账号或密码错误，请重新登录");
                            this.loading =false
                        }
                    })
				} else {
					
					return false;
				}
			});
		},
	},
};
</script>

<style lang="scss">
/* 登录页面样式 */
.login-container {
	height: 100%;
	width: 100%;
	background-color: #f0f2f5;
	.login-form {
		width: 520px;
		max-width: 100%;
		padding: 160px 35px 0;
		margin: 0 auto;
		overflow: hidden;
	}
	.svg-container {
		padding: 6px 5px 6px 15px;
		vertical-align: middle;
		width: 30px;
		display: inline-block;
	}
	.title-container {
		position: relative;
		.title {
			font-size: 26px;
			color: #333333;
			margin: 0px auto 40px auto;
			text-align: center;
			font-weight: bold;
		}
	}
	.show-pwd {
		position: absolute;
		right: 10px;
		top: 7px;
		font-size: 16px;
		color: #000000;
		cursor: pointer;
		user-select: none;
	}
	.tips {
		font-size: 14px;
		color: #fff;
		margin-bottom: 10px;
		span {
			&:first-of-type {
				margin-right: 16px;
			}
		}
	}
}
</style>
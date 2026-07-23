<script setup lang="ts">
import { onMounted, ref } from 'vue'
import router from '../router';
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const activeIndex = ref('1')
const handleSelect = (key: string) => {
  router.push(key)
}

onMounted(() => {
//   window.localStorage.setItem('cookiename', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTc5MSwidXNlcm5hbWUiOiJTUuaxn-abvOathiIsIm1vYmlsZSI6IjE4Njg4ODIxMjI0IiwiYXZhdGFyIjoiaHR0cHM6Ly93ZXdvcmsucXBpYy5jbi93d3BpYzNhei81OTU0M190NWRoa1NGdFI3R3h1QWxfMTcyNDg0NDM1NS8wIiwidXNlcmlkIjoiSmlhbmdNYW5YaW4iLCJwYXJ0bmVySWQiOjgwMDAxLCJzaG9wSWQiOjg4ODg4LCJmcm9tIjoicGFydG5lciIsImdlbklkIjoic2VxMXR5VSIsIm5iZiI6MTcyNjc5NzQ1MywiZXhwIjoxNzI3NDAyMjUzLCJpYXQiOjE3MjY3OTc0NTN9.E2fBnS7q1LaVzMzx6JPb9AJiP1INqouRzr1OzNfkprE')
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div style="width: 100vw; height: 100vh; display: flex; flex-direction: column;">
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect" 
          background-color="#3f9eff"
          text-color="#fff"
          active-text-color="#ffd04b">
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/commodity">商品</el-menu-item>
        <el-menu-item index="/order">订单</el-menu-item>
      </el-menu>
      <router-view />
    </div>
  </el-config-provider>
</template>

<style>
div {
  box-sizing: border-box;
}
</style>

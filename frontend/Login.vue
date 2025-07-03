<template>
  <el-container style="height: 100vh; align-items: center; justify-content: center; flex-direction: column;">
    <!-- <div style="text-align:center; margin-bottom: 32px; flex: none; margin-top: 8vh;">
      <h1 style="font-size: 2rem; font-weight: bold; letter-spacing: 2px;">Docker管理系统</h1>
    </div> -->
    <el-main style="max-width: 400px; margin: auto; flex: none;">
      <el-card :body-style="{padding: '32px 24px'}" style="border-radius: 20px; width:340px; margin:0 auto;">
        <h2 style="text-align:center; margin-bottom: 24px;">用户登录</h2>
        <el-form @submit.prevent="onLogin" style="width: 100%; max-width: 300px; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
          <el-form-item style="width:100%; display:flex; justify-content:center;">
            <el-input v-model="username" autocomplete="username" style="width:160px; margin: 0 auto;" placeholder="请输入用户名" :input-style="{textAlign: 'center'}" @keyup.enter="onLogin" />
          </el-form-item>
          <el-form-item style="width:100%; display:flex; justify-content:center;">
            <el-input v-model="password" type="password" autocomplete="current-password" style="width:160px; margin: 0 auto;" placeholder="请输入密码" :input-style="{textAlign: 'center'}" @keyup.enter="onLogin" />
          </el-form-item>
          <el-form-item style="width:100%; display:flex; justify-content:center;">
            <el-button type="primary" @click="onLogin" :loading="loading" style="width:120px; margin:0 auto; display:block;">登录</el-button>
          </el-form-item>
          <el-form-item v-if="error" style="width:100%">
            <el-alert :title="error" type="error" show-icon style="width:100%" />
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const onLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.post('/api/login', { username: username.value, password: password.value });
    localStorage.setItem('token', res.data.token);
    window.location.href = '/';
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败';
  }
  loading.value = false;
};
</script>

<style scoped>
.el-form {
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.el-form-item {
  width: 100%;
  justify-content: center !important;
  display: flex;
}
::v-deep .el-input__inner {
  text-align: center !important;
}
::v-deep .el-input__inner::placeholder {
  text-align: center !important;
}
</style>

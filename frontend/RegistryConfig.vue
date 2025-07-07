<template>
  <div class="center-form">
    <el-card class="form-card">
      <el-form label-width="100px">
        <el-form-item label="仓库地址">
          <el-input v-model="registry" placeholder="如 registry.example.com" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item style="justify-content:center; display:flex;">
          <el-button type="primary" @click="saveConfig">保存</el-button>
          <el-button type="success" @click="checkLogin" :loading="checking" style="margin-left:20px">验证登录</el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="msg" :title="msg" :type="msgType" show-icon style="margin-top:10px; text-align:center;" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const registry = ref('');
const username = ref('');
const password = ref('');
const msg = ref('');
const msgType = ref('success');
const checking = ref(false);

onMounted(() => {
  registry.value = localStorage.getItem('privateRegistry') || '';
  username.value = localStorage.getItem('privateUser') || '';
  password.value = localStorage.getItem('privatePass') || '';
});

function saveConfig() {
  localStorage.setItem('privateRegistry', registry.value);
  localStorage.setItem('privateUser', username.value);
  localStorage.setItem('privatePass', password.value);
  msg.value = '保存成功';
  msgType.value = 'success';
  setTimeout(() => { msg.value = ''; }, 1500);
}

async function checkLogin() {
  checking.value = true;
  msg.value = '';
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post('/api/registry/check', {
      registry: registry.value,
      username: username.value,
      password: password.value
    }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.data.success) {
      msg.value = '登录成功！';
      msgType.value = 'success';
    } else {
      msg.value = '登录失败：' + (res.data.message || '未知错误');
      msgType.value = 'error';
    }
  } catch (e) {
    msg.value = '请求失败：' + (e.response?.data?.message || e.message);
    msgType.value = 'error';
  }
  checking.value = false;
}
</script>

<style>
.center-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.form-card {
  min-width: 400px;
  padding: 32px 24px 24px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-radius: 16px;
}
</style>

<template>
  <el-container style="height: 100vh">
    <el-header>
      <h2>Docker 镜像管理</h2>
      <div style="float:right; margin-top:-40px;">
        <el-button @click="goConfig" style="margin-right: 10px;">私有仓库配置</el-button>
        <el-button type="danger" @click="logout">退出登录</el-button>
      </div>
    </el-header>
    <el-main>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="镜像搜索">
          <el-input v-model="searchQuery" placeholder="输入镜像名" @keyup.enter="onSearch" style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="images" v-loading="loading" style="margin-top: 20px">
        <el-table-column prop="name" label="镜像名" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="success" @click="pullAndPush(scope.row.name)">拉取并上传</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="dialogVisible" title="操作结果" width="600px">
        <pre style="white-space: pre-wrap">{{ dialogMsg }}</pre>
        <template #footer>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const searchQuery = ref('');
const images = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMsg = ref('');

function getRegistryConfig() {
  return {
    registry: localStorage.getItem('privateRegistry') || '',
    username: localStorage.getItem('privateUser') || '',
    password: localStorage.getItem('privatePass') || ''
  };
}

const onSearch = async () => {
  if (!searchQuery.value) return;
  loading.value = true;
  try {
    const res = await axios.get('/api/search', { params: { q: searchQuery.value }, headers: authHeader() });
    images.value = (res.data || []).map(i => ({ name: i.name || i.repo_name || i.repository || i.path }));
  } catch (e) {
    images.value = [];
    if (e.response?.status === 401) window.location.reload();
  }
  loading.value = false;
};

const pullAndPush = async (image) => {
  const { registry, username, password } = getRegistryConfig();
  if (!registry) {
    dialogMsg.value = '请先在“私有仓库配置”页面填写仓库信息';
    dialogVisible.value = true;
    return;
  }
  loading.value = true;
  try {
    const pullRes = await axios.post('/api/pull', { image }, { headers: authHeader() });
    const pushRes = await axios.post('/api/push', {
      image,
      registry,
      username,
      password
    }, { headers: authHeader() });
    dialogMsg.value = `拉取结果:\n${pullRes.data.output}\n\n上传结果:\n${pushRes.data.output}`;
  } catch (e) {
    dialogMsg.value = e.response?.data?.error || e.message;
    if (e.response?.status === 401) window.location.reload();
  }
  dialogVisible.value = true;
  loading.value = false;
};

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function goConfig() {
  window.location.href = '/?config=1';
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}
</script>

<style>
body {
  margin: 0;
}
</style>

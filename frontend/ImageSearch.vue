<template>
  <div class="center-form">
    <el-card class="form-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="镜像源">
          <el-select v-model="searchSource" style="width: 140px">
            <el-option label="DockerHub" value="dockerhub" />
            <el-option label="GitHub" value="github" />
          </el-select>
        </el-form-item>
        <el-form-item label="镜像搜索">
          <el-input v-model="searchQuery" placeholder="输入镜像名" @keyup.enter="onSearch" style="width: 180px" />
        </el-form-item>
        <el-form-item label="版本(可选)">
          <el-input v-model="searchTag" placeholder="如 latest/1.0" @keyup.enter="onSearch" style="width: 120px" />
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
      <el-dialog v-model="dialogVisible" title="实时日志" width="600px">
        <pre style="white-space: pre-wrap; color:#222; background:#f7f7f7; min-height:200px;">{{ dialogMsg }}</pre>
        <template #footer>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const searchQuery = ref('');
const searchSource = ref('dockerhub');
const searchTag = ref('');
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
    const res = await axios.get('/api/search', {
      params: {
        q: searchQuery.value,
        source: searchSource.value,
        tag: searchTag.value
      },
      headers: authHeader()
    });
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

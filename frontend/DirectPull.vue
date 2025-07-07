<template>
  <div class="center-form">
    <el-card class="form-card">
      <el-form @submit.prevent="onPullPush" label-width="100px" :model="form">
        <el-form-item label="镜像名:tag">
          <el-input v-model="image" placeholder="如 ghcr.io/wg-easy/wg-easy:15" clearable style="width:320px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onPullPush" :loading="loading" style="width: 160px;">拉取并推送</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-dialog v-model="dialogVisible" title="实时日志" width="600px">
      <pre style="white-space: pre-wrap; color:#222; background:#f7f7f7; min-height:200px;">{{ log || '正在执行操作，请稍候...\n' }}</pre>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const image = ref('');
const loading = ref(false);
const log = ref('');
const dialogVisible = ref(false);
const form = {};

function getRegistryConfig() {
  return {
    registry: localStorage.getItem('privateRegistry') || '',
    username: localStorage.getItem('privateUser') || '',
    password: localStorage.getItem('privatePass') || ''
  };
}

async function onPullPush() {
  const { registry, username, password } = getRegistryConfig();
  if (!image.value || !registry) {
    log.value = '请先配置私有仓库并输入镜像名';
    dialogVisible.value = true;
    return;
  }
  loading.value = true;
  log.value = '';
  dialogVisible.value = true;
  const token = localStorage.getItem('token');
  const evtSource = new EventSourcePolyfill('/api/direct-pull-push', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: image.value, registry, username, password })
  });
  evtSource.onmessage = (e) => {
    log.value += e.data + '\n';
  };
  evtSource.onerror = () => {
    loading.value = false;
    evtSource.close();
  };
}

// 兼容 EventSource POST
class EventSourcePolyfill {
  constructor(url, options) {
    this.es = null;
    this.init(url, options);
  }
  init(url, options) {
    fetch(url, options).then(async res => {
      const reader = res.body.getReader();
      let decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let parts = buffer.split('\n\n');
        buffer = parts.pop();
        for (const part of parts) {
          if (part.startsWith('data:')) {
            this.onmessage && this.onmessage({ data: part.replace('data: ', '').replace('data:', '') });
          }
        }
      }
      this.onerror && this.onerror();
    });
  }
  close() {}
}
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
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

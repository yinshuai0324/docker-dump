<template>
  <div>
    <el-container v-if="$route.name !== 'Login'" class="full-container">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo-bar">Docker 管理</div>
        <el-menu :default-active="$route.name" @select="onMenuSelect" class="el-menu-vertical-demo" router>
          <el-menu-item index="Main">
            <el-icon><i-ep-search /></el-icon>
            <span>镜像搜索</span>
          </el-menu-item>
          <el-menu-item index="DirectPull">
            <el-icon><i-ep-download /></el-icon>
            <span>拉取镜像</span>
          </el-menu-item>
          <el-menu-item index="RegistryConfig">
            <el-icon><i-ep-setting /></el-icon>
            <span>仓库配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <!-- 顶部栏 -->
        <el-header class="header-bar">
          <div class="header-title">Docker镜像转存管理系统</div>
          <el-button type="danger" class="logout-btn" @click="logout">退出登录</el-button>
        </el-header>
        <!-- 内容区 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <router-view v-else />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search as IepSearch, Download as IepDownload, Setting as IepSetting } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const onMenuSelect = (key) => {
  router.push({ name: key });
};

function logout() {
  localStorage.removeItem('token');
  ElMessage.success('已退出登录');
  setTimeout(() => {
    router.push('/login');
  }, 500);
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #f5f7fa;
  overflow: hidden;
}
#app {
  height: 100vh;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
.full-container {
  height: 100vh;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}
.sidebar {
  background: #2d3a4b;
  color: #fff;
  min-height: 100vh;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
}
.logo-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
  background: #263445;
  margin-bottom: 8px;
}
.el-menu-vertical-demo {
  border-right: none;
  background: transparent;
}
.el-menu-vertical-demo .el-menu-item {
  color: #fff;
  font-size: 16px;
  height: 48px;
  line-height: 48px;
}
.el-menu-vertical-demo .el-menu-item.is-active {
  background: #409eff;
  color: #fff;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  padding: 0 24px;
  height: 60px;
}
.header-title {
  font-size: 20px;
  font-weight: 500;
  color: #222;
}
.logout-btn {
  margin-left: auto;
}
.main-content {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 32px 24px;
  box-sizing: border-box;
  overflow: auto;
}
</style>

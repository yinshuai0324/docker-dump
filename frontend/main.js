import { createApp, h } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import Login from './Login.vue';
import RegistryConfig from './RegistryConfig.vue';

const token = localStorage.getItem('token');
const url = new URL(window.location.href);
const showConfig = url.searchParams.get('config') === '1';

const Root = {
  render() {
    if (!token) return h(Login);
    if (showConfig) return h(RegistryConfig);
    return h(App);
  }
};

const app = createApp(Root);
app.use(ElementPlus);
app.mount('#app');

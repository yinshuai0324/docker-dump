// registryApi.js
const dockerLogin = require('./dockerLogin');

// 校验私有仓库登录
async function checkRegistryLogin(registry, username, password) {
  if (!registry || !username || !password) return { success: false, message: '参数不完整' };
  return await dockerLogin(registry, username, password);
}

module.exports = { checkRegistryLogin };

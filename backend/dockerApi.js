// dockerApi.js
// 提供镜像搜索、拉取、推送的API实现
const { exec } = require('child_process');
const fetch = require('node-fetch');
const dockerLogin = require('./dockerLogin');

// 镜像搜索（支持源切换和tag）
async function searchImage(query, source = 'dockerhub', tag = '') {
  if (source === 'github') {
    // GitHub Container Registry: ghcr.io
    // 只能通过 GitHub API 搜索公开包
    // 这里只做简单实现，实际可扩展为带token的API
    const url = `https://ghcr.io/v2/_catalog`;
    // ghcr.io/v2/_catalog 只返回公开仓库，且不支持模糊搜索，需企业/个人token
    // 这里只做演示，实际生产建议用GitHub API
    try {
      const res = await fetch(url);
      const data = await res.json();
      let results = (data.repositories || []).filter(name => name.includes(query));
      // tag搜索
      if (tag && results.length) {
        // 只查第一个匹配仓库的tag
        const repo = results[0];
        const tagUrl = `https://ghcr.io/v2/${repo}/tags/list`;
        const tagRes = await fetch(tagUrl);
        const tagData = await tagRes.json();
        results = tagData.tags?.filter(t => t.includes(tag)).map(t => `${repo}:${t}`) || [];
      }
      return results.map(name => ({ name }));
    } catch {
      return [];
    }
  } else {
    // DockerHub
    let url = `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    let results = data.results || [];
    if (tag && results.length) {
      // 只查第一个仓库的tag
      const repo = results[0].name || results[0].repo_name;
      const tagUrl = `https://hub.docker.com/v2/repositories/${repo}/tags/?page_size=100`;
      const tagRes = await fetch(tagUrl);
      const tagData = await tagRes.json();
      results = tagData.results?.filter(t => t.name.includes(tag)).map(t => ({ name: `${repo}:${t.name}` })) || [];
    }
    return results;
  }
}

// 拉取镜像
function pullImage(image) {
  return new Promise((resolve, reject) => {
    exec(`docker pull ${image}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

// 推送镜像到私有仓库
async function pushImage(image, registry, username, password) {
  const imageName = image.includes('/') ? image.split('/').pop() : image;
  const target = `${registry}/${imageName}`;
  if (username && password) {
    await dockerLogin(registry, username, password);
  }
  return new Promise((resolve, reject) => {
    exec(`docker tag ${image} ${target} && docker push ${target} && docker rmi ${target} ${image}`,
      (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout + '\n本地镜像已删除');
      });
  });
}

module.exports = { searchImage, pullImage, pushImage };

// dockerApi.js
// 提供镜像搜索、拉取、推送的API实现
const { exec } = require('child_process');
const fetch = require('node-fetch');
const dockerLogin = require('./dockerLogin');

// 镜像搜索（DockerHub）
async function searchImage(query) {
  const url = `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
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

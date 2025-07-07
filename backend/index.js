// Express 后端入口
const express = require('express');
const app = express();
const port = 8081;
app.use(express.json());

const { searchImage, pullImage, pushImage } = require('./dockerApi');
const { checkRegistryLogin } = require('./registryApi');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const SECRET = 'docker-dump-secret'; // 可换成更安全的密钥

// 用户信息支持环境变量，默认admin/admin123
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const USERS = [{ username: ADMIN_USER, password: ADMIN_PASS }];

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: '用户名或密码错误' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// token 校验中间件
function auth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '未授权' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: '无效或过期的 token' });
  }
}

app.get('/', (req, res) => {
  res.send('Docker API backend running');
});

// 镜像搜索
app.get('/api/search', auth, async (req, res) => {
  const { q, source = 'dockerhub', tag = '' } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const results = await searchImage(q, source, tag);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 拉取镜像
app.post('/api/pull', auth, async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'Missing image' });
  try {
    const output = await pullImage(image);
    res.json({ output });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 推送镜像到私有仓库
app.post('/api/push', auth, async (req, res) => {
  const { image, registry, username, password } = req.body;
  if (!image || !registry) return res.status(400).json({ error: 'Missing image or registry' });
  try {
    const output = await pushImage(image, registry, username, password);
    res.json({ output });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// 校验私有仓库登录
app.post('/api/registry/check', auth, async (req, res) => {
  const { registry, username, password } = req.body;
  try {
    const result = await checkRegistryLogin(registry, username, password);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.toString() });
  }
});

// 拉取并推送镜像（实时日志）
app.post('/api/direct-pull-push', auth, (req, res) => {
  const { image, registry, username, password } = req.body;
  if (!image || !registry) return res.status(400).json({ error: 'Missing image or registry' });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // docker login（如有）
  let loginCmd = null;
  if (username && password) {
    loginCmd = spawn('sh', ['-c', `echo ${password} | docker login ${registry} -u ${username} --password-stdin`]);
    loginCmd.stdout.on('data', data => res.write(`data: ${data}\n\n`));
    loginCmd.stderr.on('data', data => res.write(`data: ${data}\n\n`));
    loginCmd.on('close', () => runPullPush());
  } else {
    runPullPush();
  }

  function runPullPush() {
    const imageName = image.includes('/') ? image.split('/').pop() : image;
    const target = `${registry}/${imageName}`;
    const cmd = `docker pull ${image} && docker tag ${image} ${target} && docker push ${target} && docker rmi ${target} ${image}`;
    const proc = spawn('sh', ['-c', cmd]);
    proc.stdout.on('data', data => res.write(`data: ${data}\n\n`));
    proc.stderr.on('data', data => res.write(`data: ${data}\n\n`));
    proc.on('close', code => {
      res.write(`data: 操作完成，退出码: ${code}\n\n`);
      res.end();
    });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
  console.log('登录账号：' + ADMIN_USER);
  console.log('登录密码：' + ADMIN_PASS);
});

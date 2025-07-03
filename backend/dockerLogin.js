// dockerLogin.js
// 用于 docker login
const { exec } = require('child_process');

function dockerLogin(registry, username, password) {
  return new Promise((resolve, reject) => {
    const cmd = `echo ${password} | docker login ${registry} -u ${username} --password-stdin`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return resolve({ success: false, message: stderr });
      resolve({ success: true, message: stdout });
    });
  });
}

module.exports = dockerLogin;

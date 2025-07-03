#!/bin/bash
# 启动后端
cd /app/backend && PORT=8081 node index.js &
# 启动nginx
nginx -g 'daemon off;'

#!/bin/bash
# 双击运行此文件推送到GitHub
cd "$(dirname "$0")"
echo "正在推送到 GitHub..."
git push -u origin main
echo "推送完成！按任意键退出..."
read -n 1

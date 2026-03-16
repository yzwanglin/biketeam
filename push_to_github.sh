#!/bin/bash
# 绿行积分项目 - GitHub推送脚本

echo "正在推送到GitHub..."
cd /Users/apple/CodeBuddy/20260314185122

# 尝试使用SSH方式推送
git remote set-url origin git@github.com:yzwanglin/biketeam.git
git push -u origin main

echo "推送完成！"

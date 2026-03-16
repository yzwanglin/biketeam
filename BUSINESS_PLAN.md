# 绿行积分平台 - 商业化方案

## 项目概述

**项目名称**: 绿行积分平台（GreenRide）
**项目定位**: 基于绿色骑行的积分奖励与抵扣平台
**核心理念**: 骑行 1 公里获得绿色积分，积分可在商城购买商品并抵扣 20% 现金

---

## 一、平台架构

### 1.1 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      绿行积分平台                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐              ┌──────────────┐           │
│  │   用户端 APP  │              │  管理后台     │           │
│  │              │              │              │           │
│  │ • 注册/登录   │              │ • 用户管理    │           │
│  │ • 骑行记录   │              │ • 订单管理    │           │
│  │ • 积分商城   │              │ • 商品管理    │           │
│  │ • 订单中心   │              │ • 数据统计    │           │
│  │ • 个人中心   │              │ • 广告管理    │           │
│  └──────────────┘              └──────────────┘           │
│         │                              │                  │
│         └──────────┬───────────────────┘                  │
│                    ↓                                      │
│         ┌──────────────────┐                              │
│         │   后端 API 服务   │                              │
│         │                  │                              │
│         │ • 用户认证       │                              │
│         │ • 骑行数据       │                              │
│         │ • 积分计算       │                              │
│         │ • 商城订单       │                              │
│         │ • 数据统计       │                              │
│         └──────────────────┘                              │
│                    ↓                                      │
│         ┌──────────────────┐                              │
│         │    数据库        │                              │
│         │                  │                              │
│         │ • 用户表         │                              │
│         │ • 骑行记录表     │                              │
│         │ • 积分记录表     │                              │
│         │ • 商品表         │                              │
│         │ • 订单表         │                              │
│         │ • 广告表         │                              │
│         └──────────────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 用户角色

| 角色 | 描述 | 权限 |
|------|------|------|
| **普通用户** | 私人电瓶车骑行者 | 注册登录、骑行记录、积分商城、订单管理、个人中心 |
| **管理员** | 平台运营人员 | 用户管理、商品管理、订单管理、数据统计、广告管理 |
| **超级管理员** | 系统最高权限 | 所有权限 + 系统配置、角色管理 |

---

## 二、核心功能

### 2.1 用户端 APP 功能

#### 🔐 用户模块
- 手机号注册/登录
- 微信/第三方登录
- 实名认证（可选）
- 个人信息管理
- 骑行认证（绑定电瓶车）

#### 🚴 骑行模块
- 开始/结束骑行
- 实时 GPS 轨迹记录
- 里程计算（自动）
- 速度、时间、路线显示
- 历史骑行记录
- 骑行数据统计

#### 💰 积分模块
- 积分规则：骑行 1 公里 = 10 绿色积分
- 积分获取记录
- 积分使用记录
- 积分等级体系
- 积分有效期管理

#### 🛒 积分商城
- 商品浏览（分类、搜索）
- 商品详情
- 购买商品
- 积分抵扣 20% 现金
- 订单确认
- 支付（微信/支付宝 + 积分）

#### 📦 订单中心
- 订单列表
- 订单详情
- 订单状态追踪
- 退款/售后

#### 👤 个人中心
- 个人信息
- 我的积分
- 骑行统计
- 我的订单
- 地址管理
- 设置

### 2.2 管理后台功能

#### 👥 用户管理
- 用户列表
- 用户详情
- 用户状态管理
- 用户积分调整
- 骑行数据审核

#### 📦 商品管理
- 商品添加/编辑/删除
- 商品分类管理
- 商品上架/下架
- 库存管理
- 价格管理（积分 + 现金）

#### 🛒 订单管理
- 订单列表
- 订单详情
- 订单状态管理
- 退款处理
- 发货管理

#### 📊 数据统计
- 用户数据统计
- 骑行数据统计
- 积分发发统计
- 订单数据统计
- 营收统计
- 图表可视化

#### 📢 广告管理
- 广告列表
- 广告创建
- 广告投放
- 广告效果统计

#### ⚙️ 系统设置
- 积分规则配置
- 商品分类配置
- 支付配置
- 系统公告

---

## 三、积分规则

### 3.1 积分获取

| 行为 | 积分奖励 | 备注 |
|------|----------|------|
| 骑行 1 公里 | +10 积分 | 基础奖励 |
| 完成首次骑行 | +100 积分 | 新手奖励 |
| 邀请好友 | +50 积分 | 每邀请一人 |
| 签到 | +5 积分/天 | 连续签到翻倍 |
| 评价订单 | +2 积分 | 完成评价 |

### 3.2 积分使用

| 用途 | 说明 |
|------|------|
| 商城购物 | 抵扣商品价格的 20% |
| 积分兑换 | 兑换特定商品 |
| 积分抽奖 | 参与抽奖活动 |
| 优惠券 | 兑换优惠券 |

### 3.3 积分等级

| 等级 | 积分要求 | 特权 |
|------|----------|------|
| 青铜骑士 | 0-999 积分 | 基础权益 |
| 白银骑士 | 1000-4999 积分 | 积分 1.1 倍 |
| 黄金骑士 | 5000-19999 积分 | 积分 1.2 倍 + 专属客服 |
| 铂金骑士 | 20000-99999 积分 | 积分 1.3 倍 + 优先发货 |
| 钻石骑士 | 100000+ 积分 | 积分 1.5 倍 + 生日礼 + 专属活动 |

---

## 四、积分商城规则

### 4.1 商品定价

**公式**: 最终价格 = 现金价格 × 0.8 + 积分数量 × 积分价值

**示例**:
- 商品原价: 100 元
- 现金支付: 80 元（抵扣 20%）
- 积分抵扣: 1000 积分（100 元 × 20% ÷ 0.02 元/积分）
- 实际支付: 80 元现金 + 1000 积分

### 4.2 积分价值
- **100 积分 = 2 元**（用于抵扣）
- **积分有效期**: 自获得之日起 12 个月

### 4.3 商品分类

- 🚲 骑行装备（头盔、手套、锁）
- 🎁 电子产品（充电宝、耳机、智能手表）
- 🧴 生活用品（洗发水、洗衣液、纸巾）
- 🍎 食品饮料（零食、饮料、水果）
- 🎫 优惠券（外卖券、电影票、打车券）
- ⭐ 限定商品（积分专属、限量款）

---

## 五、数据库设计

### 5.1 核心数据表

#### users（用户表）
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255),
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  total_distance DECIMAL(10,2) DEFAULT 0,
  total_rides INT DEFAULT 0,
  invite_code VARCHAR(20) UNIQUE,
  inviter_id INT,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### rides（骑行记录表）
```sql
CREATE TABLE rides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  distance DECIMAL(10,2) DEFAULT 0,
  duration INT DEFAULT 0,
  avg_speed DECIMAL(5,2),
  start_lat DECIMAL(10,8),
  start_lng DECIMAL(11,8),
  end_lat DECIMAL(10,8),
  end_lng DECIMAL(11,8),
  points_earned INT DEFAULT 0,
  route_data TEXT,
  status TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### points_records（积分记录表）
```sql
CREATE TABLE points_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  points INT NOT NULL,
  type ENUM('ride', 'invite', 'sign', 'order', 'other') NOT NULL,
  description VARCHAR(255),
  related_id INT,
  balance_after INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### products（商品表）
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INT,
  price_cash DECIMAL(10,2) NOT NULL,
  points_required INT,
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  sales INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### orders（订单表）
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(100),
  product_image VARCHAR(255),
  quantity INT DEFAULT 1,
  price_cash DECIMAL(10,2),
  points_used INT,
  total_price DECIMAL(10,2),
  status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'),
  pay_method VARCHAR(20),
  pay_time DATETIME,
  ship_time DATETIME,
  complete_time DATETIME,
  address_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### categories（商品分类表）
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  parent_id INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1
);
```

---

## 六、API 接口设计

### 6.1 用户相关

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/user/register | POST | 用户注册 |
| /api/user/login | POST | 用户登录 |
| /api/user/profile | GET | 获取用户信息 |
| /api/user/profile | PUT | 更新用户信息 |
| /api/user/points | GET | 获取积分余额 |
| /api/user/rides | GET | 获取骑行记录 |

### 6.2 骑行相关

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/ride/start | POST | 开始骑行 |
| /api/ride/end | POST | 结束骑行 |
| /api/ride/track | POST | 上传骑行轨迹 |
| /api/ride/history | GET | 获取骑行历史 |

### 6.3 商品相关

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/products | GET | 获取商品列表 |
| /api/products/:id | GET | 获取商品详情 |
| /api/categories | GET | 获取商品分类 |

### 6.4 订单相关

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/orders | POST | 创建订单 |
| /api/orders | GET | 获取订单列表 |
| /api/orders/:id | GET | 获取订单详情 |
| /api/orders/:id/pay | POST | 支付订单 |
| /api/orders/:id/cancel | POST | 取消订单 |

### 6.5 管理后台相关

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/users | GET | 获取用户列表 |
| /api/admin/products | GET/POST | 商品管理 |
| /api/admin/orders | GET | 获取订单列表 |
| /api/admin/stats | GET | 获取统计数据 |

---

## 七、商业模式

### 7.1 盈利模式

1. **商品销售差价**
   - 与供应商合作，获取进货折扣
   - 商品销售获得利润

2. **广告收入**
   - 商城广告位出租
   - 开屏广告、Banner 广告

3. **会员服务**
   - VIP 会员（特权、专属商品）
   - 月费订阅

4. **数据服务**
   - 骑行数据分析报告
   - 城市骑行热力图

### 7.2 成本结构

- 平台开发与维护
- 服务器与带宽成本
- 商品采购成本
- 市场推广费用
- 客服与运营成本

### 7.3 推广策略

1. **用户拉新**
   - 邀请好友奖励
   - 新人礼包
   - 社交分享裂变

2. **品牌合作**
   - 与电瓶车品牌合作
   - 与商场、超市合作
   - 品牌联名活动

3. **政府合作**
   - 绿色出行补贴
   - 碳积分项目合作

---

## 八、技术栈

### 8.1 前端技术

#### 用户端
- **Web**: React + React Router + Ant Design
- **H5/App**: React Native / UniApp
- **小程序**: 微信小程序（可选）

#### 管理后台
- **框架**: React + TypeScript
- **UI库**: Ant Design Pro
- **图表**: ECharts
- **状态管理**: Redux Toolkit

### 8.2 后端技术

- **框架**: Node.js (Express) / Python (FastAPI) / Java (Spring Boot)
- **数据库**: MySQL / PostgreSQL
- **缓存**: Redis
- **消息队列**: RabbitMQ / Kafka
- **文件存储**: 阿里云 OSS / 腾讯云 COS

### 8.3 运维部署

- **服务器**: 腾讯云轻量应用服务器
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **监控**: Prometheus + Grafana

---

## 九、开发计划

### Phase 1: MVP 版本（2 个月）
- ✅ 用户注册登录
- ✅ 骑行记录功能
- ✅ 积分计算
- ✅ 基础商城
- ✅ 管理后台基础功能

### Phase 2: 完整版本（3 个月）
- ✅ 积分商城完整功能
- ✅ 订单管理
- ✅ 支付集成
- ✅ 数据统计
- ✅ 广告系统

### Phase 3: 优化版本（2 个月）
- ✅ 积分等级体系
- ✅ 邀请系统
- ✅ 推送通知
- ✅ 活动系统
- ✅ 性能优化

### Phase 4: 迭代版本（持续）
- ✅ AI 推荐
- ✅ 社区功能
- ✅ 多城市扩展
- ✅ 数据分析平台

---

## 十、预期目标

### 10.1 用户指标
- 首月注册用户: 1000+
- 半年活跃用户: 5000+
- 年度骑行总里程: 10万+ 公里

### 10.2 商业指标
- 首月订单量: 200+
- 月度 GMV: 5万+
- 半年营收: 50万+
- 年度营收: 200万+

### 10.3 社会效益
- 减少碳排放
- 促进绿色出行
- 健康生活方式
- 城市交通优化

---

## 十一、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 数据造假 | 积分滥用 | GPS 轨迹验证、异常检测 |
| 商品质量 | 用户流失 | 严格品控、售后保障 |
| 政策风险 | 运营受限 | 合规经营、政府合作 |
| 竞争压力 | 市场份额 | 差异化竞争、品牌建设 |

---

## 十二、后续规划

1. **扩展到其他城市**
2. **增加共享单车合作**
3. **开发骑行社交功能**
4. **AI 智能推荐**
5. **区块链积分（防伪）**
6. **政府补贴项目对接**

---

**版本**: v1.0  
**创建日期**: 2026-03-10  
**文档类型**: 商业化方案文档

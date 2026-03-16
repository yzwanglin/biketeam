# 📱 常骑骑APP与GPS设备集成方案

## 一、集成架构设计

### 1.1 整体架构

```
┌─────────────────┐     JT808协议    ┌─────────────────┐
│  博实结KG12     │ ←─────────────→ │   数据接收服务器 │
│  GPS定位设备    │     TCP/UDP      │  (Node.js/TCP)  │
└─────────────────┘                  └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │    数据解析器    │
                                        │ (JT808协议解析)  │
                                        └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │    业务处理器    │
                                        │ (骑行状态判断)   │
                                        └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │    数据库存储    │
                                        │   (MySQL/Redis)  │
                                        └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │   WebSocket服务 │
                                        │  (实时数据推送)  │
                                        └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │    常骑骑APP     │
                                        │ (React Native)   │
                                        └─────────────────┘
```

### 1.2 技术栈选择

| 组件 | 技术选择 | 理由 |
|------|----------|------|
| 数据接收服务器 | Node.js + net模块 | 适合TCP/UDP通信 |
| 协议解析器 | 自定义JT808解析库 | 专用协议处理 |
| 数据库 | MySQL + Redis | 关系型+缓存 |
| 实时推送 | WebSocket (Socket.IO) | 实时性高 |
| 前端APP | React Native | 跨平台开发 |

---

## 二、数据流设计

### 2.1 实时数据流

```
设备GPS数据 → TCP/UDP → 数据接收 → 协议解析 → 骑行判断 → 存储 → WebSocket推送 → APP显示
```

### 2.2 数据处理步骤

1. **数据接收** - 接收JT808协议数据包
2. **协议解析** - 解析位置信息、状态、报警等
3. **数据验证** - 验证数据完整性和准确性
4. **业务处理** - 判断骑行状态、计算里程
5. **数据存储** - 存储到数据库
6. **实时推送** - 推送给前端APP
7. **积分计算** - 根据规则计算积分

---

## 三、数据库设计

### 3.1 核心表结构

#### 3.1.1 设备表 (devices)

```sql
CREATE TABLE devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(32) UNIQUE NOT NULL, -- 设备唯一ID
    device_type VARCHAR(20) NOT NULL, -- 设备类型: KG12
    sim_number VARCHAR(20), -- SIM卡号
    vehicle_id INT, -- 绑定的车辆ID
    user_id INT, -- 绑定的用户ID
    server_ip VARCHAR(50), -- 服务器地址
    server_port INT, -- 服务器端口
    last_heartbeat DATETIME, -- 最后心跳时间
    status ENUM('active', 'inactive', 'error') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3.1.2 位置数据表 (locations)

```sql
CREATE TABLE locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(32) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL, -- 纬度
    longitude DECIMAL(10, 6) NOT NULL, -- 经度
    altitude DECIMAL(8, 2), -- 海拔
    speed DECIMAL(6, 2), -- 速度(km/h)
    direction DECIMAL(5, 2), -- 方向(度)
    accuracy DECIMAL(6, 2), -- 定位精度(米)
    satellite_count INT, -- 卫星数量
    device_time DATETIME NOT NULL, -- 设备时间
    server_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 服务器时间
    alarm_flags INT, -- 报警标志
    status_flags INT, -- 状态标志
    INDEX idx_device_time (device_id, device_time)
);
```

#### 3.1.3 骑行记录表 (rides)

```sql
CREATE TABLE rides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_id VARCHAR(32) NOT NULL,
    start_time DATETIME NOT NULL, -- 骑行开始时间
    end_time DATETIME, -- 骑行结束时间
    duration_seconds INT, -- 骑行时长(秒)
    distance_km DECIMAL(8, 3) NOT NULL, -- 骑行距离(km)
    avg_speed_kmh DECIMAL(6, 2), -- 平均速度
    max_speed_kmh DECIMAL(6, 2), -- 最高速度
    calories_burned INT, -- 消耗卡路里
    points_earned INT NOT NULL DEFAULT 0, -- 获得积分
    route_data JSON, -- 轨迹数据
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_rides (user_id, start_time)
);
```

#### 3.1.4 轨迹点表 (route_points)

```sql
CREATE TABLE route_points (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ride_id INT NOT NULL,
    sequence INT NOT NULL, -- 轨迹点顺序
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    timestamp DATETIME NOT NULL,
    speed DECIMAL(6, 2),
    altitude DECIMAL(8, 2),
    INDEX idx_ride_sequence (ride_id, sequence)
);
```

#### 3.1.5 积分记录表 (points)

```sql
CREATE TABLE points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ride_id INT, -- 关联的骑行记录
    points_amount INT NOT NULL, -- 积分数量
    point_type ENUM('ride', 'bonus', 'signin', 'task') NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_points (user_id, created_at)
);
```

#### 3.1.6 Redis缓存结构

```redis
# 设备实时状态
device:{device_id}:last_location -> JSON位置数据
device:{device_id}:status -> "online"/"offline"
device:{device_id}:battery -> 电量百分比

# 用户会话
user:{user_id}:current_ride -> 当前骑行ID
user:{user_id}:total_points -> 累计积分

# 实时排行榜
leaderboard:daily -> 每日排行榜
leaderboard:weekly -> 每周排行榜
leaderboard:monthly -> 每月排行榜
```

---

## 四、业务逻辑设计

### 4.1 骑行状态判断算法

#### 骑行开始条件（同时满足）：
1. **速度阈值**：速度 > 5 km/h
2. **持续时长**：持续30秒以上
3. **位置变化**：距离起点 > 50米
4. **设备状态**：ACC状态为开

#### 骑行结束条件（满足其一）：
1. **用户操作**：用户点击"结束骑行"
2. **设备停止**：速度 = 0且持续60秒以上
3. **设备离线**：10分钟无数据
4. **超出范围**：超出电子围栏范围

### 4.2 里程计算算法

```javascript
/**
 * 计算骑行总里程
 * @param {Array} routePoints 轨迹点数组
 * @returns {Number} 总里程(公里)
 */
function calculateTotalDistance(routePoints) {
    let totalDistance = 0;
    
    for (let i = 1; i < routePoints.length; i++) {
        const prevPoint = routePoints[i-1];
        const currentPoint = routePoints[i];
        
        // 使用Haversine公式计算两点间距离
        const distance = haversineDistance(
            prevPoint.latitude, prevPoint.longitude,
            currentPoint.latitude, currentPoint.longitude
        );
        
        totalDistance += distance;
    }
    
    return totalDistance;
}

/**
 * Haversine公式计算球面距离
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径(公里)
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
```

### 4.3 积分计算规则

```javascript
/**
 * 根据骑行距离计算积分
 * @param {Number} distanceKm 骑行距离(公里)
 * @returns {Number} 获得积分
 */
function calculatePointsByDistance(distanceKm) {
    if (distanceKm <= 3) return 10;
    if (distanceKm <= 5) return 30;
    if (distanceKm <= 10) return 50;
    return 100;
}

/**
 * 计算额外奖励积分
 * @param {Object} ride 骑行记录
 * @returns {Number} 额外积分
 */
function calculateBonusPoints(ride) {
    let bonus = 0;
    
    // 首次骑行奖励
    if (isFirstRide(ride.userId)) bonus += 20;
    
    // 连续骑行奖励
    if (hasConsecutiveRides(ride.userId, 3)) bonus += 30;
    
    // 收集礼包奖励
    bonus += calculateGiftPackBonus(ride);
    
    // 环保骑行奖励（无碳排放）
    bonus += 5;
    
    return bonus;
}
```

### 4.4 电子围栏功能

```javascript
/**
 * 检查是否超出电子围栏范围
 * @param {Number} lat 当前纬度
 * @param {Number} lng 当前经度
 * @param {Array} fencePoints 围栏顶点
 * @returns {Boolean} 是否在围栏内
 */
function checkGeoFence(lat, lng, fencePoints) {
    // 使用射线法判断点是否在多边形内
    let inside = false;
    
    for (let i = 0, j = fencePoints.length - 1; i < fencePoints.length; j = i++) {
        const pi = fencePoints[i];
        const pj = fencePoints[j];
        
        if (((pi.lat > lat) != (pj.lat > lat)) &&
            (lng < (pj.lng - pi.lng) * (lat - pi.lat) / (pj.lat - pi.lat) + pi.lng)) {
            inside = !inside;
        }
    }
    
    return inside;
}
```

---

## 五、API接口设计

### 5.1 服务器端API

#### 5.1.1 设备管理API

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 设备注册 | POST | `/api/devices/register` | 新设备注册 |
| 设备鉴权 | POST | `/api/devices/auth` | 设备身份验证 |
| 心跳上报 | POST | `/api/devices/heartbeat` | 心跳保持 |
| 位置上报 | POST | `/api/locations/report` | 位置数据上报 |

#### 5.1.2 骑行管理API

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 开始骑行 | POST | `/api/rides/start` | 开始新的骑行 |
| 结束骑行 | POST | `/api/rides/{id}/end` | 结束骑行 |
| 获取当前骑行 | GET | `/api/rides/current` | 获取当前骑行状态 |
| 获取历史骑行 | GET | `/api/rides/history` | 获取历史骑行记录 |
| 获取轨迹数据 | GET | `/api/rides/{id}/route` | 获取骑行轨迹 |

#### 5.1.3 积分管理API

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 获取积分 | GET | `/api/points/balance` | 获取用户积分余额 |
| 获取积分记录 | GET | `/api/points/history` | 获取积分记录 |
| 积分排行榜 | GET | `/api/points/leaderboard` | 获取排行榜 |

### 5.2 WebSocket接口

#### 5.2.1 连接建立
```javascript
// 建立WebSocket连接
const socket = io('https://api.greenride.com', {
  query: {
    userId: '用户ID',
    token: '认证令牌'
  }
});
```

#### 5.2.2 事件监听
```javascript
// 监听实时位置更新
socket.on('location_update', (data) => {
  console.log('位置更新:', data);
  // 在地图上显示位置
});

// 监听骑行状态变化
socket.on('ride_status', (data) => {
  if (data.status === 'started') {
    // 骑行开始
  } else if (data.status === 'ended') {
    // 骑行结束
  }
});

// 监听积分更新
socket.on('points_update', (data) => {
  console.log('积分更新:', data);
  // 更新UI显示
});
```

---

## 六、APP前端实现

### 6.1 主要页面设计

#### 6.1.1 主页 (HomePage)
- 当前骑行状态显示
- 实时位置地图
- 骑行数据统计
- 开始/结束骑行按钮

#### 6.1.2 骑行页面 (RidePage)
- 全屏地图显示
- 实时速度、距离、时间
- 导航功能
- 紧急求助按钮

#### 6.1.3 历史页面 (HistoryPage)
- 骑行记录列表
- 统计图表
- 轨迹回放功能
- 导出分享功能

#### 6.1.4 积分页面 (PointsPage)
- 积分余额显示
- 积分获取记录
- 排行榜
- 积分兑换商城

#### 6.1.5 设置页面 (SettingsPage)
- 设备管理
- 电子围栏设置
- 消息通知设置
- 账户管理

### 6.2 核心组件设计

#### 6.2.1 地图组件 (MapComponent)
```jsx
import React from 'react';
import MapView, { Polyline, Marker } from 'react-native-maps';

const MapComponent = ({ routePoints, currentLocation, showRoute }) => {
  return (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {showRoute && routePoints.length > 0 && (
        <Polyline
          coordinates={routePoints}
          strokeColor="#00FF00"
          strokeWidth={4}
        />
      )}
      
      <Marker
        coordinate={currentLocation}
        title="当前位置"
        description={`速度: ${currentLocation.speed} km/h`}
      />
    </MapView>
  );
};
```

#### 6.2.2 骑行状态组件 (RideStatusComponent)
```jsx
const RideStatusComponent = ({ status, distance, duration, speed }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {status === 'riding' ? '骑行中' : '等待骑行'}
      </Text>
      
      <View style={styles.statsRow}>
        <StatItem label="距离" value={`${distance} km`} />
        <StatItem label="时间" value={formatDuration(duration)} />
        <StatItem label="速度" value={`${speed} km/h`} />
      </View>
      
      {status === 'waiting' && (
        <Button title="开始骑行" onPress={startRide} />
      )}
      
      {status === 'riding' && (
        <Button title="结束骑行" onPress={endRide} />
      )}
    </View>
  );
};
```

---

## 七、安全与性能优化

### 7.1 安全措施

| 安全层 | 措施 | 说明 |
|--------|------|------|
| 通信安全 | HTTPS/TLS加密 | 所有API请求加密 |
| 数据安全 | 数据加密存储 | 敏感数据加密 |
| 身份认证 | JWT令牌 | 用户和设备认证 |
| 权限控制 | RBAC模型 | 基于角色的访问控制 |
| 输入验证 | 输入过滤和验证 | 防止注入攻击 |

### 7.2 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 数据库优化 | 索引优化 | 查询速度提升 |
| 缓存策略 | Redis缓存 | 减少数据库压力 |
| 数据压缩 | 轨迹数据压缩 | 减少传输数据量 |
| 连接池 | 数据库连接池 | 提高并发处理能力 |
| CDN加速 | 静态资源CDN | 提高访问速度 |

### 7.3 监控与告警

| 监控项 | 告警阈值 | 告警方式 |
|--------|----------|----------|
| 服务器CPU | > 80% | 邮件/短信 |
| 内存使用率 | > 85% | 邮件/短信 |
| 磁盘空间 | < 10% | 邮件/短信 |
| API响应时间 | > 2秒 | 邮件 |
| 设备在线率 | < 95% | 邮件 |

---

## 八、部署方案

### 8.1 服务器架构

```
┌─────────────────┐     ┌─────────────────┐
│  负载均衡器      │ ←── │   客户端访问     │
│  (Nginx)        │     │  (APP/Web)      │
└─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  应用服务器集群   │     │  数据库服务器     │
│  (Node.js)      │ ←─→ │  (MySQL)        │
└─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  WebSocket服务器  │     │   缓存服务器      │
│  (Socket.IO)     │     │  (Redis)        │
└─────────────────┘     └─────────────────┘
```

### 8.2 部署环境

| 环境 | 服务器配置 | 数量 | 用途 |
|------|------------|------|------|
| 开发环境 | 2核4G | 1台 | 开发和测试 |
| 测试环境 | 4核8G | 2台 | 功能测试 |
| 预生产环境 | 8核16G | 2台 | 集成测试 |
| 生产环境 | 16核32G | 4台以上 | 线上服务 |

### 8.3 容器化部署

```dockerfile
# Node.js应用Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
EXPOSE 8080

CMD ["npm", "start"]
```

---

## 九、测试策略

### 9.1 单元测试
- 协议解析模块测试
- 业务逻辑测试
- 数据库操作测试

### 9.2 集成测试
- 设备对接测试
- API接口测试
- WebSocket连接测试

### 9.3 性能测试
- 并发连接测试
- 数据吞吐量测试
- 压力测试

### 9.4 兼容性测试
- 不同设备测试
- 不同网络环境测试
- 不同操作系统测试

---

## 十、运维方案

### 10.1 日常运维

| 任务 | 频率 | 负责人 |
|------|------|--------|
| 系统监控 | 实时 | 运维团队 |
| 日志分析 | 每日 | 运维团队 |
| 数据备份 | 每日 | 自动化脚本 |
| 安全扫描 | 每周 | 安全团队 |

### 10.2 故障处理流程

1. **故障发现** - 监控系统告警
2. **故障确认** - 人工确认故障
3. **影响评估** - 评估影响范围
4. **故障定位** - 定位故障原因
5. **故障修复** - 执行修复操作
6. **恢复验证** - 验证系统恢复
7. **复盘总结** - 总结经验教训

---

## 十一、开发计划

### 第一阶段（1-2周）：基础架构搭建
- 数据接收服务器开发
- JT808协议解析库开发
- 数据库设计和搭建
- 基础API开发

### 第二阶段（2-3周）：核心功能开发
- 骑行状态判断逻辑
- 里程计算算法
- 积分计算规则
- WebSocket实时推送

### 第三阶段（2-3周）：APP前端开发
- 地图组件开发
- 骑行界面开发
- 数据统计展示
- 用户交互设计

### 第四阶段（1-2周）：测试优化
- 单元测试和集成测试
- 性能测试和优化
- 安全测试和加固
- 用户体验测试

---

## 十二、资源需求

### 12.1 人力资源

| 角色 | 人数 | 职责 |
|------|------|------|
| 后端开发 | 2人 | 服务器端开发 |
| 前端开发 | 2人 | APP前端开发 |
| 测试工程师 | 1人 | 测试和验证 |
| 运维工程师 | 1人 | 部署和运维 |
| 产品经理 | 1人 | 产品设计和协调 |

### 12.2 硬件资源

| 资源 | 数量 | 规格 |
|------|------|------|
| 开发服务器 | 1台 | 8核16G |
| 测试服务器 | 2台 | 4核8G |
| 生产服务器 | 4台 | 16核32G |
| GPS测试设备 | 10台 | 博实结KG12 |

### 12.3 软件资源

| 软件 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.x | 后端开发 |
| MySQL | 8.0 | 数据库 |
| Redis | 6.x | 缓存 |
| Docker | 最新版 | 容器化 |
| Git | 最新版 | 版本控制 |

---

**文档版本：** v1.0  
**更新日期：** 2026年3月  
**项目：** 常骑骑骑行积分平台
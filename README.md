# E-Bike Manager

## 项目简介

E-Bike Manager 是一个用于管理多辆家用二轮电瓶车的 iOS 应用。该应用集成了以下核心功能：

- **车辆管理**：添加、编辑、删除车辆，实时监控车辆状态
- **GPS 定位**：实时追踪车辆位置、速度、电量等信息
- **广告管理**：在车辆靠背箱液晶广告屏上集中管理和播放广告内容
- **骑行游戏**：在骑行地图中设置大礼包，骑行者可以收集礼包获得奖励

## 功能特性

### 1. 仪表盘 (Dashboard)
- 查看所有车辆的在线/离线状态
- 实时显示当前车辆的速度、位置、电量
- 广告投放概览
- 礼包收集统计

### 2. 车辆管理 (Bikes)
- 添加新车辆（名称、车牌号、车型、颜色）
- 编辑车辆信息
- 删除车辆
- 查看车辆实时数据
- 选择当前使用车辆

### 3. 骑行地图 (Map)
- 实时 GPS 定位显示所有车辆位置
- 开始/停止骑行模式
- 骑行时自动更新位置和速度
- 地图上显示礼包位置
- 点击礼包可收集

### 4. 广告管理 (Ads)
- 创建自定义广告内容
- 设置广告播放时长和优先级
- 启用/暂停广告投放
- 将广告投放到指定车辆的广告屏
- 广告播放时长和优先级管理

### 5. 骑行游戏 (Game)
- 礼包地图预览
- 手动放置礼包
- 随机放置礼包
- 查看已收集的礼包
- 统计积分和优惠券数量

## 技术栈

- **框架**: React Native 0.74
- **导航**: React Navigation 6
- **地图**: React Native Maps
- **图标**: React Native Vector Icons
- **存储**: Async Storage
- **图表**: React Native Chart Kit
- **手势**: React Native Gesture Handler

## 项目结构

```
EBikeManager/
├── App.js                          # 应用入口
├── index.js                        # React Native 入口
├── package.json                    # 依赖配置
├── babel.config.js                # Babel 配置
├── app.json                       # 应用配置
├── src/
│   ├── context/
│   │   └── BikeContext.js         # 全局状态管理
│   └── screens/
│       ├── DashboardScreen.js     # 仪表盘
│       ├── BikeListScreen.js      # 车辆列表
│       ├── MapScreen.js           # 地图和骑行
│       ├── AdManageScreen.js      # 广告管理
│       └── GameScreen.js          # 骑行游戏
```

## 安装和运行

### 环境要求
- Node.js >= 14
- React Native CLI
- Xcode（iOS 开发）
- Cocoapods

### 安装依赖

```bash
npm install
```

### iOS 配置

```bash
cd ios
pod install
cd ..
```

### 运行应用

```bash
npm start        # 启动 Metro bundler
npm run ios      # 运行 iOS 模拟器
```

## iOS 特定配置

### 权限配置

需要在 `ios/EBikeManager/Info.plist` 中添加以下权限：

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要位置权限来追踪车辆位置</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>需要持续位置权限来实时监控车辆</string>
```

### Maps API Key

需要在 `ios/EBikeManager/AppDelegate.m` 中配置 Google Maps API Key：

```objective-c
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [GMSServices provideAPIKey:@"YOUR_API_KEY"];
  // ...
}
```

## 功能说明

### 车辆管理
- 支持管理多辆电瓶车
- 每辆车包含：名称、车牌号、车型、颜色、状态、电量、GPS 数据
- 实时更新车辆位置和速度（骑行模式下）

### 广告投放
- 支持创建多种类型的广告内容
- 可设置广告播放时长（秒）
- 支持优先级设置（数字越大优先级越高）
- 支持启用/暂停广告投放
- 可将广告投放到指定车辆的靠背箱广告屏

### 礼包系统
- 支持两种礼包类型：
  - **优惠券**：面值 5-50 元不等
  - **积分**：50-200 积分
- 礼包可手动放置或随机放置
- 礼包有有效期（默认 24 小时）
- 骑行到礼包附近可收集

### 骑行模式
- 开启骑行模式后，当前车辆会模拟移动
- 位置每 3 秒更新一次
- 速度随机 5-35 km/h
- 可随时停止骑行模式

## 数据结构

### 车辆对象
```javascript
{
  id: "string",
  name: "string",
  plate: "string",
  model: "string",
  color: "string",
  status: "online|offline",
  lastSeen: "ISO8601",
  battery: number,
  gps: {
    latitude: number,
    longitude: number,
    speed: number,
    heading: number
  },
  screen: {
    id: "string",
    status: "online|offline",
    currentAd: "string|null"
  }
}
```

### 广告对象
```javascript
{
  id: "string",
  title: "string",
  content: "string",
  imageUrl: "string",
  duration: number,
  priority: number,
  active: boolean,
  createdAt: "ISO8601"
}
```

### 礼包对象
```javascript
{
  id: "string",
  type: "coupon|points",
  name: "string",
  value: number,
  latitude: number,
  longitude: number,
  collected: boolean,
  expiresAt: "ISO8601"
}
```

## 开发说明

### 模拟数据
当前应用使用模拟数据来演示功能：
- 3 辆预设车辆（小蓝、小红、小绿）
- 2 条示例广告
- 3 个预设礼包

### 真实数据集成
要连接真实数据，需要：
1. 替换 `BikeContext.js` 中的模拟数据
2. 添加后端 API 调用
3. 实现实时 WebSocket 连接
4. 配置 GPS 传感器数据

## 后续开发建议

1. **后端集成**
   - 实现 RESTful API
   - 添加用户认证
   - 实现实时通信（WebSocket）

2. **数据持久化**
   - 集成 Async Storage
   - 或连接云端数据库（CloudBase、Supabase）

3. **推送通知**
   - 车辆状态变化通知
   - 礼包过期提醒

4. **增强功能**
   - 骑行轨迹记录
   - 数据统计分析
   - 多人竞技模式

## 许可证

MIT License

/**
 * GPS设备数据模拟器 - 用于开发和测试
 * 模拟博实结KG12 GPS设备数据流
 */

class GPSSimulator {
  constructor() {
    this.devices = [];
    this.running = false;
    this.clients = [];
    this.dataInterval = null;
  }

  // 初始化模拟设备
  initDevices(count = 10) {
    for (let i = 1; i <= count; i++) {
      this.devices.push({
        id: `KG12-${1000 + i}`,
        name: `GPS设备${i}`,
        latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
        speed: Math.random() * 30 + 10, // 10-40 km/h
        direction: Math.random() * 360,
        altitude: 50 + Math.random() * 100,
        accuracy: 5 + Math.random() * 10,
        satelliteCount: 8 + Math.floor(Math.random() * 6),
        battery: 80 + Math.random() * 20,
        status: 'online',
        lastUpdate: new Date(),
        vehicleId: `VH-${1000 + i}`,
        userId: i
      });
    }
  }

  // 启动模拟数据流
  start() {
    if (this.running) return;
    
    this.running = true;
    this.dataInterval = setInterval(() => {
      this.updateDevicePositions();
      this.broadcastData();
    }, 1000); // 每秒更新一次
    
    console.log(`GPS模拟器已启动，模拟${this.devices.length}个设备`);
  }

  // 停止模拟
  stop() {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
    this.running = false;
    console.log('GPS模拟器已停止');
  }

  // 更新设备位置
  updateDevicePositions() {
    const now = new Date();
    
    this.devices.forEach(device => {
      // 模拟设备移动
      const moveDistance = device.speed / 3600 * 1; // 1秒内移动的距离（公里）
      const moveLat = (Math.cos(device.direction * Math.PI / 180) * moveDistance) / 111;
      const moveLng = (Math.sin(device.direction * Math.PI / 180) * moveDistance) / (111 * Math.cos(device.latitude * Math.PI / 180));
      
      device.latitude += moveLat;
      device.longitude += moveLng;
      
      // 小幅度随机变化方向
      device.direction += (Math.random() - 0.5) * 10;
      if (device.direction < 0) device.direction += 360;
      if (device.direction >= 360) device.direction -= 360;
      
      // 速度随机变化
      device.speed = Math.max(5, device.speed + (Math.random() - 0.5) * 5);
      
      // 电池消耗
      device.battery = Math.max(10, device.battery - 0.01);
      
      device.lastUpdate = now;
    });
  }

  // 广播数据给所有连接的客户端
  broadcastData() {
    const data = this.devices.map(device => ({
      deviceId: device.id,
      latitude: device.latitude,
      longitude: device.longitude,
      speed: device.speed,
      direction: device.direction,
      altitude: device.altitude,
      accuracy: device.accuracy,
      satelliteCount: device.satelliteCount,
      battery: device.battery,
      timestamp: device.lastUpdate.toISOString(),
      vehicleId: device.vehicleId,
      userId: device.userId
    }));

    this.clients.forEach(client => {
      if (client.callback) {
        client.callback(data);
      }
    });
  }

  // 客户端注册
  registerClient(clientId, callback) {
    this.clients.push({ id: clientId, callback });
    console.log(`客户端 ${clientId} 已连接`);
    
    // 立即发送当前数据
    const currentData = this.devices.map(device => ({
      deviceId: device.id,
      latitude: device.latitude,
      longitude: device.longitude,
      speed: device.speed,
      direction: device.direction,
      altitude: device.altitude,
      accuracy: device.accuracy,
      satelliteCount: device.satelliteCount,
      battery: device.battery,
      timestamp: device.lastUpdate.toISOString(),
      vehicleId: device.vehicleId,
      userId: device.userId
    }));
    
    if (callback) {
      setTimeout(() => callback(currentData), 100);
    }
    
    return clientId;
  }

  // 客户端取消注册
  unregisterClient(clientId) {
    this.clients = this.clients.filter(client => client.id !== clientId);
    console.log(`客户端 ${clientId} 已断开`);
  }

  // 获取设备列表
  getDeviceList() {
    return this.devices.map(device => ({
      id: device.id,
      name: device.name,
      status: device.status,
      battery: device.battery,
      lastUpdate: device.lastUpdate,
      userId: device.userId
    }));
  }

  // 获取单个设备详情
  getDeviceDetail(deviceId) {
    return this.devices.find(device => device.id === deviceId);
  }

  // 模拟JT808协议数据包
  generateJT808Packet(deviceId) {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return null;

    // 简化的JT808协议数据包结构
    const packet = {
      header: {
        msgId: 0x0200, // 位置信息汇报
        msgBodyProps: {
          msgLen: 28,
          encryptionType: 0,
          isSubPackage: false,
          reservedBit: 0
        },
        phone: device.id,
        msgSerialNo: Math.floor(Math.random() * 65536),
        packageTotal: 1,
        packageNo: 1
      },
      body: {
        alarmFlag: 0,
        statusFlag: 0,
        latitude: Math.floor(device.latitude * 1000000),
        longitude: Math.floor(device.longitude * 1000000),
        altitude: Math.floor(device.altitude),
        speed: Math.floor(device.speed * 10),
        direction: Math.floor(device.direction),
        time: this.formatTime(new Date()),
        extraInfo: {
          mileage: Math.floor(Math.random() * 100000),
          fuel: Math.floor(Math.random() * 100),
          speed: device.speed,
          alarm: [],
          status: []
        }
      },
      checkCode: this.calculateCheckCode(device)
    };

    return packet;
  }

  // 格式化时间为JT808格式
  formatTime(date) {
    const year = date.getFullYear() % 100;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    
    return [
      year.toString().padStart(2, '0'),
      month.toString().padStart(2, '0'),
      day.toString().padStart(2, '0'),
      hour.toString().padStart(2, '0'),
      minute.toString().padStart(2, '0'),
      second.toString().padStart(2, '0')
    ].join('');
  }

  // 计算校验码
  calculateCheckCode(device) {
    // 简化的校验码计算
    let sum = 0;
    for (let char of device.id) {
      sum += char.charCodeAt(0);
    }
    sum += Math.floor(device.latitude * 100) + Math.floor(device.longitude * 100);
    return sum % 256;
  }

  // 模拟骑行数据
  generateRideData(userId, deviceId, startTime, endTime) {
    const device = this.devices.find(d => d.id === deviceId && d.userId === userId);
    if (!device) return null;

    const duration = (endTime - startTime) / 1000; // 秒
    const distance = device.speed * duration / 3600; // 公里
    
    return {
      rideId: `RIDE-${Date.now()}`,
      userId: userId,
      deviceId: deviceId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: Math.floor(duration),
      distance: parseFloat(distance.toFixed(2)),
      avgSpeed: device.speed,
      maxSpeed: device.speed * (1 + Math.random() * 0.3),
      calories: Math.floor(distance * 50), // 简化计算
      points: Math.floor(distance * 10), // 每公里10积分
      routeData: this.generateRoutePoints(device, startTime, endTime, 10) // 生成10个轨迹点
    };
  }

  // 生成轨迹点
  generateRoutePoints(device, startTime, endTime, count) {
    const points = [];
    const timeInterval = (endTime - startTime) / count;
    
    for (let i = 0; i < count; i++) {
      const pointTime = startTime + i * timeInterval;
      const progress = i / count;
      
      points.push({
        latitude: device.latitude + Math.sin(progress * Math.PI * 2) * 0.001,
        longitude: device.longitude + Math.cos(progress * Math.PI * 2) * 0.001,
        timestamp: new Date(pointTime).toISOString(),
        speed: device.speed * (0.8 + Math.random() * 0.4),
        altitude: device.altitude,
        accuracy: device.accuracy
      });
    }
    
    return points;
  }
}

// 导出单例实例
const gpsSimulator = new GPSSimulator();
gpsSimulator.initDevices(10);

// WebSocket模拟服务
class WebSocketSimulator {
  constructor() {
    this.clients = new Map();
    this.simulator = gpsSimulator;
  }

  connect(clientId, onMessage) {
    console.log(`WebSocket连接建立: ${clientId}`);
    
    // 注册到GPS模拟器
    const simClientId = this.simulator.registerClient(clientId, (data) => {
      if (onMessage) {
        const message = {
          type: 'location_update',
          data: data.filter(d => d.userId === parseInt(clientId) || clientId === 'admin')
        };
        onMessage(JSON.stringify(message));
      }
    });

    this.clients.set(clientId, {
      simClientId,
      onMessage
    });

    return {
      send: (message) => this.handleMessage(clientId, message),
      close: () => this.disconnect(clientId)
    };
  }

  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          this.send(clientId, { type: 'pong', timestamp: Date.now() });
          break;
        case 'get_device_list':
          const devices = this.simulator.getDeviceList();
          this.send(clientId, { type: 'device_list', data: devices });
          break;
        case 'start_ride':
          this.send(clientId, { 
            type: 'ride_started', 
            data: { rideId: `RIDE-${Date.now()}` }
          });
          break;
        case 'end_ride':
          const rideData = this.simulator.generateRideData(
            data.userId, 
            data.deviceId, 
            data.startTime, 
            Date.now()
          );
          this.send(clientId, { type: 'ride_ended', data: rideData });
          break;
      }
    } catch (error) {
      console.error('WebSocket消息处理错误:', error);
    }
  }

  send(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.onMessage) {
      client.onMessage(JSON.stringify(message));
    }
  }

  disconnect(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      this.simulator.unregisterClient(client.simClientId);
      this.clients.delete(clientId);
      console.log(`WebSocket连接关闭: ${clientId}`);
    }
  }

  broadcast(type, data) {
    const message = JSON.stringify({ type, data });
    this.clients.forEach((client, clientId) => {
      this.send(clientId, { type, data });
    });
  }
}

// 创建WebSocket模拟器实例
const webSocketSimulator = new WebSocketSimulator();

// 导出模块
module.exports = {
  GPSSimulator: gpsSimulator,
  WebSocketSimulator: webSocketSimulator,
  
  // 工具函数
  startSimulation: () => gpsSimulator.start(),
  stopSimulation: () => gpsSimulator.stop(),
  
  // WebSocket接口
  connectWebSocket: (clientId, onMessage) => webSocketSimulator.connect(clientId, onMessage),
  disconnectWebSocket: (clientId) => webSocketSimulator.disconnect(clientId)
};
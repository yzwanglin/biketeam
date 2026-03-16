/**
 * 绿行积分平台 - 后端API服务
 * 提供用户、骑行、积分、商城等数据接口
 */

const API_PORT = 3001;

// 模拟数据库
const db = {
  users: [
    { id: 1, nickname: '环保骑手', phone: '13800138000', points: 1250, totalDistance: 156.5, totalRides: 42, level: 'gold', avatar: '🚴' },
    { id: 2, nickname: '绿色出行', phone: '13900139000', points: 800, totalDistance: 89.2, totalRides: 25, level: 'silver', avatar: '🌿' },
    { id: 3, nickname: '低碳达人', phone: '13700137000', points: 2100, totalDistance: 320.8, totalRides: 78, level: 'platinum', avatar: '🌍' }
  ],
  rides: [],
  products: [
    { id: 1, name: '环保水壶', icon: '🍶', price: 29, points: 580, stock: 50, category: 'goods' },
    { id: 2, name: '运动手套', icon: '🧤', price: 19, points: 380, stock: 100, category: 'goods' },
    { id: 3, name: '骑行背包', icon: '🎒', price: 89, points: 1780, stock: 30, category: 'goods' },
    { id: 4, name: '手机支架', icon: '📱', price: 15, points: 300, stock: 200, category: 'goods' },
    { id: 5, name: '头盔', icon: '⛑️', price: 68, points: 1360, stock: 45, category: 'goods' },
    { id: 6, name: '车锁', icon: '🔒', price: 35, points: 700, stock: 80, category: 'goods' }
  ],
  orders: [],
  devices: []
};

// 初始化骑行记录
function initRides() {
  const now = Date.now();
  for (let i = 0; i < 10; i++) {
    db.rides.push({
      id: i + 1,
      userId: 1,
      deviceId: `KG12-${1000 + (i % 5) + 1}`,
      startTime: new Date(now - (i + 1) * 86400000).toISOString(),
      endTime: new Date(now - (i + 1) * 86400000 + 1800000).toISOString(),
      distance: Math.random() * 15 + 5,
      duration: Math.floor(Math.random() * 3600 + 600),
      avgSpeed: Math.random() * 10 + 12,
      maxSpeed: Math.random() * 20 + 20,
      calories: Math.floor(Math.random() * 300 + 100),
      points: Math.floor(Math.random() * 100 + 50),
      status: 'completed'
    });
  }
}

initRides();

// API响应格式化
function jsonResponse(data, success = true) {
  return {
    success,
    data,
    timestamp: Date.now()
  };
}

// 路由处理
const routes = {
  // 用户接口
  'GET /api/user/:id': (req, res) => {
    const user = db.users.find(u => u.id === parseInt(req.params.id));
    if (user) {
      res.json(jsonResponse(user));
    } else {
      res.status(404).json(jsonResponse({ message: '用户不存在' }, false));
    }
  },

  'POST /api/user/login': (req, res) => {
    const { phone, code } = req.body;
    // 模拟登录（实际应验证验证码）
    let user = db.users.find(u => u.phone === phone);
    if (!user) {
      // 创建新用户
      user = {
        id: db.users.length + 1,
        nickname: `骑行者${db.users.length + 1}`,
        phone,
        points: 0,
        totalDistance: 0,
        totalRides: 0,
        level: 'bronze',
        avatar: '🚴'
      };
      db.users.push(user);
    }
    res.json(jsonResponse({ token: 'mock-token-' + user.id, user }));
  },

  'PUT /api/user/:id': (req, res) => {
    const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex >= 0) {
      db.users[userIndex] = { ...db.users[userIndex], ...req.body };
      res.json(jsonResponse(db.users[userIndex]));
    } else {
      res.status(404).json(jsonResponse({ message: '用户不存在' }, false));
    }
  },

  // 骑行接口
  'GET /api/rides': (req, res) => {
    const userId = parseInt(req.query.userId) || 1;
    const userRides = db.rides.filter(r => r.userId === userId).sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    );
    res.json(jsonResponse(userRides));
  },

  'POST /api/rides': (req, res) => {
    const ride = {
      id: db.rides.length + 1,
      ...req.body,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    db.rides.push(ride);
    
    // 更新用户积分和里程
    const user = db.users.find(u => u.id === ride.userId);
    if (user) {
      user.points += ride.points;
      user.totalDistance += ride.distance;
      user.totalRides += 1;
      user.level = calculateLevel(user.totalDistance);
    }
    
    res.json(jsonResponse(ride));
  },

  'GET /api/rides/:id': (req, res) => {
    const ride = db.rides.find(r => r.id === parseInt(req.params.id));
    if (ride) {
      res.json(jsonResponse(ride));
    } else {
      res.status(404).json(jsonResponse({ message: '骑行记录不存在' }, false));
    }
  },

  // 积分接口
  'GET /api/points/history': (req, res) => {
    const userId = parseInt(req.query.userId) || 1;
    const userRides = db.rides.filter(r => r.userId === userId);
    const history = userRides.map(r => ({
      type: 'ride',
      points: r.points,
      description: `骑行获得 ${r.points} 积分`,
      time: r.endTime
    }));
    res.json(jsonResponse(history));
  },

  'GET /api/points/rules': (req, res) => {
    res.json(jsonResponse([
      { action: '骑行每公里', points: 10, description: '骑行获得积分' },
      { action: '连续骑行7天', points: 100, description: '连续骑行奖励' },
      { action: '单次骑行超过10公里', points: 50, description: '长距离骑行奖励' }
    ]));
  },

  // 商城接口
  'GET /api/products': (req, res) => {
    const { category } = req.query;
    let products = db.products;
    if (category) {
      products = products.filter(p => p.category === category);
    }
    res.json(jsonResponse(products));
  },

  'GET /api/products/:id': (req, res) => {
    const product = db.products.find(p => p.id === parseInt(req.params.id));
    if (product) {
      res.json(jsonResponse(product));
    } else {
      res.status(404).json(jsonResponse({ message: '商品不存在' }, false));
    }
  },

  // 订单接口
  'GET /api/orders': (req, res) => {
    const userId = parseInt(req.query.userId) || 1;
    const userOrders = db.orders.filter(o => o.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(jsonResponse(userOrders));
  },

  'POST /api/orders': (req, res) => {
    const { userId, productId, quantity } = req.body;
    const product = db.products.find(p => p.id === productId);
    const user = db.users.find(u => u.id === userId);
    
    if (!product || !user) {
      return res.status(400).json(jsonResponse({ message: '商品或用户不存在' }, false));
    }
    
    const pointsRequired = product.points * quantity;
    if (user.points < pointsRequired) {
      return res.status(400).json(jsonResponse({ message: '积分不足' }, false));
    }
    
    const order = {
      id: db.orders.length + 1,
      userId,
      productId,
      productName: product.name,
      productIcon: product.icon,
      quantity,
      points: pointsRequired,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    db.orders.push(order);
    user.points -= pointsRequired;
    
    res.json(jsonResponse(order));
  },

  // GPS设备接口
  'GET /api/devices': (req, res) => {
    res.json(jsonResponse([
      { id: 'KG12-1001', name: 'GPS设备1', status: 'online', battery: 85 },
      { id: 'KG12-1002', name: 'GPS设备2', status: 'online', battery: 72 },
      { id: 'KG12-1003', name: 'GPS设备3', status: 'offline', battery: 45 }
    ]));
  },

  'GET /api/devices/:id/location': (req, res) => {
    // 返回模拟GPS位置
    res.json(jsonResponse({
      deviceId: req.params.id,
      latitude: 39.9042 + Math.random() * 0.1,
      longitude: 116.4074 + Math.random() * 0.1,
      speed: Math.random() * 30 + 10,
      direction: Math.random() * 360,
      timestamp: new Date().toISOString()
    }));
  },

  // 统计接口
  'GET /api/stats': (req, res) => {
    const userId = parseInt(req.query.userId) || 1;
    const user = db.users.find(u => u.id === userId);
    const userRides = db.rides.filter(r => r.userId === userId);
    
    const stats = {
      totalPoints: user?.points || 0,
      totalDistance: user?.totalDistance || 0,
      totalRides: user?.totalRides || 0,
      avgSpeed: userRides.length > 0 
        ? userRides.reduce((sum, r) => sum + r.avgSpeed, 0) / userRides.length 
        : 0,
      longestRide: Math.max(...userRides.map(r => r.distance), 0),
      totalCalories: userRides.reduce((sum, r) => sum + r.calories, 0)
    };
    
    res.json(jsonResponse(stats));
  }
};

// 计算用户等级
function calculateLevel(totalDistance) {
  if (totalDistance >= 500) return 'diamond';
  if (totalDistance >= 300) return 'platinum';
  if (totalDistance >= 150) return 'gold';
  if (totalDistance >= 50) return 'silver';
  return 'bronze';
}

// 简单的HTTP服务器（用于开发测试）
const http = require('http');

function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 解析URL
  const url = req.url.split('?')[0];
  const method = req.method;
  const routeKey = `${method} ${url}`;
  
  console.log(`${method} ${url}`);
  
  // 解析JSON body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch (e) {
      req.body = {};
    }
    
    // 查找匹配的路由
    const route = routes[routeKey];
    if (route) {
      route(req, res);
    } else {
      // 尝试模糊匹配
      let matched = false;
      for (const key in routes) {
        const [keyMethod, keyPath] = key.split(' ');
        if (keyMethod === method) {
          const paramMatch = keyPath.match(/\/api\/(\w+)\/(\w+)/);
          if (paramMatch && url.match(new RegExp(`^/api/${paramMatch[1]}/\\w+$`))) {
            req.params = { [paramMatch[2]]: url.split('/').pop() };
            routes[key](req, res);
            matched = true;
            break;
          }
        }
      }
      
      if (!matched) {
        res.status(404).json(jsonResponse({ message: 'API接口不存在' }, false));
      }
    }
  });
}

// 启动服务器
const server = http.createServer(handleRequest);

server.listen(API_PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║     绿行积分平台 - 后端API服务已启动               ║
║     地址: http://localhost:${API_PORT}                    ║
║                                                    ║
║     可用接口:                                      ║
║     - GET  /api/users/:id        获取用户信息     ║
║     - POST /api/user/login       用户登录         ║
║     - GET  /api/rides            获取骑行记录     ║
║     - POST /api/rides            创建骑行记录     ║
║     - GET  /api/products         获取商品列表    ║
║     - POST /api/orders           创建订单         ║
║     - GET  /api/stats            获取统计数据     ║
║     - GET  /api/devices          获取设备列表     ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = { server, db };

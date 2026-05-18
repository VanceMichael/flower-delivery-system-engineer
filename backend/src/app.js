const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const deliveryRouter = require('./routes/delivery');
const greetingCardsRouter = require('./routes/greeting-cards');
const holidayPromotionsRouter = require('./routes/holiday-promotions');
const authRouter = require('./routes/auth');
const cartsRouter = require('./routes/carts');
const seedData = require('./utils/seedData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/greeting-cards', greetingCardsRouter);
app.use('/api/holiday-promotions', holidayPromotionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/carts', cartsRouter);

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '鲜花配送管理系统 API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      delivery: '/api/delivery',
      greetingCards: '/api/greeting-cards',
      holidayPromotions: '/api/holiday-promotions'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedData();
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`API 文档: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

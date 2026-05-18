const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'flower-delivery-secret-key'
    );
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    return res.status(401).json({
      success: false,
      message: '登录已过期，请重新登录'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权限访问'
    });
  }
  next();
};

const deliveryMiddleware = (req, res, next) => {
  if (!['admin', 'delivery'].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: '无权限访问'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  deliveryMiddleware
};

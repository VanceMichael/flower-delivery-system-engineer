const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('phone').notEmpty().withMessage('手机号不能为空')
], AuthController.register);

router.post('/login', AuthController.login);

router.get('/me', authMiddleware, AuthController.getCurrentUser);

router.put('/profile', authMiddleware, AuthController.updateProfile);

router.put('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;

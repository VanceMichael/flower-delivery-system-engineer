const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET || 'flower-delivery-secret-key',
    { expiresIn: '7d' },
  );
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: errors.array(),
      });
    }

    const { username, email, password, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username ? '用户名已存在' : '邮箱已被注册',
      });
    }

    const user = new User({
      username,
      email,
      password,
      phone,
      role: 'customer',
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名和密码',
      });
    }

    console.log('登录尝试:', username);

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      console.log('用户不存在:', username);
      return res.status(400).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    console.log('找到用户:', user.username);
    console.log('密码哈希:', user.password);

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: '账号已被禁用',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('密码验证结果:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.address || [],
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败', error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.address || [],
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: '获取用户信息失败' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
      });
    }

    const { phone, email } = req.body;
    const updateData = {};
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select('-password');

    res.json({
      success: true,
      message: '更新成功',
      data: user,
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: '邮箱已被使用' });
    }
    res.status(500).json({ success: false, message: '更新失败' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
      });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请输入原密码和新密码',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '原密码错误',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ success: false, message: '修改密码失败' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
};

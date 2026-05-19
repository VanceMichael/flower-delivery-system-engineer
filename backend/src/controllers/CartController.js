const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [] });
        await cart.save();
      }

      const itemsWithCartId = cart.items.map((item) => ({
        cartId: item._id.toString(),
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        customOptions: item.customOptions ? Object.fromEntries(item.customOptions) : null,
        selected: true,
      }));

      res.json({
        success: true,
        data: {
          items: itemsWithCartId,
          cartCount: itemsWithCartId.reduce((sum, item) => sum + item.quantity, 0),
          cartTotal: itemsWithCartId.reduce((sum, item) => sum + item.price * item.quantity, 0),
        },
      });
    } catch (error) {
      console.error('获取购物车失败:', error);
      res.status(500).json({ success: false, message: '获取购物车失败' });
    }
  }

  async addToCart(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      const { productId, quantity = 1, customOptions } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: '商品ID不能为空' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: '商品库存不足' });
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const customOptionsStr = JSON.stringify(customOptions || {});
      const existingIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId.toString() &&
          JSON.stringify(item.customOptions ? Object.fromEntries(item.customOptions) : {}) ===
            customOptionsStr,
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        const itemData = {
          _id: new mongoose.Types.ObjectId(),
          productId: product._id,
          productName: product.name,
          image: product.images?.[0] || '',
          price: product.price,
          quantity,
          customOptions: customOptions ? new Map(Object.entries(customOptions)) : undefined,
        };
        cart.items.push(itemData);
      }

      await cart.save();

      const itemsWithCartId = cart.items.map((item) => ({
        cartId: item._id.toString(),
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        customOptions: item.customOptions ? Object.fromEntries(item.customOptions) : null,
      }));

      res.json({
        success: true,
        message: '已添加到购物车',
        data: {
          items: itemsWithCartId,
          cartCount: itemsWithCartId.reduce((sum, item) => sum + item.quantity, 0),
          cartTotal: itemsWithCartId.reduce((sum, item) => sum + item.price * item.quantity, 0),
        },
      });
    } catch (error) {
      console.error('添加到购物车失败:', error);
      res.status(500).json({ success: false, message: '添加到购物车失败' });
    }
  }

  async updateQuantity(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      const { cartId, quantity } = req.body;

      if (!cartId || quantity === undefined) {
        return res.status(400).json({ success: false, message: '参数不完整' });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: '购物车不存在' });
      }

      let existingIndex = cart.items.findIndex(
        (item) => item._id && item._id.toString() === cartId.toString(),
      );

      if (existingIndex === -1) {
        existingIndex = cart.items.findIndex(
          (item) => item.productId && item.productId.toString() === cartId.toString(),
        );
      }

      if (existingIndex === -1) {
        const cartIdStr = cartId.toString();
        if (cartIdStr.includes('-')) {
          const parts = cartIdStr.split('-');
          const productIdPart = parts[parts.length - 1];
          existingIndex = cart.items.findIndex(
            (item) => item.productId && item.productId.toString().includes(productIdPart),
          );
        }
      }

      if (existingIndex === -1) {
        console.log('updateQuantity: Cart ID not found:', cartId);
        console.log(
          'Cart items:',
          cart.items.map((item) => ({
            _id: item._id,
            productId: item.productId,
          })),
        );
        return res.status(404).json({ success: false, message: '购物车商品不存在' });
      }

      if (quantity < 1) {
        cart.items.splice(existingIndex, 1);
      } else {
        const item = cart.items[existingIndex];
        const product = await Product.findById(item.productId);
        if (product && product.stock < quantity) {
          return res.status(400).json({ success: false, message: '商品库存不足' });
        }
        cart.items[existingIndex].quantity = quantity;
      }

      await cart.save();

      const itemsWithCartId = cart.items.map((item, index) => ({
        cartId: item._id
          ? item._id.toString()
          : item.productId
            ? item.productId.toString() + '-' + index
            : index.toString(),
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        customOptions: item.customOptions ? Object.fromEntries(item.customOptions) : null,
      }));

      res.json({
        success: true,
        message: '数量已更新',
        data: {
          items: itemsWithCartId,
          cartCount: itemsWithCartId.reduce((sum, item) => sum + item.quantity, 0),
          cartTotal: itemsWithCartId.reduce((sum, item) => sum + item.price * item.quantity, 0),
        },
      });
    } catch (error) {
      console.error('更新购物车数量失败:', error);
      res.status(500).json({ success: false, message: '更新购物车数量失败' });
    }
  }

  async removeFromCart(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      const { cartId } = req.params;

      if (!cartId) {
        return res.status(400).json({ success: false, message: '参数不完整' });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: '购物车不存在' });
      }

      let existingIndex = cart.items.findIndex(
        (item) => item._id && item._id.toString() === cartId.toString(),
      );

      if (existingIndex === -1) {
        existingIndex = cart.items.findIndex(
          (item) => item.productId && item.productId.toString() === cartId.toString(),
        );
      }

      if (existingIndex === -1) {
        const cartIdStr = cartId.toString();
        if (cartIdStr.includes('-')) {
          const parts = cartIdStr.split('-');
          const productIdPart = parts[parts.length - 1];
          existingIndex = cart.items.findIndex(
            (item) => item.productId && item.productId.toString().includes(productIdPart),
          );
        }
      }

      if (existingIndex === -1) {
        console.log('removeFromCart: Cart ID not found:', cartId);
        console.log(
          'Cart items:',
          cart.items.map((item) => ({
            _id: item._id,
            productId: item.productId,
          })),
        );
        return res.status(404).json({ success: false, message: '购物车商品不存在' });
      }

      cart.items.splice(existingIndex, 1);
      await cart.save();

      const itemsWithCartId = cart.items.map((item, index) => ({
        cartId: item._id
          ? item._id.toString()
          : item.productId
            ? item.productId.toString() + '-' + index
            : index.toString(),
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        customOptions: item.customOptions ? Object.fromEntries(item.customOptions) : null,
      }));

      res.json({
        success: true,
        message: '已从购物车移除',
        data: {
          items: itemsWithCartId,
          cartCount: itemsWithCartId.reduce((sum, item) => sum + item.quantity, 0),
          cartTotal: itemsWithCartId.reduce((sum, item) => sum + item.price * item.quantity, 0),
        },
      });
    } catch (error) {
      console.error('移除购物车商品失败:', error);
      res.status(500).json({ success: false, message: '移除购物车商品失败' });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [] });
      } else {
        cart.items = [];
      }

      await cart.save();

      res.json({
        success: true,
        message: '购物车已清空',
        data: {
          items: [],
          cartCount: 0,
          cartTotal: 0,
        },
      });
    } catch (error) {
      console.error('清空购物车失败:', error);
      res.status(500).json({ success: false, message: '清空购物车失败' });
    }
  }
}

module.exports = new CartController();

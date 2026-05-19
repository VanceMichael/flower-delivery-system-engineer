const Order = require('../models/Order');
const Product = require('../models/Product');
const HolidayPromotion = require('../models/HolidayPromotion');
const GreetingCard = require('../models/GreetingCard');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

class OrderController {
  generateOrderNo() {
    const dateStr = moment().format('YYYYMMDDHHmmss');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FD${dateStr}${random}`;
  }

  async createOrder(req, res) {
    try {
      const mongoose = require('mongoose');

      let userId = req.user?._id || req.user?.id;

      console.log('createOrder - req.user:', JSON.stringify(req.user));
      console.log('createOrder - userId from token:', userId);

      if (!userId && req.body.userId && req.body.userId !== 'guest') {
        if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
          userId = new mongoose.Types.ObjectId(req.body.userId);
        }
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
      }

      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        userId = new mongoose.Types.ObjectId(userId);
      }

      const { items, recipient, delivery, greetingCard, payment, notes, holidayPromotion } =
        req.body;

      console.log('createOrder - req.body:', JSON.stringify(req.body, null, 2));

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: '订单商品不能为空' });
      }

      if (!recipient || !recipient.name || !recipient.phone || !recipient.address) {
        return res.status(400).json({ success: false, message: '请填写完整的收货信息' });
      }

      const validProductTypes = ['flower', 'bouquet', 'gift'];

      const processedItems = await Promise.all(
        items.map(async (item, index) => {
          let product;

          console.log(`createOrder - processing item ${index}:`, JSON.stringify(item));

          try {
            if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
              product = await Product.findById(item.productId);
              console.log(
                `createOrder - found product by id:`,
                product ? product.name : 'not found',
              );
            }
          } catch (e) {
            console.log('ProductId format error:', e.message);
          }

          if (!product && item.productName) {
            product = await Product.findOne({ name: item.productName.trim() });
            console.log(
              `createOrder - found product by name:`,
              product ? product.name : 'not found',
            );
          }

          if (!product) {
            console.log(
              'Product not found, productId:',
              item.productId,
              'productName:',
              item.productName,
            );
            throw new Error(`商品不存在: ${item.productName || item.productId}`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`商品库存不足: ${product.name}`);
          }

          if (product.type && !validProductTypes.includes(product.type)) {
            console.log(`Product type '${product.type}' is not valid, defaulting to 'flower'`);
            product.type = 'flower';
          }

          let customOptionsData = undefined;
          let customOptionsPrice = 0;

          if (item.customOptions) {
            const keys = Object.keys(item.customOptions);
            if (keys.length > 0) {
              customOptionsData = new Map();
              keys.forEach((key) => {
                const optionValue = item.customOptions[key];
                if (typeof optionValue === 'object' && optionValue !== null) {
                  customOptionsData.set(key, String(optionValue.value || optionValue));
                  customOptionsPrice += Number(optionValue.price) || 0;
                } else {
                  customOptionsData.set(key, String(optionValue));
                }
              });
            }
          }

          const finalPrice = product.price + customOptionsPrice;

          const itemData = {
            productId: product._id,
            productName: product.name,
            productType: product.type || 'flower',
            image: product.images?.[0] || '',
            price: product.price,
            customOptionsPrice,
            finalPrice,
            quantity: item.quantity,
            customOptions: customOptionsData,
          };

          console.log(`createOrder - processed item ${index}:`, JSON.stringify(itemData));
          return itemData;
        }),
      );

      console.log('createOrder - processedItems:', JSON.stringify(processedItems));

      let totalAmount = processedItems.reduce(
        (sum, item) => sum + item.finalPrice * item.quantity,
        0,
      );
      let discountAmount = 0;
      let finalAmount = totalAmount;

      console.log('createOrder - totalAmount:', totalAmount);

      if (holidayPromotion && holidayPromotion.holidayId) {
        const promotion = await HolidayPromotion.findById(holidayPromotion.holidayId);
        if (promotion && promotion.status === 'active') {
          const now = new Date();
          if (now > promotion.startDate && now < promotion.endDate) {
            if (promotion.discountType === 'percentage') {
              discountAmount = totalAmount * (promotion.discountValue / 100);
            } else if (promotion.discountType === 'fixed') {
              discountAmount = promotion.discountValue;
            }
            finalAmount = Math.max(0, totalAmount - discountAmount);
          }
        }
      }

      const deliveryFee = delivery?.deliveryFee || 0;
      finalAmount += deliveryFee;

      let greetingCardData = null;
      let greetingCardPrice = 0;
      if (greetingCard) {
        const hasValidContent =
          (greetingCard.message && greetingCard.message.trim()) ||
          (greetingCard.recipientName && greetingCard.recipientName.trim()) ||
          greetingCard.templateId;
        if (hasValidContent) {
          if (greetingCard.templateId) {
            try {
              const card = await GreetingCard.findById(greetingCard.templateId);
              if (card) {
                greetingCardPrice = card.price || 0;
              }
            } catch (e) {
              console.error('获取贺卡价格失败:', e);
            }
          }

          greetingCardData = {
            templateId: greetingCard.templateId,
            message: greetingCard.message?.trim() || '',
            recipientName: greetingCard.recipientName?.trim() || '',
            price: greetingCardPrice,
          };

          finalAmount += greetingCardPrice;
          totalAmount += greetingCardPrice;
        }
      }

      const scheduledTimeSlot = delivery?.scheduledTimeSlot || undefined;

      const orderData = {
        orderNo: this.generateOrderNo(),
        userId,
        items: processedItems,
        totalAmount,
        discountAmount,
        finalAmount,
        recipient: {
          name: recipient.name,
          phone: recipient.phone,
          address: recipient.address,
          province: recipient.province,
          city: recipient.city,
          district: recipient.district,
        },
        delivery: {
          type: delivery?.type || 'standard',
          scheduledDate: delivery?.scheduledDate || undefined,
          scheduledTimeSlot,
          deliveryFee,
          status: 'pending',
        },
        greetingCard: greetingCardData,
        payment: {
          method: payment?.method || 'wechat',
          status: 'pending',
        },
        status: 'pending_payment',
        notes,
        holidayPromotion: holidayPromotion
          ? {
              holidayId: holidayPromotion.holidayId,
              discount: discountAmount,
            }
          : null,
      };

      console.log('createOrder - orderData:', JSON.stringify(orderData, null, 2));

      const order = new Order(orderData);

      try {
        await order.save();
        console.log('createOrder - order saved successfully, orderNo:', order.orderNo);
      } catch (saveError) {
        console.error('createOrder - save error:', saveError);
        console.error('createOrder - save error message:', saveError.message);
        if (saveError.errors) {
          console.error(
            'createOrder - validation errors:',
            JSON.stringify(saveError.errors, null, 2),
          );
          for (const field in saveError.errors) {
            console.error(`createOrder - field ${field} error:`, saveError.errors[field].message);
          }
        }
        throw saveError;
      }

      res.status(201).json({
        success: true,
        message: '订单创建成功',
        data: {
          orderNo: order.orderNo,
          orderId: order._id,
          finalAmount: order.finalAmount,
        },
      });
    } catch (error) {
      console.error('创建订单失败:', error);
      console.error('创建订单失败 - error.message:', error.message);
      console.error('创建订单失败 - error.name:', error.name);

      if (error.message.includes('不存在') || error.message.includes('库存')) {
        return res.status(400).json({ success: false, message: error.message });
      }

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors)
          .map((e) => e.message)
          .join(', ');
        return res.status(400).json({ success: false, message: `数据验证失败: ${errors}` });
      }

      res.status(500).json({ success: false, message: `创建订单失败: ${error.message}` });
    }
  }

  async getOrders(req, res) {
    try {
      const { userId, status, page = 1, limit = 20 } = req.query;

      const query = {};
      if (userId) {
        query.userId = userId;
      }
      if (status) {
        query.status = status;
      }

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('items.productId', 'name images');

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('获取订单列表失败:', error);
      res.status(500).json({ success: false, message: '获取订单列表失败' });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('items.productId', 'name images type')
        .populate('greetingCard.templateId', 'name image')
        .populate('holidayPromotion.holidayId', 'name discountType discountValue')
        .populate('delivery.deliveryPersonId', 'name phone');

      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      res.json({ success: true, data: order });
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({ success: false, message: '获取订单详情失败' });
    }
  }

  async getOrderByOrderNo(req, res) {
    try {
      const { orderNo } = req.params;
      const order = await Order.findOne({ orderNo })
        .populate('items.productId', 'name images type')
        .populate('greetingCard.templateId', 'name image')
        .populate('delivery.deliveryPersonId', 'name phone');

      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      res.json({ success: true, data: order });
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({ success: false, message: '获取订单详情失败' });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, cancelReason } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      const validTransitions = {
        pending_payment: ['pending_confirmation', 'cancelled'],
        pending_confirmation: ['preparing', 'cancelled'],
        preparing: ['shipping'],
        shipping: ['delivered'],
        delivered: [],
        cancelled: [],
        completed: [],
        refunded: [],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).json({ success: false, message: '无效的订单状态转换' });
      }

      order.status = status;
      if (cancelReason) {
        order.cancelReason = cancelReason;
      }

      if (status === 'preparing') {
        order.delivery.status = 'pending';
      } else if (status === 'shipping') {
        order.delivery.status = 'delivering';
      } else if (status === 'delivered' || status === 'completed') {
        order.delivery.status = 'delivered';
        order.delivery.actualDeliveryTime = new Date();
      }

      await order.save();

      res.json({ success: true, message: '订单状态更新成功', data: order });
    } catch (error) {
      console.error('更新订单状态失败:', error);
      res.status(500).json({ success: false, message: '更新订单状态失败' });
    }
  }

  async payOrder(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod, transactionId } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      if (order.payment.status === 'paid') {
        return res.status(400).json({ success: false, message: '订单已支付' });
      }

      order.payment = {
        method: paymentMethod || 'wechat',
        status: 'paid',
        transactionId: transactionId || uuidv4(),
        paidAt: new Date(),
      };
      order.status = 'pending_confirmation';

      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { salesCount: item.quantity, stock: -item.quantity },
        });
      }

      res.json({ success: true, message: '支付成功', data: order });
    } catch (error) {
      console.error('支付订单失败:', error);
      res.status(500).json({ success: false, message: '支付失败' });
    }
  }

  async getOrderStatistics(req, res) {
    try {
      const { startDate, endDate, type: _type } = req.query;

      const query = {};
      if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const orders = await Order.find(query);

      const stats = {
        total: orders.length,
        totalAmount: orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0),
        byStatus: {},
        byPaymentMethod: {},
      };

      orders.forEach((order) => {
        stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
        stats.byPaymentMethod[order.payment.method] =
          (stats.byPaymentMethod[order.payment.method] || 0) + 1;
      });

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('获取订单统计失败:', error);
      res.status(500).json({ success: false, message: '获取订单统计失败' });
    }
  }
}

module.exports = new OrderController();

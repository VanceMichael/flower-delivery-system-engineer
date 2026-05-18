const DeliveryPerson = require('../models/DeliveryPerson');
const Order = require('../models/Order');
const RoutePlannerService = require('../services/RoutePlannerService');

class DeliveryController {
  async getAllDeliveryPersons(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (status) query.status = status;
      query.isActive = true;

      const total = await DeliveryPerson.countDocuments(query);
      const deliveryPersons = await DeliveryPerson.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          deliveryPersons,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取配送员列表失败:', error);
      res.status(500).json({ success: false, message: '获取配送员列表失败' });
    }
  }

  async createDeliveryPerson(req, res) {
    try {
      const { name, phone, employeeNo, deliveryArea } = req.body;

      const deliveryPerson = new DeliveryPerson({
        name,
        phone,
        employeeNo,
        deliveryArea,
        status: 'available',
        totalDeliveries: 0,
        rating: 5.0
      });

      await deliveryPerson.save();

      res.status(201).json({
        success: true,
        message: '配送员创建成功',
        data: deliveryPerson
      });
    } catch (error) {
      console.error('创建配送员失败:', error);
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: '手机号或工号已存在' });
      }
      res.status(500).json({ success: false, message: '创建配送员失败' });
    }
  }

  async updateDeliveryPerson(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!deliveryPerson) {
        return res.status(404).json({ success: false, message: '配送员不存在' });
      }

      res.json({
        success: true,
        message: '配送员更新成功',
        data: deliveryPerson
      });
    } catch (error) {
      console.error('更新配送员失败:', error);
      res.status(500).json({ success: false, message: '更新配送员失败' });
    }
  }

  async assignDeliveryPerson(req, res) {
    try {
      const { orderId, deliveryPersonId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      if (order.delivery.status === 'delivered') {
        return res.status(400).json({ success: false, message: '订单已送达，无法重新分配' });
      }

      const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
      if (!deliveryPerson) {
        return res.status(404).json({ success: false, message: '配送员不存在' });
      }

      if (deliveryPerson.status === 'unavailable') {
        return res.status(400).json({ success: false, message: '该配送员当前不在线' });
      }

      order.delivery.deliveryPersonId = deliveryPersonId;
      order.delivery.status = 'assigned';
      order.status = 'shipping';

      deliveryPerson.status = 'on_delivery';

      await order.save();
      await deliveryPerson.save();

      res.json({
        success: true,
        message: '配送员分配成功',
        data: {
          orderId: order._id,
          deliveryPersonId: deliveryPerson._id,
          deliveryPersonName: deliveryPerson.name
        }
      });
    } catch (error) {
      console.error('分配配送员失败:', error);
      res.status(500).json({ success: false, message: '分配配送员失败' });
    }
  }

  async getPendingDeliveries(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const query = {
        'delivery.status': { $in: ['pending', 'assigned'] },
        status: { $in: ['shipping', 'preparing', 'pending_confirmation'] }
      };

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('items.productId', 'name images')
        .populate('delivery.deliveryPersonId', 'name phone');

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取待配送订单失败:', error);
      res.status(500).json({ success: false, message: '获取待配送订单失败' });
    }
  }

  async confirmDelivery(req, res) {
    try {
      const { orderId, signature } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: '订单不存在' });
      }

      if (order.delivery.status === 'delivered') {
        return res.status(400).json({ success: false, message: '订单已签收' });
      }

      order.delivery.status = 'delivered';
      order.delivery.actualDeliveryTime = new Date();
      order.status = 'delivered';

      if (order.delivery.deliveryPersonId) {
        await DeliveryPerson.findByIdAndUpdate(
          order.delivery.deliveryPersonId,
          {
            $inc: { totalDeliveries: 1 },
            status: 'available'
          }
        );
      }

      await order.save();

      res.json({
        success: true,
        message: '配送签收确认成功',
        data: order
      });
    } catch (error) {
      console.error('确认签收失败:', error);
      res.status(500).json({ success: false, message: '确认签收失败' });
    }
  }

  async optimizeDeliveryRoute(req, res) {
    try {
      const { orderIds, currentLocation } = req.body;

      if (!orderIds || orderIds.length === 0) {
        return res.status(400).json({ success: false, message: '请提供订单ID列表' });
      }

      const orders = await Order.find({ _id: { $in: orderIds } })
        .populate('items.productId', 'name');

      if (orders.length === 0) {
        return res.status(404).json({ success: false, message: '未找到订单' });
      }

      const deliveryPoints = orders.map(order => ({
        orderId: order._id,
        orderNo: order.orderNo,
        address: order.recipient?.address,
        latitude: order.recipient?.latitude,
        longitude: order.recipient?.longitude,
        recipient: order.recipient
      }));

      const optimizedRoute = RoutePlannerService.optimizeRoute(
        deliveryPoints,
        currentLocation
      );

      const routeSummary = RoutePlannerService.generateRouteSummary(optimizedRoute);

      res.json({
        success: true,
        data: {
          route: optimizedRoute,
          summary: routeSummary
        }
      });
    } catch (error) {
      console.error('优化配送路线失败:', error);
      res.status(500).json({ success: false, message: '优化配送路线失败' });
    }
  }

  async batchAssignOrders(req, res) {
    try {
      const { orderIds } = req.body;

      if (!orderIds || orderIds.length === 0) {
        return res.status(400).json({ success: false, message: '请提供订单ID列表' });
      }

      const orders = await Order.find({ _id: { $in: orderIds } })
        .populate('items.productId', 'name');

      const availableDeliveryPersons = await DeliveryPerson.find({
        status: 'available',
        isActive: true
      });

      if (availableDeliveryPersons.length === 0) {
        return res.status(400).json({ success: false, message: '没有可用的配送员' });
      }

      const assignmentResult = RoutePlannerService.batchAssignOrders(
        orders,
        availableDeliveryPersons
      );

      for (const assignment of assignmentResult.assignments) {
        await Order.findByIdAndUpdate(
          assignment.orderId,
          {
            'delivery.deliveryPersonId': assignment.deliveryPersonId,
            'delivery.status': 'assigned',
            status: 'shipping'
          }
        );

        await DeliveryPerson.findByIdAndUpdate(
          assignment.deliveryPersonId,
          { status: 'on_delivery' }
        );
      }

      res.json({
        success: true,
        message: `成功分配 ${assignmentResult.stats.assigned} 个订单`,
        data: assignmentResult
      });
    } catch (error) {
      console.error('批量分配订单失败:', error);
      res.status(500).json({ success: false, message: '批量分配订单失败' });
    }
  }

  async updateDeliveryPersonLocation(req, res) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(
        id,
        {
          $set: {
            'currentLocation.latitude': latitude,
            'currentLocation.longitude': longitude,
            'currentLocation.updatedAt': new Date()
          }
        },
        { new: true }
      );

      if (!deliveryPerson) {
        return res.status(404).json({ success: false, message: '配送员不存在' });
      }

      res.json({
        success: true,
        message: '位置更新成功',
        data: deliveryPerson.currentLocation
      });
    } catch (error) {
      console.error('更新配送员位置失败:', error);
      res.status(500).json({ success: false, message: '更新配送员位置失败' });
    }
  }
}

module.exports = new DeliveryController();

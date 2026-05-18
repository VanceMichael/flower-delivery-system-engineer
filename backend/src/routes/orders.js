const express = require('express');
const OrderController = require('../controllers/OrderController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', OrderController.getOrders.bind(OrderController));
router.get('/statistics', OrderController.getOrderStatistics.bind(OrderController));
router.get('/:id', OrderController.getOrderById.bind(OrderController));
router.get('/orderNo/:orderNo', OrderController.getOrderByOrderNo.bind(OrderController));
router.post('/', OrderController.createOrder.bind(OrderController));
router.put('/:id/status', OrderController.updateOrderStatus.bind(OrderController));
router.post('/:id/pay', OrderController.payOrder.bind(OrderController));

module.exports = router;

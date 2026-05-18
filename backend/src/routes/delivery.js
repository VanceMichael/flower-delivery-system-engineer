const express = require('express');
const DeliveryController = require('../controllers/DeliveryController');

const router = express.Router();

router.get('/persons', DeliveryController.getAllDeliveryPersons);
router.post('/persons', DeliveryController.createDeliveryPerson);
router.put('/persons/:id', DeliveryController.updateDeliveryPerson);
router.put('/persons/:id/location', DeliveryController.updateDeliveryPersonLocation);
router.get('/pending', DeliveryController.getPendingDeliveries);
router.post('/assign', DeliveryController.assignDeliveryPerson);
router.post('/batch-assign', DeliveryController.batchAssignOrders);
router.post('/confirm', DeliveryController.confirmDelivery);
router.post('/optimize-route', DeliveryController.optimizeDeliveryRoute);

module.exports = router;

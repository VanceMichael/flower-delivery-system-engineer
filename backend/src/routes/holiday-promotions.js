const express = require('express');
const HolidayPromotionController = require('../controllers/HolidayPromotionController');

const router = express.Router();

router.get('/', HolidayPromotionController.getAllPromotions);
router.get('/active', HolidayPromotionController.getActivePromotions);
router.get('/upcoming', HolidayPromotionController.getUpcomingPromotions);
router.get('/:id', HolidayPromotionController.getPromotionById);
router.get('/:id/products', HolidayPromotionController.getPromotionProducts);
router.post('/', HolidayPromotionController.createPromotion);
router.put('/:id', HolidayPromotionController.updatePromotion);
router.delete('/:id', HolidayPromotionController.deletePromotion);
router.post('/:id/publish', HolidayPromotionController.publishPromotion);
router.post('/:id/cancel', HolidayPromotionController.cancelPromotion);

module.exports = router;

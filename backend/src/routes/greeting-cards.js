const express = require('express');
const GreetingCardController = require('../controllers/GreetingCardController');

const router = express.Router();

router.get('/', GreetingCardController.getAllCards);
router.get('/premium', GreetingCardController.getPremiumCards);
router.get('/category/:category', GreetingCardController.getCardsByCategory);
router.get('/holiday/:holiday', GreetingCardController.getHolidayCards);
router.get('/:id', GreetingCardController.getCardById);
router.post('/', GreetingCardController.createCard);
router.put('/:id', GreetingCardController.updateCard);
router.delete('/:id', GreetingCardController.deleteCard);

module.exports = router;

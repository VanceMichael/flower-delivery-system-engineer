const express = require('express');
const CartController = require('../controllers/CartController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', CartController.getCart.bind(CartController));
router.post('/add', CartController.addToCart.bind(CartController));
router.put('/quantity', CartController.updateQuantity.bind(CartController));
router.delete('/:cartId', CartController.removeFromCart.bind(CartController));
router.post('/clear', CartController.clearCart.bind(CartController));

module.exports = router;

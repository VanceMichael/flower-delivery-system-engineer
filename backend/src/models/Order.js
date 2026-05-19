const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      enum: ['flower', 'bouquet', 'gift'],
    },
    image: String,
    price: {
      type: Number,
      required: true,
    },
    customOptionsPrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    customOptions: {
      type: Map,
      of: String,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    recipient: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      province: String,
      city: String,
      district: String,
      address: { type: String, required: true },
      latitude: Number,
      longitude: Number,
    },
    delivery: {
      type: {
        type: String,
        enum: ['standard', 'express', 'scheduled'],
        default: 'standard',
      },
      scheduledDate: Date,
      scheduledTimeSlot: String,
      deliveryFee: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['pending', 'assigned', 'picking', 'delivering', 'delivered', 'failed', 'returned'],
        default: 'pending',
      },
      deliveryPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPerson',
      },
      estimatedArrivalTime: Date,
      actualDeliveryTime: Date,
    },
    greetingCard: {
      templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GreetingCard',
      },
      message: String,
      recipientName: String,
      price: {
        type: Number,
        default: 0,
      },
    },
    payment: {
      method: {
        type: String,
        enum: ['wechat', 'alipay', 'card'],
        default: 'wechat',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'pending_confirmation',
        'preparing',
        'shipping',
        'delivered',
        'completed',
        'cancelled',
        'refunded',
      ],
      default: 'pending_payment',
    },
    notes: String,
    cancelReason: String,
    holidayPromotion: {
      holidayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HolidayPromotion',
      },
      discount: Number,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNo: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

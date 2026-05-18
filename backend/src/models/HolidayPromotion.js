const mongoose = require('mongoose');

const holidayPromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  holiday: {
    type: String,
    required: true,
    enum: ['valentines', 'mothers', 'fathers', 'chinese_valentines', 'christmas', 'new_year', 'spring_festival', 'mid_autumn', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_delivery'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String
  }],
  bannerImage: String,
  featuredProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'cancelled'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

holidayPromotionSchema.index({ holiday: 1, status: 1 });
holidayPromotionSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('HolidayPromotion', holidayPromotionSchema);

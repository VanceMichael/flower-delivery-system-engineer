const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    employeeNo: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ['available', 'on_delivery', 'offline'],
      default: 'available',
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    deliveryArea: [
      {
        district: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('DeliveryPerson', deliveryPersonSchema);

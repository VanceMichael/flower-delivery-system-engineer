const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['flower', 'bouquet', 'gift'],
      required: true,
    },
    category: {
      type: String,
      default: 'default',
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    materials: [
      {
        name: String,
        quantity: String,
      },
    ],
    customConfig: {
      isCustomizable: { type: Boolean, default: false },
      options: [
        {
          name: String,
          choices: [
            {
              value: String,
              price: Number,
            },
          ],
        },
      ],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ type: 1, status: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);

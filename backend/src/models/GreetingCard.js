const mongoose = require('mongoose');

const greetingCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['birthday', 'love', 'thanks', 'congratulation', 'festival', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      default: 'default',
    },
    defaultMessages: [
      {
        title: String,
        content: String,
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    holidayTags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('GreetingCard', greetingCardSchema);

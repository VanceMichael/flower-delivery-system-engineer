const HolidayPromotion = require('../models/HolidayPromotion');
const Product = require('../models/Product');

class HolidayPromotionController {
  async getAllPromotions(req, res) {
    try {
      const { holiday, status, isFeatured, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (holiday) query.holiday = holiday;
      if (status) query.status = status;
      if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

      const total = await HolidayPromotion.countDocuments(query);
      const promotions = await HolidayPromotion.find(query)
        .sort({ sortOrder: 1, startDate: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('featuredProducts', 'name images price');

      res.json({
        success: true,
        data: {
          promotions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取营销活动列表失败:', error);
      res.status(500).json({ success: false, message: '获取营销活动列表失败' });
    }
  }

  async getActivePromotions(req, res) {
    try {
      const now = new Date();
      const promotions = await HolidayPromotion.find({
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
        .sort({ sortOrder: 1 })
        .populate('featuredProducts', 'name images price originalPrice');

      res.json({ success: true, data: promotions });
    } catch (error) {
      console.error('获取活跃营销活动失败:', error);
      res.status(500).json({ success: false, message: '获取活跃营销活动失败' });
    }
  }

  async getPromotionById(req, res) {
    try {
      const { id } = req.params;
      const promotion = await HolidayPromotion.findById(id)
        .populate('applicableProducts', 'name images price')
        .populate('featuredProducts', 'name images price originalPrice');

      if (!promotion) {
        return res.status(404).json({ success: false, message: '营销活动不存在' });
      }

      res.json({ success: true, data: promotion });
    } catch (error) {
      console.error('获取营销活动详情失败:', error);
      res.status(500).json({ success: false, message: '获取营销活动详情失败' });
    }
  }

  async createPromotion(req, res) {
    try {
      const {
        name,
        holiday,
        description,
        startDate,
        endDate,
        discountType,
        discountValue,
        minPurchase,
        applicableProducts,
        applicableCategories,
        bannerImage,
        featuredProducts,
        isFeatured,
        sortOrder
      } = req.body;

      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ success: false, message: '开始日期必须早于结束日期' });
      }

      const promotion = new HolidayPromotion({
        name,
        holiday,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discountType,
        discountValue,
        minPurchase: minPurchase || 0,
        applicableProducts,
        applicableCategories,
        bannerImage,
        featuredProducts,
        status: 'draft',
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0
      });

      await promotion.save();

      res.status(201).json({
        success: true,
        message: '营销活动创建成功',
        data: promotion
      });
    } catch (error) {
      console.error('创建营销活动失败:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
      }
      res.status(500).json({ success: false, message: '创建营销活动失败' });
    }
  }

  async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.startDate && updateData.endDate) {
        if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
          return res.status(400).json({ success: false, message: '开始日期必须早于结束日期' });
        }
      }

      const promotion = await HolidayPromotion.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!promotion) {
        return res.status(404).json({ success: false, message: '营销活动不存在' });
      }

      res.json({
        success: true,
        message: '营销活动更新成功',
        data: promotion
      });
    } catch (error) {
      console.error('更新营销活动失败:', error);
      res.status(500).json({ success: false, message: '更新营销活动失败' });
    }
  }

  async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotion = await HolidayPromotion.findByIdAndDelete(id);

      if (!promotion) {
        return res.status(404).json({ success: false, message: '营销活动不存在' });
      }

      res.json({ success: true, message: '营销活动删除成功' });
    } catch (error) {
      console.error('删除营销活动失败:', error);
      res.status(500).json({ success: false, message: '删除营销活动失败' });
    }
  }

  async publishPromotion(req, res) {
    try {
      const { id } = req.params;

      const promotion = await HolidayPromotion.findById(id);
      if (!promotion) {
        return res.status(404).json({ success: false, message: '营销活动不存在' });
      }

      if (promotion.status === 'active') {
        return res.status(400).json({ success: false, message: '活动已发布' });
      }

      promotion.status = 'active';
      await promotion.save();

      res.json({
        success: true,
        message: '营销活动发布成功',
        data: promotion
      });
    } catch (error) {
      console.error('发布营销活动失败:', error);
      res.status(500).json({ success: false, message: '发布营销活动失败' });
    }
  }

  async cancelPromotion(req, res) {
    try {
      const { id } = req.params;

      const promotion = await HolidayPromotion.findById(id);
      if (!promotion) {
        return res.status(404).json({ success: false, message: '营销活动不存在' });
      }

      promotion.status = 'cancelled';
      await promotion.save();

      res.json({
        success: true,
        message: '营销活动已取消',
        data: promotion
      });
    } catch (error) {
      console.error('取消营销活动失败:', error);
      res.status(500).json({ success: false, message: '取消营销活动失败' });
    }
  }

  async getPromotionProducts(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const promotion = await HolidayPromotion.findById(id);
      if (!promotion) {
        return res.status(404).json({ success: false, message: '营销活动不存在' });
      }

      let productsQuery = { status: 'active' };

      if (promotion.applicableProducts && promotion.applicableProducts.length > 0) {
        productsQuery._id = { $in: promotion.applicableProducts };
      } else if (promotion.applicableCategories && promotion.applicableCategories.length > 0) {
        productsQuery.category = { $in: promotion.applicableCategories };
      }

      const total = await Product.countDocuments(productsQuery);
      const products = await Product.find(productsQuery)
        .sort({ sortOrder: 1, salesCount: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const productsWithDiscount = products.map(product => {
        let discountedPrice = product.price;
        
        if (promotion.discountType === 'percentage') {
          discountedPrice = product.price * (1 - promotion.discountValue / 100);
        } else if (promotion.discountType === 'fixed') {
          discountedPrice = Math.max(0, product.price - promotion.discountValue);
        }

        return {
          ...product.toObject(),
          discount: {
            type: promotion.discountType,
            value: promotion.discountValue,
            discountedPrice: Number(discountedPrice.toFixed(2))
          }
        };
      });

      res.json({
        success: true,
        data: {
          products: productsWithDiscount,
          promotion: {
            name: promotion.name,
            holiday: promotion.holiday,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            minPurchase: promotion.minPurchase
          },
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取活动商品失败:', error);
      res.status(500).json({ success: false, message: '获取活动商品失败' });
    }
  }

  async getUpcomingPromotions(req, res) {
    try {
      const now = new Date();
      const promotions = await HolidayPromotion.find({
        status: 'active',
        startDate: { $gt: now }
      })
        .sort({ startDate: 1 })
        .limit(10)
        .populate('featuredProducts', 'name images');

      res.json({ success: true, data: promotions });
    } catch (error) {
      console.error('获取即将到来的营销活动失败:', error);
      res.status(500).json({ success: false, message: '获取即将到来的营销活动失败' });
    }
  }
}

module.exports = new HolidayPromotionController();

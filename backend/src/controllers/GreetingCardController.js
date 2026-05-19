const GreetingCard = require('../models/GreetingCard');

class GreetingCardController {
  async getAllCards(req, res) {
    try {
      const { category, status, isPremium, holidayTag, page = 1, limit = 20 } = req.query;

      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (isPremium !== undefined) query.isPremium = isPremium === 'true';
      if (holidayTag) query.holidayTags = { $in: [holidayTag] };

      const total = await GreetingCard.countDocuments(query);
      const cards = await GreetingCard.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          cards,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('获取贺卡列表失败:', error);
      res.status(500).json({ success: false, message: '获取贺卡列表失败' });
    }
  }

  async getCardById(req, res) {
    try {
      const { id } = req.params;
      const card = await GreetingCard.findById(id);

      if (!card) {
        return res.status(404).json({ success: false, message: '贺卡不存在' });
      }

      res.json({ success: true, data: card });
    } catch (error) {
      console.error('获取贺卡详情失败:', error);
      res.status(500).json({ success: false, message: '获取贺卡详情失败' });
    }
  }

  async createCard(req, res) {
    try {
      const {
        name,
        category,
        description,
        image,
        theme,
        defaultMessages,
        isPremium,
        price,
        status,
        sortOrder,
        holidayTags,
      } = req.body;

      const card = new GreetingCard({
        name,
        category,
        description,
        image,
        theme,
        defaultMessages,
        isPremium,
        price: isPremium ? price : 0,
        status: status || 'active',
        sortOrder,
        holidayTags,
      });

      await card.save();

      res.status(201).json({
        success: true,
        message: '贺卡创建成功',
        data: card,
      });
    } catch (error) {
      console.error('创建贺卡失败:', error);
      res.status(500).json({ success: false, message: '创建贺卡失败' });
    }
  }

  async updateCard(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const card = await GreetingCard.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!card) {
        return res.status(404).json({ success: false, message: '贺卡不存在' });
      }

      res.json({
        success: true,
        message: '贺卡更新成功',
        data: card,
      });
    } catch (error) {
      console.error('更新贺卡失败:', error);
      res.status(500).json({ success: false, message: '更新贺卡失败' });
    }
  }

  async deleteCard(req, res) {
    try {
      const { id } = req.params;
      const card = await GreetingCard.findByIdAndDelete(id);

      if (!card) {
        return res.status(404).json({ success: false, message: '贺卡不存在' });
      }

      res.json({ success: true, message: '贺卡删除成功' });
    } catch (error) {
      console.error('删除贺卡失败:', error);
      res.status(500).json({ success: false, message: '删除贺卡失败' });
    }
  }

  async getCardsByCategory(req, res) {
    try {
      const { category } = req.params;
      const { limit = 10 } = req.query;

      const cards = await GreetingCard.find({
        category,
        status: 'active',
      })
        .sort({ sortOrder: 1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: cards });
    } catch (error) {
      console.error('按分类获取贺卡失败:', error);
      res.status(500).json({ success: false, message: '获取贺卡失败' });
    }
  }

  async getHolidayCards(req, res) {
    try {
      const { holiday } = req.params;
      const { limit = 10 } = req.query;

      const cards = await GreetingCard.find({
        holidayTags: { $in: [holiday] },
        status: 'active',
      })
        .sort({ sortOrder: 1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: cards });
    } catch (error) {
      console.error('获取节日贺卡失败:', error);
      res.status(500).json({ success: false, message: '获取节日贺卡失败' });
    }
  }

  async getPremiumCards(req, res) {
    try {
      const { limit = 10 } = req.query;

      const cards = await GreetingCard.find({
        isPremium: true,
        status: 'active',
      })
        .sort({ sortOrder: 1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: cards });
    } catch (error) {
      console.error('获取付费贺卡失败:', error);
      res.status(500).json({ success: false, message: '获取付费贺卡失败' });
    }
  }
}

module.exports = new GreetingCardController();

const Product = require('../models/Product');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { type, category, status, keyword, page = 1, limit = 20, sort = 'default' } = req.query;

      const query = {};
      if (type) query.type = type;
      if (category) query.category = category;
      if (status) query.status = status;
      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } },
        ];
      }

      let sortOption = { sortOrder: 1, salesCount: -1, createdAt: -1 };

      if (sort === 'sales') {
        sortOption = { salesCount: -1, createdAt: -1 };
      } else if (sort === 'price-asc') {
        sortOption = { price: 1, createdAt: -1 };
      } else if (sort === 'price-desc') {
        sortOption = { price: -1, createdAt: -1 };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortOption,
      };

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(options.sort)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            pages: Math.ceil(total / options.limit),
          },
        },
      });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      res.status(500).json({ success: false, message: '获取商品列表失败' });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' });
      }

      res.json({ success: true, data: product });
    } catch (error) {
      console.error('获取商品详情失败:', error);
      res.status(500).json({ success: false, message: '获取商品详情失败' });
    }
  }

  async createProduct(req, res) {
    try {
      const {
        name,
        type,
        category,
        description,
        price,
        originalPrice,
        stock,
        images,
        tags,
        materials,
        customConfig,
        sortOrder,
      } = req.body;

      const product = new Product({
        name,
        type,
        category,
        description,
        price,
        originalPrice,
        stock,
        images,
        tags,
        materials,
        customConfig,
        sortOrder,
        status: stock > 0 ? 'active' : 'out_of_stock',
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: '商品创建成功',
        data: product,
      });
    } catch (error) {
      console.error('创建商品失败:', error);
      if (error.name === 'ValidationError') {
        return res
          .status(400)
          .json({ success: false, message: '数据验证失败', errors: error.errors });
      }
      res.status(500).json({ success: false, message: '创建商品失败' });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.stock !== undefined) {
        updateData.status = updateData.stock > 0 ? 'active' : 'out_of_stock';
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' });
      }

      res.json({
        success: true,
        message: '商品更新成功',
        data: product,
      });
    } catch (error) {
      console.error('更新商品失败:', error);
      if (error.name === 'ValidationError') {
        return res
          .status(400)
          .json({ success: false, message: '数据验证失败', errors: error.errors });
      }
      res.status(500).json({ success: false, message: '更新商品失败' });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' });
      }

      res.json({ success: true, message: '商品删除成功' });
    } catch (error) {
      console.error('删除商品失败:', error);
      res.status(500).json({ success: false, message: '删除商品失败' });
    }
  }

  async getProductsByType(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const query = { type, status: 'active' };
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort({ sortOrder: 1, salesCount: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('按类型获取商品失败:', error);
      res.status(500).json({ success: false, message: '获取商品失败' });
    }
  }

  async getHotProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const products = await Product.find({ status: 'active' })
        .sort({ salesCount: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: products });
    } catch (error) {
      console.error('获取热销商品失败:', error);
      res.status(500).json({ success: false, message: '获取热销商品失败' });
    }
  }
}

module.exports = new ProductController();

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const GreetingCard = require('../models/GreetingCard');
const HolidayPromotion = require('../models/HolidayPromotion');
const DeliveryPerson = require('../models/DeliveryPerson');

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const demoUsers = [
  {
    username: 'admin',
    email: 'admin@flower.com',
    password: '123456',
    phone: '13800000001',
    role: 'admin',
    address: [
      {
        name: '管理员',
        phone: '13800000001',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '建国路88号SOHO现代城A座',
        isDefault: true
      }
    ]
  },
  {
    username: 'user1',
    email: 'user1@flower.com',
    password: '123456',
    phone: '13800000002',
    role: 'customer',
    address: [
      {
        name: '张三',
        phone: '13800000002',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        detail: '中关村大街1号',
        isDefault: true
      }
    ]
  },
  {
    username: 'user2',
    email: 'user2@flower.com',
    password: '123456',
    phone: '13800000003',
    role: 'customer',
    address: [
      {
        name: '李四',
        phone: '13800000003',
        province: '北京市',
        city: '北京市',
        district: '西城区',
        detail: '西单北大街120号',
        isDefault: true
      }
    ]
  },
  {
    username: 'delivery1',
    email: 'delivery1@flower.com',
    password: '123456',
    phone: '13800000004',
    role: 'delivery'
  },
  {
    username: 'delivery2',
    email: 'delivery2@flower.com',
    password: '123456',
    phone: '13800000005',
    role: 'delivery'
  }
];

const seedUsers = async () => {
  const hashedPassword = await hashPassword('123456');
  
  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ username: demoUser.username });
    
    if (existingUser) {
      const isPasswordValid = await existingUser.comparePassword('123456');
      if (!isPasswordValid) {
        await User.updateOne(
          { username: demoUser.username },
          { $set: { password: hashedPassword } }
        );
        console.log(`已更新用户 ${demoUser.username} 的密码`);
      }
    } else {
      const userData = { ...demoUser };
      delete userData.password;
      
      const newUser = new User(userData);
      newUser.password = '123456';
      await newUser.save();
      console.log(`已创建演示用户：${demoUser.username}`);
    }
  }
};

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log('商品数据已存在，跳过种子数据');
    return;
  }

  const products = [
    {
      name: '红玫瑰',
      type: 'flower',
      category: 'rose',
      description: '精选云南红玫瑰，花头饱满，花期长，花香浓郁，适合各种浪漫场合。',
      price: 15,
      originalPrice: 20,
      stock: 500,
      images: ['https://picsum.photos/400/400?random=101'],
      tags: ['热销', '情人节'],
      materials: [{ name: '红玫瑰', quantity: '1枝' }],
      status: 'active',
      salesCount: 5234
    },
    {
      name: '粉色康乃馨',
      type: 'flower',
      category: 'carnation',
      description: '精选优质粉色康乃馨，花瓣层次分明，色泽鲜艳，母亲节首选。',
      price: 12,
      originalPrice: 15,
      stock: 300,
      images: ['https://picsum.photos/400/400?random=102'],
      tags: ['母亲节', '感恩'],
      materials: [{ name: '粉色康乃馨', quantity: '1枝' }],
      status: 'active',
      salesCount: 3456
    },
    {
      name: '向日葵',
      type: 'flower',
      category: 'sunflower',
      description: '阳光向日葵，花盘大，颜色鲜艳，象征阳光、积极向上。',
      price: 10,
      originalPrice: 12,
      stock: 200,
      images: ['https://picsum.photos/400/400?random=103'],
      tags: ['毕业季', '祝福'],
      materials: [{ name: '向日葵', quantity: '1枝' }],
      status: 'active',
      salesCount: 2890
    },
    {
      name: '白百合',
      type: 'flower',
      category: 'lily',
      description: '精选白百合，花朵洁白无瑕，花香清雅，象征纯洁、高贵。',
      price: 18,
      originalPrice: 22,
      stock: 150,
      images: ['https://picsum.photos/400/400?random=104'],
      tags: ['生日', '祝福'],
      materials: [{ name: '白百合', quantity: '1枝' }],
      status: 'active',
      salesCount: 2100
    },
    {
      name: '粉玫瑰',
      type: 'flower',
      category: 'rose',
      description: '精选优质粉玫瑰，色泽柔和，浪漫温馨，适合表白和纪念日。',
      price: 16,
      originalPrice: 20,
      stock: 250,
      images: ['https://picsum.photos/400/400?random=105'],
      tags: ['生日', '爱情'],
      materials: [{ name: '粉玫瑰', quantity: '1枝' }],
      status: 'active',
      salesCount: 1980
    },
    {
      name: '郁金香',
      type: 'flower',
      category: 'tulip',
      description: '进口郁金香，花色丰富，花形优雅，春季首选鲜花。',
      price: 14,
      originalPrice: 18,
      stock: 180,
      images: ['https://picsum.photos/400/400?random=106'],
      tags: ['春季', '优雅'],
      materials: [{ name: '郁金香', quantity: '1枝' }],
      status: 'active',
      salesCount: 1560
    },
    {
      name: '红玫瑰99朵花束',
      type: 'bouquet',
      category: 'rose-bouquet',
      description: '99朵精选红玫瑰，搭配满天星和精美包装，象征天长地久的爱情。',
      price: 299,
      originalPrice: 399,
      stock: 50,
      images: ['https://picsum.photos/400/400?random=107'],
      tags: ['热销', '情人节'],
      materials: [
        { name: '红玫瑰', quantity: '99枝' },
        { name: '满天星', quantity: '1扎' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '红色包装', price: 0 },
              { value: '黑色包装', price: 0 },
              { value: '白色包装', price: 0 }
            ]
          },
          {
            name: '附加礼物',
            choices: [
              { value: '不需要', price: 0 },
              { value: '精美巧克力', price: 50 },
              { value: '可爱小熊', price: 68 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 1256
    },
    {
      name: '向日葵混搭花束',
      type: 'bouquet',
      category: 'mixed-bouquet',
      description: '5朵向日葵搭配满天星和洋桔梗，阳光明媚，适合毕业和祝福。',
      price: 158,
      originalPrice: 188,
      stock: 80,
      images: ['https://picsum.photos/400/400?random=108'],
      tags: ['毕业季', '祝福'],
      materials: [
        { name: '向日葵', quantity: '5枝' },
        { name: '满天星', quantity: '1扎' },
        { name: '洋桔梗', quantity: '3枝' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '牛皮纸', price: 0 },
              { value: '蓝色包装', price: 0 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 823
    },
    {
      name: '百合玫瑰花束',
      type: 'bouquet',
      category: 'mixed-bouquet',
      description: '3朵白百合搭配11朵红玫瑰，优雅与浪漫的完美结合。',
      price: 228,
      originalPrice: 268,
      stock: 60,
      images: ['https://picsum.photos/400/400?random=109'],
      tags: ['生日', '祝福'],
      materials: [
        { name: '白百合', quantity: '3枝' },
        { name: '红玫瑰', quantity: '11枝' },
        { name: '黄莺', quantity: '适量' }
      ],
      status: 'active',
      salesCount: 456
    },
    {
      name: '粉色康乃馨花束',
      type: 'bouquet',
      category: 'carnation-bouquet',
      description: '19朵粉色康乃馨，搭配满天星，感恩母亲的最佳选择。',
      price: 168,
      originalPrice: 198,
      stock: 100,
      images: ['https://picsum.photos/400/400?random=110'],
      tags: ['母亲节', '感恩'],
      materials: [
        { name: '粉色康乃馨', quantity: '19枝' },
        { name: '满天星', quantity: '适量' }
      ],
      status: 'active',
      salesCount: 678
    },
    {
      name: '粉玫瑰花束',
      type: 'bouquet',
      category: 'rose-bouquet',
      description: '19朵粉玫瑰，浪漫温馨，适合表白和生日礼物。',
      price: 188,
      originalPrice: 228,
      stock: 70,
      images: ['https://picsum.photos/400/400?random=111'],
      tags: ['生日', '爱情'],
      materials: [
        { name: '粉玫瑰', quantity: '19枝' },
        { name: '满天星', quantity: '适量' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '粉色包装', price: 0 },
              { value: '白色包装', price: 0 }
            ]
          },
          {
            name: '附加礼物',
            choices: [
              { value: '不需要', price: 0 },
              { value: '精美巧克力', price: 50 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 567
    },
    {
      name: '郁金香花束',
      type: 'bouquet',
      category: 'tulip-bouquet',
      description: '15朵进口郁金香，优雅高贵，春季限定款。',
      price: 198,
      originalPrice: 238,
      stock: 40,
      images: ['https://picsum.photos/400/400?random=112'],
      tags: ['春季', '优雅'],
      materials: [
        { name: '郁金香', quantity: '15枝' },
        { name: '尤加利叶', quantity: '适量' }
      ],
      status: 'active',
      salesCount: 345
    },
    {
      name: '粉色康乃馨礼盒',
      type: 'gift',
      category: 'carnation-gift',
      description: '19朵粉色康乃馨精美礼盒装，母亲节感恩首选。',
      price: 168,
      originalPrice: 198,
      stock: 80,
      images: ['https://picsum.photos/400/400?random=113'],
      tags: ['母亲节', '感恩'],
      materials: [
        { name: '粉色康乃馨', quantity: '19枝' },
        { name: '满天星', quantity: '适量' }
      ],
      status: 'active',
      salesCount: 856
    },
    {
      name: '情人节限定礼盒',
      type: 'gift',
      category: 'valentines-gift',
      description: '52朵红玫瑰+进口巧克力礼盒，情人节专属限定，浪漫加倍。',
      price: 520,
      originalPrice: 688,
      stock: 30,
      images: ['https://picsum.photos/400/400?random=114'],
      tags: ['情人节', '限定'],
      materials: [
        { name: '红玫瑰', quantity: '52枝' },
        { name: '进口巧克力', quantity: '1盒' },
        { name: '可爱小熊', quantity: '1只' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '红色浪漫', price: 0 },
              { value: '粉色温馨', price: 0 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 234
    },
    {
      name: '生日花束礼盒',
      type: 'gift',
      category: 'birthday-gift',
      description: '11朵粉玫瑰+3朵洋桔梗精美礼盒，生日礼物首选。',
      price: 198,
      originalPrice: 238,
      stock: 60,
      images: ['https://picsum.photos/400/400?random=115'],
      tags: ['生日', '礼盒'],
      materials: [
        { name: '粉玫瑰', quantity: '11枝' },
        { name: '洋桔梗', quantity: '3枝' },
        { name: '满天星', quantity: '适量' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '粉色', price: 0 },
              { value: '蓝色', price: 0 },
              { value: '紫色', price: 0 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 378
    },
    {
      name: '混搭鲜花礼盒',
      type: 'gift',
      category: 'mixed-gift',
      description: '11朵红玫瑰+2朵白百合精美礼盒装，送礼首选。',
      price: 258,
      originalPrice: 328,
      stock: 50,
      images: ['https://picsum.photos/400/400?random=116'],
      tags: ['精选', '礼盒'],
      materials: [
        { name: '红玫瑰', quantity: '11枝' },
        { name: '白百合', quantity: '2枝' },
        { name: '黄莺', quantity: '适量' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '红色', price: 0 },
              { value: '黑色', price: 0 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 456
    },
    {
      name: '母亲节感恩礼盒',
      type: 'gift',
      category: 'mothers-day-gift',
      description: '22朵粉色康乃馨+满天星精美礼盒，感恩母亲。',
      price: 228,
      originalPrice: 288,
      stock: 70,
      images: ['https://picsum.photos/400/400?random=117'],
      tags: ['母亲节', '感恩'],
      materials: [
        { name: '粉色康乃馨', quantity: '22枝' },
        { name: '满天星', quantity: '1扎' }
      ],
      status: 'active',
      salesCount: 289
    },
    {
      name: '圣诞限定礼盒',
      type: 'gift',
      category: 'christmas-gift',
      description: '22朵红玫瑰+圣诞装饰精美礼盒，圣诞特别款。',
      price: 388,
      originalPrice: 488,
      stock: 25,
      images: ['https://picsum.photos/400/400?random=118'],
      tags: ['圣诞', '限定'],
      materials: [
        { name: '红玫瑰', quantity: '22枝' },
        { name: '圣诞装饰', quantity: '1套' }
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '圣诞红', price: 0 },
              { value: '圣诞绿', price: 0 }
            ]
          }
        ]
      },
      status: 'active',
      salesCount: 167
    }
  ];

  await Product.insertMany(products);
  console.log('商品数据创建成功');
};

const seedGreetingCards = async () => {
  const count = await GreetingCard.countDocuments();
  if (count > 0) {
    console.log('贺卡数据已存在，跳过种子数据');
    return;
  }

  const cards = [
    {
      name: '浪漫爱情卡',
      category: 'love',
      description: '粉色玫瑰背景，浪漫温馨的爱情贺卡',
      image: 'https://picsum.photos/300/200?random=201',
      theme: 'romantic',
      defaultMessages: [
        { title: '经典告白', content: '亲爱的，遇见你是我这辈子最大的幸运，我爱你！' },
        { title: '甜蜜情话', content: '想你的时候，心就像装满了蜂蜜，甜甜的。' }
      ],
      isPremium: false,
      price: 0,
      status: 'active',
      holidayTags: ['valentines', 'chinese_valentines']
    },
    {
      name: '生日祝福卡',
      category: 'birthday',
      description: '彩色气球和蛋糕图案，生日快乐贺卡',
      image: 'https://picsum.photos/300/200?random=202',
      theme: 'birthday',
      defaultMessages: [
        { title: '温馨祝福', content: '生日快乐！愿你每一天都充满阳光和快乐！' },
        { title: '特别祝福', content: '在这个特别的日子里，祝你生日快乐，岁岁平安！' }
      ],
      isPremium: false,
      price: 0,
      status: 'active'
    },
    {
      name: '感恩母亲卡',
      category: 'thanks',
      description: '粉色康乃馨背景，感恩母亲的贺卡',
      image: 'https://picsum.photos/300/200?random=203',
      theme: 'gratitude',
      defaultMessages: [
        { title: '感恩母亲', content: '妈妈，感谢您给了我生命，给了我全部的爱。我爱您！' },
        { title: '温馨祝福', content: '亲爱的妈妈，您辛苦了，愿您永远健康快乐！' }
      ],
      isPremium: false,
      price: 0,
      status: 'active',
      holidayTags: ['mothers']
    },
    {
      name: '节日祝福卡',
      category: 'festival',
      description: '喜庆红色背景，节日祝福贺卡',
      image: 'https://picsum.photos/300/200?random=204',
      theme: 'festive',
      defaultMessages: [
        { title: '新年快乐', content: '新年快乐！愿新的一年万事如意，幸福安康！' },
        { title: '节日祝福', content: '佳节来临之际，祝你节日快乐，阖家幸福！' }
      ],
      isPremium: false,
      price: 0,
      status: 'active',
      holidayTags: ['new_year', 'spring_festival']
    },
    {
      name: '精美爱情卡',
      category: 'love',
      description: '精美的3D立体爱心设计，高端爱情贺卡',
      image: 'https://picsum.photos/300/200?random=205',
      theme: 'premium-love',
      defaultMessages: [
        { title: '深情告白', content: '亲爱的，你是我生命中最美的风景，我爱你，永远。' }
      ],
      isPremium: true,
      price: 20,
      status: 'active',
      holidayTags: ['valentines']
    },
    {
      name: '精美生日卡',
      category: 'birthday',
      description: '精美的烫金设计，高端生日贺卡',
      image: 'https://picsum.photos/300/200?random=206',
      theme: 'premium-birthday',
      defaultMessages: [
        { title: '尊贵祝福', content: '在这个特别的日子里，祝你生日快乐，前程似锦！' }
      ],
      isPremium: true,
      price: 20,
      status: 'active'
    }
  ];

  await GreetingCard.insertMany(cards);
  console.log('贺卡数据创建成功');
};

const seedHolidayPromotions = async () => {
  const count = await HolidayPromotion.countDocuments();
  if (count > 0) {
    console.log('节日营销数据已存在，跳过种子数据');
    return;
  }

  const now = new Date();
  const year = now.getFullYear();

  const promotions = [
    {
      name: '情人节专属特惠',
      holiday: 'valentines',
      description: '2月14日情人节，全场鲜花低至8折，更有专属礼盒等你来选！',
      startDate: new Date(year, 1, 10),
      endDate: new Date(year, 1, 15),
      discountType: 'percentage',
      discountValue: 80,
      minPurchase: 0,
      applicableCategories: ['flower', 'bouquet', 'gift'],
      bannerImage: 'https://picsum.photos/800/300?random=301',
      isFeatured: true,
      status: 'active'
    },
    {
      name: '母亲节感恩活动',
      holiday: 'mothers',
      description: '母亲节特惠，鲜花礼盒立减30元，让爱更有温度！',
      startDate: new Date(year, 4, 8),
      endDate: new Date(year, 4, 13),
      discountType: 'fixed',
      discountValue: 30,
      minPurchase: 100,
      applicableCategories: ['bouquet', 'gift'],
      bannerImage: 'https://picsum.photos/800/300?random=302',
      isFeatured: true,
      status: 'active'
    },
    {
      name: '七夕节浪漫活动',
      holiday: 'chinese_valentines',
      description: '中国情人节，鲜花礼盒85折，送最爱的她！',
      startDate: new Date(year, 7, 18),
      endDate: new Date(year, 7, 23),
      discountType: 'percentage',
      discountValue: 85,
      minPurchase: 0,
      applicableCategories: ['flower', 'bouquet', 'gift'],
      bannerImage: 'https://picsum.photos/800/300?random=303',
      isFeatured: true,
      status: 'active'
    },
    {
      name: '圣诞节狂欢',
      holiday: 'christmas',
      description: '圣诞特惠，全场鲜花礼盒7折起，共度浪漫圣诞！',
      startDate: new Date(year, 11, 20),
      endDate: new Date(year, 11, 26),
      discountType: 'percentage',
      discountValue: 70,
      minPurchase: 0,
      applicableCategories: ['bouquet', 'gift'],
      bannerImage: 'https://picsum.photos/800/300?random=304',
      isFeatured: true,
      status: 'active'
    },
    {
      name: '新年特惠活动',
      holiday: 'new_year',
      description: '新年新气象，全场鲜花8折，新的一年从一束鲜花开始！',
      startDate: new Date(year, 11, 28),
      endDate: new Date(year + 1, 0, 3),
      discountType: 'percentage',
      discountValue: 80,
      minPurchase: 0,
      applicableCategories: ['flower', 'bouquet', 'gift'],
      bannerImage: 'https://picsum.photos/800/300?random=305',
      isFeatured: true,
      status: 'active'
    }
  ];

  await HolidayPromotion.insertMany(promotions);
  console.log('节日营销数据创建成功');
};

const seedDeliveryPersons = async () => {
  const count = await DeliveryPerson.countDocuments();
  if (count > 0) {
    console.log('配送员数据已存在，跳过种子数据');
    return;
  }

  const deliveryPersons = [
    {
      name: '王师傅',
      phone: '13800001001',
      employeeNo: 'DP001',
      status: 'available',
      deliveryArea: [
        { district: '朝阳区', isPrimary: true },
        { district: '东城区', isPrimary: false }
      ],
      totalDeliveries: 1256,
      rating: 4.8,
      isActive: true
    },
    {
      name: '李师傅',
      phone: '13800001002',
      employeeNo: 'DP002',
      status: 'available',
      deliveryArea: [
        { district: '海淀区', isPrimary: true },
        { district: '西城区', isPrimary: false }
      ],
      totalDeliveries: 987,
      rating: 4.9,
      isActive: true
    },
    {
      name: '张师傅',
      phone: '13800001003',
      employeeNo: 'DP003',
      status: 'offline',
      deliveryArea: [
        { district: '丰台区', isPrimary: true }
      ],
      totalDeliveries: 654,
      rating: 4.7,
      isActive: true
    }
  ];

  await DeliveryPerson.insertMany(deliveryPersons);
  console.log('配送员数据创建成功');
};

const seedAll = async () => {
  console.log('开始创建种子数据...');
  await seedUsers();
  await seedProducts();
  await seedGreetingCards();
  await seedHolidayPromotions();
  await seedDeliveryPersons();
  console.log('种子数据创建完成！');
};

module.exports = seedAll;

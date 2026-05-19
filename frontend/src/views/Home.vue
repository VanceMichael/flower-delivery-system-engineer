<template>
  <div class="page-container home-page">
    <div class="banner-section">
      <van-swipe :autoplay="3000" indicator-color="#fff">
        <van-swipe-item v-for="banner in banners" :key="banner.id">
          <img :src="banner.image" alt="" class="banner-img" />
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="category-section">
      <div
        class="category-item"
        v-for="category in categories"
        :key="category.id"
        @click="goToCategory(category)"
      >
        <img :src="category.icon" alt="" class="category-icon" />
        <span class="category-name">{{ category.name }}</span>
      </div>
    </div>

    <div class="promotion-section" v-if="activePromotions.length > 0">
      <div class="section-header">
        <span class="section-title">节日活动</span>
        <span class="more" @click="goToPromotions">更多 ></span>
      </div>
      <div class="promotion-list">
        <div
          class="promotion-item"
          v-for="promotion in activePromotions.slice(0, 3)"
          :key="promotion._id"
          @click="goToPromotion(promotion)"
        >
          <img :src="promotion.bannerImage || defaultBanner" alt="" class="promotion-img" />
          <div class="promotion-info">
            <div class="promotion-name">{{ promotion.name }}</div>
            <div class="promotion-discount" v-if="promotion.discountType === 'percentage'">
              {{ promotion.discountValue }}折
            </div>
            <div class="promotion-discount" v-else>减{{ promotion.discountValue }}元</div>
          </div>
        </div>
      </div>
    </div>

    <div class="hot-section">
      <div class="section-header">
        <span class="section-title">热销推荐</span>
        <span class="more" @click="goToProducts('hot')">更多 ></span>
      </div>
      <div class="product-grid">
        <div
          class="product-item"
          v-for="product in hotProducts"
          :key="product._id"
          @click="goToProductDetail(product)"
        >
          <img :src="product.images?.[0] || defaultProductImage" alt="" class="product-img" />
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price">
            <span class="current-price">¥{{ product.price }}</span>
            <span class="original-price" v-if="product.originalPrice"
              >¥{{ product.originalPrice }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <van-tabbar v-model="activeTab" route active-color="#1989fa">
      <van-tabbar-item name="home" to="/home">
        <template #icon="props">
          <van-icon
            :name="props.active ? 'wap-home' : 'home-o'"
            :color="props.active ? '#1989fa' : ''"
          />
        </template>
        首页
      </van-tabbar-item>
      <van-tabbar-item name="products" to="/products">
        <template #icon="props">
          <van-icon
            :name="props.active ? 'shopping-cart' : 'shopping-cart-o'"
            :color="props.active ? '#1989fa' : ''"
          />
        </template>
        商品
      </van-tabbar-item>
      <van-tabbar-item name="cart" to="/cart">
        <template #icon="props">
          <van-icon
            :name="props.active ? 'cart' : 'cart-o'"
            :color="props.active ? '#1989fa' : ''"
          />
        </template>
        <template #badge>
          <van-badge :content="cartCount" v-if="cartCount > 0" />
        </template>
        购物车
      </van-tabbar-item>
      <van-tabbar-item name="profile" to="/profile">
        <template #icon="props">
          <van-icon
            :name="props.active ? 'user' : 'user-o'"
            :color="props.active ? '#1989fa' : ''"
          />
        </template>
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { productApi, promotionApi } from '@/api';
import { useCartStore } from '@/store';

const router = useRouter();
const cartStore = useCartStore();

const activeTab = ref('home');
const hotProducts = ref([]);
const activePromotions = ref([]);
const cartCount = computed(() => cartStore.cartCount);

const banners = ref([
  { id: 1, image: 'https://picsum.photos/800/400?random=101' },
  { id: 2, image: 'https://picsum.photos/800/400?random=102' },
  { id: 3, image: 'https://picsum.photos/800/400?random=103' },
]);

const categories = ref([
  { id: 'flower', name: '鲜花', icon: 'https://picsum.photos/100/100?random=1' },
  { id: 'bouquet', name: '花束', icon: 'https://picsum.photos/100/100?random=2' },
  { id: 'gift', name: '礼盒', icon: 'https://picsum.photos/100/100?random=3' },
  { id: 'promotion', name: '活动', icon: 'https://picsum.photos/100/100?random=4' },
]);

const defaultProductImage = 'https://picsum.photos/200/200?random=5';
const defaultBanner = 'https://picsum.photos/800/400?random=100';

const fetchHotProducts = async () => {
  try {
    const res = await productApi.getHot({ limit: 4 });
    hotProducts.value = res || [];
  } catch (_e) {
    hotProducts.value = [
      {
        _id: '1',
        name: '红玫瑰花束',
        price: 199,
        originalPrice: 299,
        images: ['https://picsum.photos/200/200?random=11'],
      },
      {
        _id: '2',
        name: '粉色康乃馨礼盒',
        price: 168,
        originalPrice: 198,
        images: ['https://picsum.photos/200/200?random=12'],
      },
      {
        _id: '3',
        name: '向日葵花束',
        price: 128,
        originalPrice: 158,
        images: ['https://picsum.photos/200/200?random=13'],
      },
      {
        _id: '4',
        name: '混搭鲜花礼盒',
        price: 258,
        originalPrice: 328,
        images: ['https://picsum.photos/200/200?random=14'],
      },
    ];
  }
};

const fetchActivePromotions = async () => {
  try {
    const res = await promotionApi.getActive();
    activePromotions.value = res || [];
  } catch (_e) {
    activePromotions.value = [
      {
        _id: '1',
        name: '情人节特惠',
        discountType: 'percentage',
        discountValue: 80,
        bannerImage: 'https://picsum.photos/400/200?random=21',
      },
      {
        _id: '2',
        name: '母亲节感恩',
        discountType: 'fixed',
        discountValue: 30,
        bannerImage: 'https://picsum.photos/400/200?random=22',
      },
    ];
  }
};

const goToCategory = (category) => {
  if (category.id === 'promotion') {
    router.push('/promotions');
  } else {
    router.push({ path: '/products', query: { type: category.id } });
  }
};

const goToProducts = (type) => {
  if (type === 'hot') {
    router.push({ path: '/products', query: { sort: 'sales' } });
  } else {
    router.push('/products');
  }
};

const goToPromotions = () => {
  router.push('/promotions');
};

const goToPromotion = (promotion) => {
  router.push(`/promotions/${promotion._id}`);
};

const goToProductDetail = (product) => {
  router.push(`/products/${product._id}`);
};

onMounted(() => {
  fetchHotProducts();
  fetchActivePromotions();
});
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.banner-section {
  width: 100%;
}

.banner-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.category-section {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: #fff;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 5px;
}

.category-name {
  font-size: 12px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.more {
  font-size: 13px;
  color: #999;
}

.promotion-section {
  margin-top: 10px;
  background: #fff;
}

.promotion-list {
  display: flex;
  padding: 0 15px 15px;
  gap: 10px;
  overflow-x: auto;
}

.promotion-item {
  flex-shrink: 0;
  width: 140px;
  border-radius: 8px;
  overflow: hidden;
  background: #f7f8fa;
}

.promotion-img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.promotion-info {
  padding: 8px;
}

.promotion-name {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promotion-discount {
  font-size: 12px;
  color: #ff4d4f;
  font-weight: bold;
}

.hot-section {
  margin-top: 10px;
  background: #fff;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px 15px;
  gap: 10px;
}

.product-item {
  width: calc(50% - 5px);
  background: #f7f8fa;
  border-radius: 8px;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-name {
  padding: 8px;
  font-size: 13px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  padding: 0 8px 8px;
}

.current-price {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 5px;
}
</style>

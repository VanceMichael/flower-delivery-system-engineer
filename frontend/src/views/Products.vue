<template>
  <div class="page-container products-page">
    <van-search v-model="keyword" placeholder="搜索鲜花、花束、礼盒" @search="onSearch" />

    <div class="filter-tabs">
      <van-tabs v-model="activeTab" @change="onTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="鲜花" name="flower" />
        <van-tab title="花束" name="bouquet" />
        <van-tab title="礼盒" name="gift" />
      </van-tabs>
    </div>

    <div class="sort-bar">
      <div class="sort-item" :class="{ active: sortBy === 'default' }" @click="setSort('default')">
        默认
      </div>
      <div class="sort-item" :class="{ active: sortBy === 'sales' }" @click="setSort('sales')">
        销量
      </div>
      <div
        class="sort-item"
        :class="{ active: sortBy === 'price-asc' }"
        @click="setSort('price-asc')"
      >
        价格↑
      </div>
      <div
        class="sort-item"
        :class="{ active: sortBy === 'price-desc' }"
        @click="setSort('price-desc')"
      >
        价格↓
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="products.length > 0" class="product-list">
        <div
          v-for="product in products"
          :key="product._id"
          class="product-item"
          @click="goToDetail(product)"
        >
          <img :src="product.images?.[0] || defaultImage" alt="" class="product-img" />
          <div class="product-info">
            <div class="product-name">
              {{ product.name }}
            </div>
            <div class="product-tags">
              <span v-for="tag in product.tags?.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div v-if="product.materials?.length > 0" class="product-materials">
              <span v-for="(m, i) in product.materials.slice(0, 2)" :key="i" class="material"
                >{{ m.name }}({{ m.quantity }})</span
              >
            </div>
            <div class="product-price-row">
              <div class="price-section">
                <span class="current-price">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="original-price"
                  >¥{{ product.originalPrice }}</span
                >
              </div>
              <div class="sales-section">
                <span>已售{{ product.salesCount || 0 }}件</span>
              </div>
            </div>
            <div v-if="product.customConfig?.isCustomizable" class="custom-badge">
              <van-tag type="primary" size="mini"> 支持定制 </van-tag>
            </div>
          </div>
        </div>
      </div>

      <van-empty v-else-if="!loading" description="暂无商品" />

      <van-loading v-if="loading" text="加载中..." class="loading-center" />

      <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" />
    </van-pull-refresh>

    <van-tabbar v-model="activeTabBar" route active-color="#1989fa">
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
          <van-badge v-if="cartCount > 0" :content="cartCount" />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productApi } from '@/api';
import { useCartStore } from '@/store';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const keyword = ref('');
const activeTab = ref('all');
const sortBy = ref('default');
const activeTabBar = ref('products');
const products = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);
const pageSize = 10;

const cartCount = computed(() => cartStore.cartCount);
const defaultImage = 'https://picsum.photos/200/200?random=';

const mockAllProducts = [
  {
    _id: 'f1',
    name: '红玫瑰单枝',
    type: 'flower',
    price: 15,
    originalPrice: 20,
    salesCount: 5234,
    tags: ['热销', '情人节'],
    images: ['https://picsum.photos/200/200?random=1'],
    materials: [{ name: '红玫瑰', quantity: '1枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'f2',
    name: '粉色康乃馨',
    type: 'flower',
    price: 12,
    originalPrice: 15,
    salesCount: 3456,
    tags: ['母亲节', '感恩'],
    images: ['https://picsum.photos/200/200?random=2'],
    materials: [{ name: '粉色康乃馨', quantity: '1枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'f3',
    name: '向日葵',
    type: 'flower',
    price: 10,
    originalPrice: 12,
    salesCount: 2890,
    tags: ['毕业季', '祝福'],
    images: ['https://picsum.photos/200/200?random=3'],
    materials: [{ name: '向日葵', quantity: '1枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'f4',
    name: '白百合',
    type: 'flower',
    price: 18,
    originalPrice: 22,
    salesCount: 2100,
    tags: ['生日', '祝福'],
    images: ['https://picsum.photos/200/200?random=4'],
    materials: [{ name: '白百合', quantity: '1枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'f5',
    name: '粉玫瑰',
    type: 'flower',
    price: 16,
    originalPrice: 20,
    salesCount: 1980,
    tags: ['生日', '爱情'],
    images: ['https://picsum.photos/200/200?random=5'],
    materials: [{ name: '粉玫瑰', quantity: '1枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'f6',
    name: '郁金香',
    type: 'flower',
    price: 14,
    originalPrice: 18,
    salesCount: 1560,
    tags: ['春季', '优雅'],
    images: ['https://picsum.photos/200/200?random=6'],
    materials: [{ name: '郁金香', quantity: '1枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'b1',
    name: '红玫瑰99朵花束',
    type: 'bouquet',
    price: 299,
    originalPrice: 399,
    salesCount: 1256,
    tags: ['热销', '情人节'],
    images: ['https://picsum.photos/200/200?random=7'],
    materials: [{ name: '红玫瑰', quantity: '99枝' }],
    customConfig: { isCustomizable: true },
  },
  {
    _id: 'b2',
    name: '向日葵混搭花束',
    type: 'bouquet',
    price: 158,
    originalPrice: 188,
    salesCount: 823,
    tags: ['毕业季', '祝福'],
    images: ['https://picsum.photos/200/200?random=8'],
    materials: [
      { name: '向日葵', quantity: '5枝' },
      { name: '满天星', quantity: '1扎' },
    ],
    customConfig: { isCustomizable: true },
  },
  {
    _id: 'b3',
    name: '百合玫瑰花束',
    type: 'bouquet',
    price: 228,
    originalPrice: 268,
    salesCount: 456,
    tags: ['生日', '祝福'],
    images: ['https://picsum.photos/200/200?random=9'],
    materials: [
      { name: '白百合', quantity: '3枝' },
      { name: '红玫瑰', quantity: '11枝' },
    ],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'b4',
    name: '粉色康乃馨花束',
    type: 'bouquet',
    price: 168,
    originalPrice: 198,
    salesCount: 678,
    tags: ['母亲节', '感恩'],
    images: ['https://picsum.photos/200/200?random=10'],
    materials: [{ name: '粉色康乃馨', quantity: '19枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'b5',
    name: '粉玫瑰花束',
    type: 'bouquet',
    price: 188,
    originalPrice: 228,
    salesCount: 567,
    tags: ['生日', '爱情'],
    images: ['https://picsum.photos/200/200?random=11'],
    materials: [{ name: '粉玫瑰', quantity: '19枝' }],
    customConfig: { isCustomizable: true },
  },
  {
    _id: 'b6',
    name: '郁金香花束',
    type: 'bouquet',
    price: 198,
    originalPrice: 238,
    salesCount: 345,
    tags: ['春季', '优雅'],
    images: ['https://picsum.photos/200/200?random=12'],
    materials: [{ name: '郁金香', quantity: '15枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'g1',
    name: '粉色康乃馨礼盒',
    type: 'gift',
    price: 168,
    originalPrice: 198,
    salesCount: 856,
    tags: ['母亲节', '感恩'],
    images: ['https://picsum.photos/200/200?random=13'],
    materials: [{ name: '粉色康乃馨', quantity: '19枝' }],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'g2',
    name: '情人节限定礼盒',
    type: 'gift',
    price: 520,
    originalPrice: 688,
    salesCount: 234,
    tags: ['情人节', '限定'],
    images: ['https://picsum.photos/200/200?random=14'],
    materials: [
      { name: '红玫瑰', quantity: '52枝' },
      { name: '巧克力', quantity: '1盒' },
    ],
    customConfig: { isCustomizable: true },
  },
  {
    _id: 'g3',
    name: '生日花束礼盒',
    type: 'gift',
    price: 198,
    originalPrice: 238,
    salesCount: 378,
    tags: ['生日', '礼盒'],
    images: ['https://picsum.photos/200/200?random=15'],
    materials: [
      { name: '粉玫瑰', quantity: '11枝' },
      { name: '洋桔梗', quantity: '3枝' },
    ],
    customConfig: { isCustomizable: true },
  },
  {
    _id: 'g4',
    name: '混搭鲜花礼盒',
    type: 'gift',
    price: 258,
    originalPrice: 328,
    salesCount: 456,
    tags: ['精选', '礼盒'],
    images: ['https://picsum.photos/200/200?random=16'],
    materials: [
      { name: '红玫瑰', quantity: '11枝' },
      { name: '白百合', quantity: '2枝' },
    ],
    customConfig: { isCustomizable: true },
  },
  {
    _id: 'g5',
    name: '母亲节感恩礼盒',
    type: 'gift',
    price: 228,
    originalPrice: 288,
    salesCount: 289,
    tags: ['母亲节', '感恩'],
    images: ['https://picsum.photos/200/200?random=17'],
    materials: [
      { name: '粉色康乃馨', quantity: '22枝' },
      { name: '满天星', quantity: '1扎' },
    ],
    customConfig: { isCustomizable: false },
  },
  {
    _id: 'g6',
    name: '圣诞限定礼盒',
    type: 'gift',
    price: 388,
    originalPrice: 488,
    salesCount: 167,
    tags: ['圣诞', '限定'],
    images: ['https://picsum.photos/200/200?random=18'],
    materials: [
      { name: '红玫瑰', quantity: '22枝' },
      { name: '圣诞装饰', quantity: '1套' },
    ],
    customConfig: { isCustomizable: true },
  },
];

const fetchProducts = async (isRefresh = false) => {
  if (isRefresh) {
    page.value = 1;
    products.value = [];
    finished.value = false;
  }

  if (loading.value || finished.value) {
    return;
  }

  loading.value = true;

  const params = {
    page: page.value,
    limit: pageSize,
    keyword: keyword.value || undefined,
    sort: sortBy.value,
  };

  if (activeTab.value !== 'all') {
    params.type = activeTab.value;
  }

  try {
    const res = await productApi.getAll(params);
    const newProducts = res?.products || [];

    if (isRefresh) {
      products.value = newProducts;
    } else {
      products.value = [...products.value, ...newProducts];
    }

    if (newProducts.length < pageSize) {
      finished.value = true;
    } else {
      page.value++;
    }
  } catch (_e) {
    let filteredProducts = [...mockAllProducts];

    if (activeTab.value !== 'all') {
      filteredProducts = filteredProducts.filter((p) => p.type === activeTab.value);
    }

    if (keyword.value) {
      const kw = keyword.value.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) || p.tags.some((t) => t.toLowerCase().includes(kw)),
      );
    }

    if (sortBy.value === 'sales') {
      filteredProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    } else if (sortBy.value === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy.value === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    const start = (page.value - 1) * pageSize;
    const end = start + pageSize;
    const newProducts = filteredProducts.slice(start, end);

    if (isRefresh) {
      products.value = newProducts;
    } else {
      products.value = [...products.value, ...newProducts];
    }

    if (newProducts.length < pageSize || products.value.length >= filteredProducts.length) {
      finished.value = true;
    } else {
      page.value++;
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const onSearch = () => {
  fetchProducts(true);
};

const onTabChange = (name) => {
  activeTab.value = name;
  fetchProducts(true);
};

const setSort = (sort) => {
  sortBy.value = sort;
  fetchProducts(true);
};

const onRefresh = () => {
  fetchProducts(true);
};

const onLoad = () => {
  fetchProducts(false);
};

const goToDetail = (product) => {
  router.push(`/products/${product._id}`);
};

watch(
  () => route.query.type,
  (newType) => {
    if (newType) {
      activeTab.value = newType;
      fetchProducts(true);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (products.value.length === 0) {
    fetchProducts(true);
  }
});
</script>

<style scoped>
.products-page {
  padding-bottom: 60px;
}

.filter-tabs {
  background: #fff;
}

.sort-bar {
  display: flex;
  padding: 10px 15px;
  background: #fff;
  margin-top: 1px;
}

.sort-item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #666;
}

.sort-item.active {
  color: #1989fa;
  font-weight: bold;
}

.product-list {
  padding: 10px;
}

.product-item {
  display: flex;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
}

.product-img {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #fff7e6;
  color: #ff6b00;
  border-radius: 2px;
}

.product-materials {
  font-size: 11px;
  color: #999;
  margin-bottom: 8px;
}

.material {
  margin-right: 8px;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.current-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: bold;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 6px;
}

.sales-section {
  font-size: 12px;
  color: #999;
}

.custom-badge {
  margin-top: auto;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>

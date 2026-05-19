<template>
  <div class="product-detail-page">
    <van-nav-bar title="商品详情" left-text="返回" left-arrow @click-left="goBack" />

    <van-swipe :autoplay="3000" class="product-swipe">
      <van-swipe-item v-for="(img, index) in productImages" :key="index">
        <img :src="img" alt="" class="product-image" />
      </van-swipe-item>
    </van-swipe>

    <div class="product-info-section">
      <div class="price-row">
        <span class="current-price">¥{{ product.price }}</span>
        <span class="original-price" v-if="product.originalPrice"
          >¥{{ product.originalPrice }}</span
        >
        <span class="sales-count">已售{{ product.salesCount || 0 }}件</span>
      </div>
      <div class="product-name">{{ product.name }}</div>
      <div class="product-tags">
        <van-tag type="primary" size="mini" v-for="tag in product.tags" :key="tag">{{
          tag
        }}</van-tag>
      </div>
    </div>

    <van-cell-group inset class="material-group" v-if="product.materials?.length > 0">
      <van-cell title="花材搭配">
        <template #default>
          <div class="materials">
            <span v-for="(m, i) in product.materials" :key="i" class="material-item">
              {{ m.name }}({{ m.quantity }})
            </span>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset class="custom-group" v-if="product.customConfig?.isCustomizable">
      <van-cell title="自定义搭配" is-link @click="showCustomPopup = true">
        <template #value>
          <span class="custom-hint">点击选择定制选项</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset class="greeting-group">
      <van-cell title="添加贺卡" is-link @click="showGreetingPopup = true">
        <template #value>
          <span class="greeting-hint">{{ selectedCard ? '已选择' : '点击选择' }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset class="description-group">
      <van-cell title="商品描述">
        <template #default>
          <div class="description">{{ product.description || '暂无描述' }}</div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-popup v-model:show="showCustomPopup" round position="bottom" class="popup-custom-options">
      <template #title>自定义搭配</template>
      <div class="custom-options">
        <div
          class="option-group"
          v-for="option in product.customConfig?.options"
          :key="option.name"
        >
          <div class="option-title">{{ option.name }}</div>
          <div class="choice-list">
            <div
              class="choice-item"
              :class="{ active: getSelectedOptionValue(option.name) === choice.value }"
              v-for="choice in option.choices"
              :key="choice.value"
              @click="selectCustomOption(option.name, choice)"
            >
              <span class="choice-name">{{ choice.value }}</span>
              <span class="choice-price" v-if="choice.price > 0">+¥{{ choice.price }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="popup-footer">
        <van-button type="primary" block class="confirm-btn" @click="showCustomPopup = false"
          >确认</van-button
        >
      </div>
    </van-popup>

    <van-popup
      v-model:show="showGreetingPopup"
      round
      position="bottom"
      class="popup-greeting-selector"
      style="height: 60%"
    >
      <template #title>选择贺卡</template>
      <div class="greeting-cards">
        <div
          class="card-item"
          :class="{ active: selectedCard?._id === card._id }"
          v-for="card in greetingCards"
          :key="card._id"
          @click="selectCard(card)"
        >
          <img :src="card.image" alt="" class="card-image" />
          <div class="card-name">{{ card.name }}</div>
          <div class="card-price" v-if="card.isPremium && card.price > 0">+¥{{ card.price }}</div>
        </div>
      </div>
      <div class="greeting-message">
        <van-field
          v-model="greetingMessage"
          type="textarea"
          placeholder="请输入祝福语"
          rows="3"
          maxlength="100"
          show-word-limit
        />
      </div>
      <div class="popup-footer">
        <van-button type="primary" block class="confirm-btn" @click="showGreetingPopup = false"
          >确认</van-button
        >
      </div>
    </van-popup>

    <div class="bottom-bar">
      <div class="bar-left" @click="goToCart">
        <van-icon name="shopping-cart-o" size="22" />
        <van-badge :content="cartCount" v-if="cartCount > 0" />
        <span>购物车</span>
      </div>
      <div class="bar-center" @click="addToCart">
        <span>加入购物车</span>
      </div>
      <div class="bar-right" @click="buyNow">
        <span>立即购买</span>
      </div>
    </div>
  </div>

  <van-popup v-model:show="showStepper" round position="bottom">
    <template #title>选择数量</template>
    <div class="stepper-popup-content">
      <div class="product-preview">
        <img :src="productImages[0]" alt="" class="preview-image" />
        <div class="preview-info">
          <div class="preview-name">{{ product.name }}</div>
          <div class="preview-price">¥{{ product.price }}</div>
        </div>
      </div>
      <div class="stepper-row">
        <span class="stepper-label">数量</span>
        <van-stepper v-model="quantity" :min="1" :max="99" />
      </div>
    </div>
    <div class="popup-footer">
      <van-button type="primary" block @click="onStepperConfirm(quantity)">确认</van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productApi, greetingCardApi } from '@/api';
import { useCartStore, useOrderStore } from '@/store';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const product = ref({});
const quantity = ref(1);
const showStepper = ref(false);
const showCustomPopup = ref(false);
const showGreetingPopup = ref(false);
const selectedCustomOptions = ref({});
const selectedCard = ref(null);
const greetingMessage = ref('');
const greetingCards = ref([]);

const cartCount = computed(() => cartStore.cartCount);

const productImages = computed(() => {
  if (product.value.images?.length > 0) {
    return product.value.images;
  }
  return [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flower%20product%20image&image_size=square',
  ];
});

const fetchProduct = async () => {
  const productId = route.params.id;
  try {
    const res = await productApi.getById(productId);
    product.value = res || {};
  } catch (_e) {
    product.value = {
      _id: productId,
      name: '红玫瑰99朵花束',
      price: 299,
      originalPrice: 399,
      salesCount: 1256,
      tags: ['热销', '情人节'],
      description: '精选进口红玫瑰，搭配精美包装，适合各种浪漫场合。花材新鲜，品质保证。',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=99%20red%20roses%20bouquet&image_size=square',
      ],
      materials: [
        { name: '红玫瑰', quantity: '99枝' },
        { name: '满天星', quantity: '1扎' },
      ],
      customConfig: {
        isCustomizable: true,
        options: [
          {
            name: '包装颜色',
            choices: [
              { value: '红色包装', price: 0 },
              { value: '粉色包装', price: 0 },
              { value: '黑色包装', price: 10 },
            ],
          },
          {
            name: '附加礼物',
            choices: [
              { value: '不需要', price: 0 },
              { value: '巧克力', price: 50 },
              { value: '小熊公仔', price: 68 },
            ],
          },
        ],
      },
    };
  }
};

const fetchGreetingCards = async () => {
  try {
    const res = await greetingCardApi.getAll({ limit: 10 });
    greetingCards.value = res?.cards || [];
  } catch (_e) {
    greetingCards.value = [
      {
        _id: '1',
        name: '浪漫爱情卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20love%20greeting%20card&image_size=square',
        isPremium: false,
        price: 0,
      },
      {
        _id: '2',
        name: '感恩祝福卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=thanksgiving%20greeting%20card&image_size=square',
        isPremium: false,
        price: 0,
      },
      {
        _id: '3',
        name: '生日贺卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=birthday%20greeting%20card&image_size=square',
        isPremium: true,
        price: 20,
      },
    ];
  }
};

const selectCustomOption = (optionName, choice) => {
  selectedCustomOptions.value[optionName] = {
    value: choice.value,
    price: choice.price || 0,
  };
};

const getSelectedOptionValue = (optionName) => {
  const option = selectedCustomOptions.value[optionName];
  if (option && typeof option === 'object') {
    return option.value;
  }
  return option;
};

const selectCard = (card) => {
  selectedCard.value = card;
};

const addToCart = () => {
  showStepper.value = true;
};

const onStepperConfirm = async (val) => {
  quantity.value = val;
  const success = await cartStore.addToCart(
    product.value,
    quantity.value,
    selectedCustomOptions.value,
  );
  if (success) {
    showStepper.value = false;
  }
};

const buyNow = () => {
  cartStore.setQuickBuyItems(product.value, 1, selectedCustomOptions.value);
  orderStore.setGreetingCard(selectedCard.value, greetingMessage.value, '');
  router.push('/order-create');
};

const goBack = () => {
  router.back();
};

const goToCart = () => {
  router.push('/cart');
};

onMounted(() => {
  fetchProduct();
  fetchGreetingCards();
});
</script>

<style scoped>
.product-detail-page {
  padding-bottom: 60px;
}

.product-swipe {
  width: 100%;
  height: 300px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-section {
  padding: 15px;
  background: #fff;
}

.price-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.current-price {
  font-size: 20px;
  color: #ff4d4f;
  font-weight: bold;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
}

.sales-count {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.product-tags {
  display: flex;
  gap: 6px;
}

.material-group,
.custom-group,
.greeting-group,
.description-group {
  margin-top: 10px;
}

.materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.material-item {
  font-size: 13px;
  color: #666;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.custom-hint,
.greeting-hint {
  font-size: 13px;
  color: #999;
}

.description {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}

.bar-left {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bar-left span {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.bar-left .van-badge {
  position: absolute;
  top: 5px;
  right: 15px;
}

.bar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff976a;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.bar-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff4d4f;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.custom-options {
  padding: 15px;
  max-height: 70vh;
  overflow-y: auto;
}

.option-group {
  margin-bottom: 20px;
}

.option-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.option-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.choice-item {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
}

.choice-item.active {
  border-color: #1989fa;
  background: #eaf4ff;
  color: #1989fa;
}

.choice-price {
  font-size: 12px;
  color: #ff4d4f;
  margin-left: 4px;
}

.popup-custom-options,
.popup-greeting-selector {
  overflow-x: hidden;
  max-width: 100vw;
}

.popup-custom-options :deep(*),
.popup-greeting-selector :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}

.popup-footer {
  padding: 15px;
  background: #fff;
}

.confirm-btn {
  margin: 0;
}

.greeting-cards {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  gap: 10px;
  max-height: 50vh;
  overflow-y: auto;
}

.card-item {
  width: calc(33.33% - 7px);
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
}

.card-item.active {
  border-color: #1989fa;
}

.card-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.card-name {
  padding: 5px;
  font-size: 12px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-price {
  font-size: 10px;
  color: #ff4d4f;
  text-align: center;
  padding-bottom: 5px;
}

.greeting-message {
  padding: 15px;
}

.stepper-popup-content {
  padding: 20px;
}

.product-preview {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-info {
  flex: 1;
  margin-left: 12px;
}

.preview-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: bold;
}

.stepper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stepper-label {
  font-size: 14px;
  color: #333;
}
</style>

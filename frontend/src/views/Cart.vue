<template>
  <div class="cart-page page-container">
    <van-nav-bar title="购物车" />

    <van-tabs v-model="activeTab" v-if="!isEdit">
      <van-tab title="全部" />
    </van-tabs>

    <div class="cart-empty" v-if="cartItems.length === 0">
      <van-empty description="购物车是空的" />
      <van-button type="primary" @click="goShopping">去逛逛</van-button>
    </div>

    <div class="cart-list" v-else>
      <div class="cart-item" v-for="item in cartItems" :key="item.cartId">
        <van-checkbox v-model="item.selected" v-if="isEdit" />
        <img :src="item.image || defaultImage" alt="" class="item-image" @click="goToProduct(item)" />
        <div class="item-info">
          <div class="item-name" @click="goToProduct(item)">{{ item.productName }}</div>
          <div class="item-custom" v-if="item.customOptions">
            <van-tag size="mini" type="warning">已定制</van-tag>
          </div>
          <div class="item-price-row">
            <span class="item-price">¥{{ item.price }}</span>
            <van-stepper v-model="item.quantity" :min="1" @change="(value) => updateQuantity(item, value)" />
          </div>
        </div>
        <van-icon name="delete" class="delete-icon" v-if="isEdit" @click="removeItem(item)" />
      </div>
    </div>

    <div class="bottom-bar" v-if="cartItems.length > 0">
      <div class="bar-left">
        <van-checkbox v-model="selectAll" v-if="isEdit">全选</van-checkbox>
        <van-button type="default" size="small" @click="toggleEdit">{{ isEdit ? '完成' : '编辑' }}</van-button>
      </div>
      <div class="bar-right">
        <div class="total-section" v-if="!isEdit">
          <span class="total-label">合计:</span>
          <span class="total-price">¥{{ cartTotal.toFixed(2) }}</span>
        </div>
        <van-button type="danger" v-if="isEdit" @click="deleteSelected">删除</van-button>
        <van-button type="primary" v-else :disabled="cartItems.length === 0" @click="goToCheckout">结算({{ cartCount }})</van-button>
      </div>
    </div>

    <van-tabbar v-model="activeTabBar" route active-color="#1989fa">
      <van-tabbar-item name="home" to="/home">
        <template #icon="props">
          <van-icon :name="props.active ? 'wap-home' : 'home-o'" :color="props.active ? '#1989fa' : ''" />
        </template>
        首页
      </van-tabbar-item>
      <van-tabbar-item name="products" to="/products">
        <template #icon="props">
          <van-icon :name="props.active ? 'shopping-cart' : 'shopping-cart-o'" :color="props.active ? '#1989fa' : ''" />
        </template>
        商品
      </van-tabbar-item>
      <van-tabbar-item name="cart" to="/cart">
        <template #icon="props">
          <van-icon :name="props.active ? 'cart' : 'cart-o'" :color="props.active ? '#1989fa' : ''" />
        </template>
        <template #badge>
          <van-badge :content="cartCount" v-if="cartCount > 0" />
        </template>
        购物车
      </van-tabbar-item>
      <van-tabbar-item name="profile" to="/profile">
        <template #icon="props">
          <van-icon :name="props.active ? 'user' : 'user-o'" :color="props.active ? '#1989fa' : ''" />
        </template>
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore, useOrderStore } from '@/store';
import { showConfirmDialog, showToast } from 'vant';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const activeTab = ref(0);
const activeTabBar = ref('cart');
const isEdit = ref(false);
const selectAll = ref(false);

const cartItems = computed(() => cartStore.displayItems);
const cartCount = computed(() => cartStore.cartCount);
const cartTotal = computed(() => cartStore.cartTotal);

const defaultImage = 'https://picsum.photos/200/200?random=50';

watch(selectAll, (newVal) => {
  cartItems.value.forEach(item => {
    item.selected = newVal;
  });
});

const toggleEdit = () => {
  isEdit.value = !isEdit.value;
  if (!isEdit.value) {
    selectAll.value = false;
    cartItems.value.forEach(item => {
      item.selected = false;
    });
  }
};

const updateQuantity = async (item, value) => {
  const newQuantity = Number(value) || 1;
  item.quantity = newQuantity;
  await cartStore.updateQuantity(item.cartId, newQuantity);
};

const removeItem = (item) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该商品吗？'
  }).then(async () => {
    await cartStore.removeFromCart(item.cartId);
  }).catch(() => {});
};

const deleteSelected = async () => {
  const selectedItems = cartItems.value.filter(item => item.selected);
  if (selectedItems.length === 0) {
    showToast('请选择要删除的商品');
    return;
  }
  showConfirmDialog({
    title: '提示',
    message: `确定要删除选中的 ${selectedItems.length} 件商品吗？`
  }).then(async () => {
    for (const item of selectedItems) {
      await cartStore.removeFromCart(item.cartId);
    }
    showToast('删除成功');
    isEdit.value = false;
  }).catch(() => {});
};

const goShopping = () => {
  router.push('/products');
};

const goToProduct = (item) => {
  router.push(`/products/${item.productId}`);
};

const goToCheckout = () => {
  orderStore.resetOrderData();
  router.push('/order-create');
};

onMounted(async () => {
  await cartStore.fetchCart();
});
</script>

<style scoped>
.cart-page {
  padding-bottom: 120px;
}

.cart-empty {
  padding: 60px 20px;
  text-align: center;
}

.cart-list {
  padding: 10px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-custom {
  margin-bottom: 8px;
}

.item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 15px;
  color: #ff4d4f;
  font-weight: bold;
}

.delete-icon {
  font-size: 20px;
  color: #999;
  margin-left: 10px;
}

.bottom-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 99;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-section {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.total-label {
  font-size: 13px;
  color: #666;
}

.total-price {
  font-size: 18px;
  color: #ff4d4f;
  font-weight: bold;
}
</style>

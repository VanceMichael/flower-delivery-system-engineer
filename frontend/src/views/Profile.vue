<template>
  <div class="profile-page page-container">
    <div class="user-header">
      <div class="user-info" @click="handleUserClick">
        <van-icon name="user-circle-o" size="60" color="#1989fa" />
        <div class="user-text">
          <div class="user-name">{{ userName }}</div>
          <div class="user-tip" v-if="!userStore.isLoggedIn">点击登录</div>
          <div class="user-tip" v-else>{{ userStore.userInfo?.phone || '已登录' }}</div>
        </div>
        <van-icon
          name="arrow"
          size="16"
          color="#fff"
          class="arrow-icon"
          v-if="userStore.isLoggedIn"
        />
      </div>
    </div>

    <van-cell-group inset class="cell-group">
      <van-cell title="我的订单" is-link @click="goToOrders">
        <template #icon>
          <van-icon name="orders-o" color="#1989fa" />
        </template>
      </van-cell>
    </van-cell-group>

    <div class="order-status-bar">
      <div class="status-item" @click="goToOrders('pending_payment')">
        <van-icon name="pending-payment" size="22" color="#ff976a" />
        <span class="status-text">待付款</span>
      </div>
      <div class="status-item" @click="goToOrders('preparing')">
        <van-icon name="description" size="22" color="#1989fa" />
        <span class="status-text">待发货</span>
      </div>
      <div class="status-item" @click="goToOrders('shipping')">
        <van-icon name="logistics" size="22" color="#07c160" />
        <span class="status-text">待收货</span>
      </div>
      <div class="status-item" @click="goToOrders('completed')">
        <van-icon name="passed" size="22" color="#333" />
        <span class="status-text">已完成</span>
      </div>
      <div class="status-item">
        <van-icon name="service" size="22" color="#999" />
        <span class="status-text">售后</span>
      </div>
    </div>

    <van-cell-group inset class="cell-group">
      <van-cell title="收货地址" is-link @click="router.push('/address')">
        <template #icon>
          <van-icon name="location-o" color="#1989fa" />
        </template>
      </van-cell>
      <van-cell title="节日活动" is-link @click="router.push('/promotions')">
        <template #icon>
          <van-icon name="coupon-o" color="#ff4d4f" />
        </template>
      </van-cell>
      <van-cell title="贺卡模板" is-link @click="router.push('/greeting-cards')">
        <template #icon>
          <van-icon name="photo-o" color="#ff976a" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset class="cell-group">
      <van-cell title="联系客服" is-link @click="contactCustomerService">
        <template #icon>
          <van-icon name="service-o" color="#1989fa" />
        </template>
      </van-cell>
      <van-cell title="帮助中心" is-link @click="showHelpCenter">
        <template #icon>
          <van-icon name="question-o" color="#999" />
        </template>
      </van-cell>
      <van-cell title="关于我们" is-link @click="showAboutUs">
        <template #icon>
          <van-icon name="info-o" color="#999" />
        </template>
      </van-cell>
    </van-cell-group>

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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore, useUserStore } from '@/store';
import { showToast, showConfirmDialog } from 'vant';

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const activeTab = ref('profile');
const cartCount = computed(() => cartStore.cartCount);
const userName = computed(() => userStore.userInfo?.username || '未登录');

const handleUserClick = () => {
  if (userStore.isLoggedIn) {
    showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？',
    })
      .then(() => {
        userStore.logout();
        showToast('已退出登录');
      })
      .catch(() => {});
  } else {
    router.push('/login');
  }
};

const goToOrders = (status) => {
  if (!userStore.isLoggedIn) {
    router.push({
      path: '/login',
      query: { redirect: status ? `/orders?status=${status}` : '/orders' },
    });
    return;
  }
  if (status) {
    router.push({ path: '/orders', query: { status } });
  } else {
    router.push('/orders');
  }
};

const contactCustomerService = () => {
  showToast('客服电话：400-888-8888');
};

const showHelpCenter = () => {
  showToast('帮助中心功能开发中');
};

const showAboutUs = () => {
  showToast('鲜花配送系统 v1.0.0');
};
</script>

<style scoped>
.profile-page {
  padding-bottom: 60px;
  background: #f7f8fa;
}

.user-header {
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  padding: 30px 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-text {
  margin-left: 15px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.user-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.cell-group {
  margin-top: 10px;
}

.cell-group :deep(.van-cell) {
  align-items: center;
}

.cell-group :deep(.van-cell__icon) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-status-bar {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  background: #fff;
  margin-bottom: 0;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-text {
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}
</style>

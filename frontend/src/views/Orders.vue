<template>
  <div class="orders-page page-container">
    <van-nav-bar title="我的订单" left-text="返回" left-arrow @click-left="goBack" />

    <van-tabs v-model="activeTab">
      <van-tab title="全部">
        <order-list :status-filter="null" />
      </van-tab>
      <van-tab title="待付款">
        <order-list status-filter="pending_payment" />
      </van-tab>
      <van-tab title="待收货">
        <order-list :status-filter="['preparing', 'shipping']" />
      </van-tab>
      <van-tab title="已完成">
        <order-list :status-filter="['delivered', 'completed']" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import OrderList from '@/components/OrderList.vue';

const router = useRouter();

const activeTab = ref(0);

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
}
</style>

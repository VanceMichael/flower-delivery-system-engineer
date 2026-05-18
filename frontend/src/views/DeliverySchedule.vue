<template>
  <div class="placeholder-page">
    <van-nav-bar :title="pageTitle" left-arrow @click-left="goBack" />
    <van-empty description="功能开发中..." />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const pageTitles = {
  'Delivery.vue': '配送管理',
  'GreetingCardDetail.vue': '贺卡详情',
  'PromotionDetail.vue': '活动详情',
  'DeliverySchedule.vue': '预约配送'
};

const pageTitle = computed(() => {
  const path = route.path;
  if (path.includes('delivery-schedule')) return '预约配送';
  if (path.includes('greeting-cards/')) return '贺卡详情';
  if (path.includes('promotions/')) return '活动详情';
  if (path.includes('delivery') && !path.includes('tracking')) return '配送管理';
  return '页面';
});

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.placeholder-page {
  padding-bottom: 20px;
}
</style>

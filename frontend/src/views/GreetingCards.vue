<template>
  <div class="greeting-cards-page page-container">
    <van-nav-bar title="贺卡选择" left-arrow @click-left="goBack" />

    <van-tabs v-model="activeTab">
      <van-tab title="全部">
        <card-list :category="null" />
      </van-tab>
      <van-tab title="爱情">
        <card-list category="love" />
      </van-tab>
      <van-tab title="生日">
        <card-list category="birthday" />
      </van-tab>
      <van-tab title="感恩">
        <card-list category="thanks" />
      </van-tab>
      <van-tab title="节日">
        <card-list category="festival" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CardList from '@/components/CardList.vue';

const router = useRouter();

const activeTab = ref(0);

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.greeting-cards-page {
  padding-bottom: 20px;
}
</style>

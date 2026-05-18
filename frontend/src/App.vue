<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useCartStore, useUserStore } from '@/store';

const cartStore = useCartStore();
const userStore = useUserStore();

onMounted(() => {
  if (userStore.isLoggedIn) {
    cartStore.fetchCart();
  }
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>

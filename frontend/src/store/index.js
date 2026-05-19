import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cartApi } from '@/api';
import { showToast } from 'vant';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const quickBuyItems = ref([]);
  const isLoading = ref(false);

  const normalizeCartItems = (rawItems) => {
    if (!rawItems || !Array.isArray(rawItems)) return [];
    return rawItems.map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 1,
    }));
  };

  const displayItems = computed(() => {
    return quickBuyItems.value.length > 0 ? quickBuyItems.value : items.value;
  });

  const cartCount = computed(() => {
    return displayItems.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return displayItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  const isQuickBuyMode = computed(() => {
    return quickBuyItems.value.length > 0;
  });

  const fetchCart = async () => {
    try {
      isLoading.value = true;
      const res = await cartApi.getCart();
      items.value = normalizeCartItems(res?.items);
    } catch (e) {
      console.error('获取购物车失败:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const addToCart = async (product, quantity = 1, customOptions = null) => {
    try {
      const res = await cartApi.addToCart({
        productId: product._id,
        quantity,
        customOptions,
      });
      items.value = normalizeCartItems(res?.items);
      showToast('已添加到购物车');
      return true;
    } catch (e) {
      console.error('添加到购物车失败:', e);
      return false;
    }
  };

  const setQuickBuyItems = (product, quantity = 1, customOptions = null, _greetingCard = null) => {
    quickBuyItems.value = [
      {
        cartId: 'quick-buy-' + Date.now(),
        productId: product._id,
        productName: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        quantity,
        customOptions: customOptions || null,
        selected: true,
      },
    ];
  };

  const clearQuickBuyItems = () => {
    quickBuyItems.value = [];
  };

  const removeFromCart = async (cartId) => {
    try {
      const res = await cartApi.removeFromCart(cartId);
      items.value = normalizeCartItems(res?.items);
      showToast('已从购物车移除');
      return true;
    } catch (e) {
      console.error('移除购物车商品失败:', e);
      return false;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      const res = await cartApi.updateQuantity({
        cartId,
        quantity,
      });
      items.value = normalizeCartItems(res?.items);
      return true;
    } catch (e) {
      console.error('更新购物车数量失败:', e);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      items.value = normalizeCartItems(res?.items);
      quickBuyItems.value = [];
      return true;
    } catch (e) {
      console.error('清空购物车失败:', e);
      return false;
    }
  };

  return {
    items,
    quickBuyItems,
    displayItems,
    isLoading,
    cartCount,
    cartTotal,
    isQuickBuyMode,
    fetchCart,
    addToCart,
    setQuickBuyItems,
    clearQuickBuyItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
});

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref(null);
  const selectedDeliveryTime = ref(null);
  const selectedAddress = ref(null);
  const selectedGreetingCard = ref(null);
  const selectedPromotion = ref(null);

  const setCurrentOrder = (order) => {
    currentOrder.value = order;
  };

  const setDeliveryTime = (date, timeSlot) => {
    selectedDeliveryTime.value = { date, timeSlot };
  };

  const setAddress = (address) => {
    selectedAddress.value = address;
  };

  const setGreetingCard = (card, message, recipientName) => {
    selectedGreetingCard.value = { card, message, recipientName };
  };

  const setPromotion = (promotion) => {
    selectedPromotion.value = promotion;
  };

  const resetOrderData = () => {
    currentOrder.value = null;
    selectedDeliveryTime.value = null;
    selectedAddress.value = null;
    selectedGreetingCard.value = null;
    selectedPromotion.value = null;
  };

  return {
    currentOrder,
    selectedDeliveryTime,
    selectedAddress,
    selectedGreetingCard,
    selectedPromotion,
    setCurrentOrder,
    setDeliveryTime,
    setAddress,
    setGreetingCard,
    setPromotion,
    resetOrderData,
  };
});

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'));
  const token = ref(localStorage.getItem('token') || '');
  const addresses = ref(JSON.parse(localStorage.getItem('addresses') || '[]'));

  const isLoggedIn = computed(() => !!token.value);

  const setUser = (user, userToken) => {
    userInfo.value = user;
    token.value = userToken;
    localStorage.setItem('userInfo', JSON.stringify(user));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    userInfo.value = null;
    token.value = '';
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
  };

  const addAddress = (address) => {
    if (address.isDefault) {
      addresses.value.forEach((addr) => (addr.isDefault = false));
    }
    addresses.value.push({ ...address, id: Date.now().toString() });
    saveAddresses();
  };

  const updateAddress = (addressId, updates) => {
    const index = addresses.value.findIndex((a) => a.id === addressId);
    if (index > -1) {
      if (updates.isDefault) {
        addresses.value.forEach((addr) => (addr.isDefault = false));
      }
      addresses.value[index] = { ...addresses.value[index], ...updates };
      saveAddresses();
    }
  };

  const deleteAddress = (addressId) => {
    const index = addresses.value.findIndex((a) => a.id === addressId);
    if (index > -1) {
      addresses.value.splice(index, 1);
      saveAddresses();
    }
  };

  const saveAddresses = () => {
    localStorage.setItem('addresses', JSON.stringify(addresses.value));
  };

  return {
    userInfo,
    token,
    addresses,
    isLoggedIn,
    setUser,
    logout,
    addAddress,
    updateAddress,
    deleteAddress,
  };
});

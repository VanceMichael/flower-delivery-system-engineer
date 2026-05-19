<template>
  <div class="order-create-page">
    <van-nav-bar title="确认订单" left-arrow @click-left="goBack" />

    <van-cell-group inset title="收货地址">
      <van-cell v-if="selectedAddress" is-link @click="showAddressSelector = true">
        <template #default>
          <div class="address-info">
            <div class="address-name">
              <span>{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
            </div>
            <div class="address-detail">{{ selectedAddress.detail }}</div>
          </div>
        </template>
      </van-cell>
      <van-cell v-else title="请选择收货地址" is-link @click="showAddressSelector = true">
        <template #right-icon>
          <van-icon name="arrow" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="配送时间">
      <van-cell title="配送方式" is-link @click="showDeliveryPopup = true">
        <template #value>
          <span>{{ deliveryTypeText }}</span>
        </template>
      </van-cell>
      <van-cell v-if="deliveryType === 'scheduled'" title="预约时间">
        <template #value>
          <span>{{ deliveryTimeText }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="商品清单">
      <div class="order-item" v-for="item in cartItems" :key="item.cartId">
        <img :src="item.image || defaultImage" alt="" class="item-image" />
        <div class="item-info">
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-custom" v-if="getCustomOptionsDisplay(item).length > 0">
            <div class="custom-detail" v-for="opt in getCustomOptionsDisplay(item)" :key="opt.name">
              <span class="custom-name">{{ opt.name }}：{{ opt.value }}</span>
              <span class="custom-price" v-if="opt.price > 0">+¥{{ opt.price }}</span>
            </div>
          </div>
          <div class="item-price-row">
            <span class="item-price">¥{{ item.price + getCustomOptionsPrice(item) }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </van-cell-group>

    <van-cell-group inset title="贺卡信息" v-if="selectedGreetingCard">
      <van-cell title="贺卡模板">
        <template #value>
          <span>{{ selectedGreetingCard.card?.name || '未选择' }}</span>
        </template>
      </van-cell>
      <van-cell title="祝福语" v-if="selectedGreetingCard.message">
        <template #value>
          <span>{{ selectedGreetingCard.message }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="费用明细">
      <van-cell title="商品金额">
        <template #value>¥{{ baseGoodsAmount.toFixed(2) }}</template>
      </van-cell>
      <van-cell title="自定义选项费" v-if="customOptionsTotal > 0">
        <template #value>+¥{{ customOptionsTotal.toFixed(2) }}</template>
      </van-cell>
      <van-cell title="贺卡费" v-if="greetingCardPrice > 0">
        <template #value>+¥{{ greetingCardPrice.toFixed(2) }}</template>
      </van-cell>
      <van-cell title="配送费">
        <template #value>+¥{{ deliveryFee.toFixed(2) }}</template>
      </van-cell>
      <van-cell title="优惠金额" v-if="discountAmount > 0">
        <template #value>-¥{{ discountAmount.toFixed(2) }}</template>
      </van-cell>
      <van-cell title="实付金额">
        <template #value>¥{{ totalAmount.toFixed(2) }}</template>
      </van-cell>
    </van-cell-group>

    <van-popup
      v-model:show="showAddressSelector"
      round
      position="bottom"
      class="popup-address-selector"
      style="height: 60%"
    >
      <template #title>选择收货地址</template>
      <div class="address-list">
        <div
          class="address-item"
          :class="{ active: selectedAddress?.id === address.id }"
          v-for="address in addresses"
          :key="address.id"
          @click="selectAddress(address)"
        >
          <div class="address-name-row">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
            <van-tag v-if="address.isDefault" size="mini" type="primary">默认</van-tag>
          </div>
          <div class="address-detail">{{ address.detail }}</div>
        </div>
      </div>
      <div class="popup-footer">
        <van-button type="default" block class="add-address-btn" @click="goToAddAddress"
          >新增收货地址</van-button
        >
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showCalendar"
      type="single"
      :min-date="minDate"
      :max-date="maxDate"
      color="#1989fa"
      @confirm="onDateConfirm"
    />
    <van-popup v-model:show="showTimePicker" round position="bottom">
      <van-picker
        :columns="timeSlotColumns"
        title="选择时间段"
        @confirm="onTimeConfirm"
        @cancel="showTimePicker = false"
      />
    </van-popup>

    <van-popup
      v-model:show="showDeliveryPopup"
      round
      position="bottom"
      class="popup-delivery-selector"
    >
      <template #title>选择配送方式</template>
      <div class="delivery-options">
        <div
          class="delivery-option"
          :class="{ active: deliveryType === 'standard' }"
          @click="selectDeliveryType('standard')"
        >
          <div class="option-left">
            <div class="option-name">标准配送</div>
            <div class="option-desc">预计24小时内送达</div>
          </div>
          <div class="option-right">¥0</div>
        </div>
        <div
          class="delivery-option"
          :class="{ active: deliveryType === 'express' }"
          @click="selectDeliveryType('express')"
        >
          <div class="option-left">
            <div class="option-name">加急配送</div>
            <div class="option-desc">预计2-4小时送达</div>
          </div>
          <div class="option-right">¥20</div>
        </div>
        <div
          class="delivery-option"
          :class="{ active: deliveryType === 'scheduled' }"
          @click="selectDeliveryType('scheduled')"
        >
          <div class="option-left">
            <div class="option-name">预约配送</div>
            <div class="option-desc">指定时间送达</div>
          </div>
          <div class="option-right" v-if="deliveryType === 'scheduled'">{{ deliveryTimeText }}</div>
          <div class="option-right" v-else>选择时间</div>
        </div>
      </div>
      <div class="scheduled-time" v-if="deliveryType === 'scheduled'">
        <van-cell title="选择日期" is-link @click="openCalendar">
          <template #value>
            <span>{{ selectedDate || '请选择' }}</span>
          </template>
        </van-cell>
        <van-cell title="选择时段" is-link @click="openTimePicker">
          <template #value>
            <span>{{ selectedTimeSlot || '请选择' }}</span>
          </template>
        </van-cell>
      </div>
      <div class="popup-footer">
        <van-button type="primary" block class="confirm-btn" @click="showDeliveryPopup = false"
          >确认</van-button
        >
      </div>
    </van-popup>

    <div class="bottom-bar">
      <div class="total-section">
        <span class="total-label">实付:</span>
        <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
      </div>
      <van-button type="danger" :disabled="!canSubmit" @click="submitOrder">提交订单</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore, useOrderStore, useUserStore } from '@/store';
import { orderApi, promotionApi } from '@/api';
import { showToast, showSuccessToast } from 'vant';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const userStore = useUserStore();

const showAddressSelector = ref(false);
const showDeliveryPopup = ref(false);
const showCalendar = ref(false);
const showTimePicker = ref(false);

const deliveryType = ref('standard');
const selectedDate = ref('');
const selectedTimeSlot = ref('');
const deliveryFee = ref(0);

const cartItems = computed(() => cartStore.displayItems);
const addresses = computed(() => userStore.addresses);
const selectedAddress = computed(() => orderStore.selectedAddress);
const selectedGreetingCard = computed(() => orderStore.selectedGreetingCard);

const getCustomOptionsPrice = (item) => {
  if (!item.customOptions) return 0;
  let total = 0;
  const options = Object.values(item.customOptions);
  for (const opt of options) {
    if (typeof opt === 'object' && opt !== null) {
      total += Number(opt.price) || 0;
    }
  }
  return total;
};

const getCustomOptionsDisplay = (item) => {
  if (!item.customOptions) return [];
  const result = [];
  const keys = Object.keys(item.customOptions);
  for (const key of keys) {
    const opt = item.customOptions[key];
    if (typeof opt === 'object' && opt !== null) {
      result.push({
        name: key,
        value: opt.value,
        price: opt.price || 0,
      });
    } else {
      result.push({
        name: key,
        value: opt,
        price: 0,
      });
    }
  }
  return result;
};

const goodsAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const customPrice = getCustomOptionsPrice(item);
    return sum + (item.price + customPrice) * item.quantity;
  }, 0);
});

const customOptionsTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + getCustomOptionsPrice(item) * item.quantity;
  }, 0);
});

const baseGoodsAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const greetingCardPrice = computed(() => {
  return Number(selectedGreetingCard.value?.card?.price) || 0;
});

const discountAmount = computed(() => orderStore.selectedPromotion?.discount || 0);

const totalAmount = computed(() => {
  return Math.max(
    0,
    goodsAmount.value + greetingCardPrice.value + deliveryFee.value - discountAmount.value,
  );
});

const canSubmit = computed(() => {
  return selectedAddress.value && cartItems.value.length > 0;
});

const deliveryTypeText = computed(() => {
  const texts = { standard: '标准配送', express: '加急配送', scheduled: '预约配送' };
  return texts[deliveryType.value];
});

const deliveryTimeText = computed(() => {
  if (selectedDate.value && selectedTimeSlot.value) {
    return `${selectedDate.value} ${selectedTimeSlot.value}`;
  }
  return '选择时间';
});

const defaultImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flower%20placeholder%20image&image_size=square';

const minDate = new Date();
const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 30);

const timeSlots = [
  '09:00-11:00',
  '11:00-13:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
  '19:00-21:00',
];

const timeSlotColumns = timeSlots.map((slot) => ({ text: slot, value: slot }));

const selectAddress = (address) => {
  orderStore.setAddress(address);
  showAddressSelector.value = false;
};

const selectDeliveryType = (type) => {
  deliveryType.value = type;
  if (type === 'express') {
    deliveryFee.value = 20;
  } else {
    deliveryFee.value = 0;
  }
};

const onDateConfirm = (value) => {
  const date = new Date(value);
  selectedDate.value = `${date.getMonth() + 1}月${date.getDate()}日`;
  showCalendar.value = false;
};

const onTimeConfirm = ({ selectedOptions }) => {
  selectedTimeSlot.value = selectedOptions[0]?.text || selectedOptions[0]?.value;
  showTimePicker.value = false;
};

const openCalendar = () => {
  showCalendar.value = true;
};

const openTimePicker = () => {
  showTimePicker.value = true;
};

const goBack = () => {
  router.back();
};

const goToAddAddress = () => {
  showAddressSelector.value = false;
  router.push('/address');
};

const submitOrder = async () => {
  if (!selectedAddress.value) {
    showToast('请选择收货地址');
    return;
  }

  const orderItems = cartItems.value.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    image: item.image?.replace(/`/g, '').trim() || '',
    price: item.price,
    quantity: item.quantity,
    customOptions: item.customOptions,
  }));

  let scheduledDate = null;
  if (deliveryType.value === 'scheduled' && selectedDate.value) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const match = selectedDate.value.match(/(\d+)月(\d+)日/);
    if (match) {
      const month = parseInt(match[1]) - 1;
      const day = parseInt(match[2]);
      scheduledDate = new Date(currentYear, month, day);
      if (scheduledDate < today && month < today.getMonth()) {
        scheduledDate = new Date(currentYear + 1, month, day);
      }
    }
  }

  let greetingCardData = null;
  if (selectedGreetingCard.value) {
    const hasMessage = selectedGreetingCard.value.message?.trim();
    const hasRecipient = selectedGreetingCard.value.recipientName?.trim();
    const hasCard = selectedGreetingCard.value.card?._id;
    if (hasMessage || hasRecipient || hasCard) {
      greetingCardData = {
        templateId: selectedGreetingCard.value.card?._id,
        message: hasMessage || '',
        recipientName: hasRecipient || '',
      };
    }
  }

  const orderData = {
    userId: userStore.userInfo?._id,
    items: orderItems,
    recipient: {
      name: selectedAddress.value.name,
      phone: selectedAddress.value.phone,
      address: selectedAddress.value.detail,
    },
    delivery: {
      type: deliveryType.value,
      scheduledDate: scheduledDate,
      scheduledTimeSlot: selectedTimeSlot.value || null,
      deliveryFee: deliveryFee.value,
    },
    greetingCard: greetingCardData,
  };

  try {
    const res = await orderApi.create(orderData);
    showSuccessToast('订单创建成功');
    await cartStore.clearCart();
    orderStore.resetOrderData();
    router.replace(`/orders/${res.orderId}`);
  } catch (e) {
    showToast(e?.message || '订单创建失败，请重试');
  }
};

onMounted(() => {
  if (addresses.value.length > 0 && !selectedAddress.value) {
    const defaultAddr = addresses.value.find((a) => a.isDefault) || addresses.value[0];
    orderStore.setAddress(defaultAddr);
  }
});
</script>

<style scoped>
.order-create-page {
  padding-bottom: 70px;
}

.address-info {
  width: 100%;
}

.address-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.address-name .name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.address-name .phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 13px;
  color: #666;
}

.order-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 4px;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-custom {
  margin: 6px 0;
}

.item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
}

.item-quantity {
  font-size: 13px;
  color: #999;
}

.discount {
  color: #ff4d4f !important;
}

.total {
  color: #ff4d4f !important;
  font-weight: bold;
}

.address-list {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.address-item {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 2px solid transparent;
}

.address-item.active {
  border-color: #1989fa;
  background: #eaf4ff;
}

.address-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.address-name-row .name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.address-name-row .phone {
  font-size: 13px;
  color: #666;
}

.popup-address-selector,
.popup-delivery-selector {
  overflow-x: hidden;
  max-width: 100vw;
}

.popup-address-selector :deep(*),
.popup-delivery-selector :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}

.popup-footer {
  padding: 15px;
  background: #fff;
}

.add-address-btn {
  margin: 0;
}

.delivery-options {
  padding: 10px;
}

.delivery-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 2px solid transparent;
}

.delivery-option.active {
  border-color: #1989fa;
  background: #eaf4ff;
}

.option-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #999;
}

.option-right {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
}

.scheduled-time {
  padding: 0 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
}

.confirm-btn {
  margin: 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}

.total-section {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 14px;
  color: #666;
  margin-right: 6px;
}

.total-price {
  font-size: 20px;
  color: #ff4d4f;
  font-weight: bold;
}
</style>

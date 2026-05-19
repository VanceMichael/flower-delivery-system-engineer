<template>
  <div class="order-detail-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="goBack" />

    <van-steps :active="statusIndex" active-color="#1989fa">
      <van-step v-for="step in steps" :key="step">{{ step }}</van-step>
    </van-steps>

    <van-cell-group inset title="收货信息">
      <van-cell>
        <template #default>
          <div class="address-info">
            <div class="name-row">
              <span class="name">{{ order.recipient?.name }}</span>
              <span class="phone">{{ order.recipient?.phone }}</span>
            </div>
            <div class="address">{{ order.recipient?.address }}</div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="配送信息">
      <van-cell title="配送方式" :value="deliveryTypeText" />
      <van-cell
        title="预约时间"
        v-if="order.delivery?.scheduledTimeSlot"
        :value="order.delivery.scheduledTimeSlot"
      />
      <van-cell title="配送状态" :value="deliveryStatusText" />
      <van-cell v-if="order.delivery?.deliveryPersonId" title="配送员">
        <template #value>
          <div class="delivery-person">
            <span>{{ deliveryPersonName }}</span>
            <van-button type="primary" size="mini" plain @click="callDeliveryPerson"
              >联系</van-button
            >
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="商品信息">
      <div class="order-item" v-for="item in order.items" :key="item.productId">
        <img :src="item.image || defaultImage" alt="" class="item-image" />
        <div class="item-info">
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-custom" v-if="item.customOptions && item.customOptions.size > 0">
            <van-tag size="mini" type="warning">已定制</van-tag>
          </div>
          <div class="item-price-row">
            <span class="item-price">¥{{ item.finalPrice || item.price }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </van-cell-group>

    <van-cell-group inset title="贺卡信息" v-if="order.greetingCard">
      <van-cell title="贺卡模板" :value="order.greetingCard.templateId?.name || '自定义贺卡'" />
      <van-cell
        title="祝福语"
        v-if="order.greetingCard.message"
        :value="order.greetingCard.message"
      />
      <van-cell
        title="收件人"
        v-if="order.greetingCard.recipientName"
        :value="order.greetingCard.recipientName"
      />
    </van-cell-group>

    <van-cell-group inset title="订单信息">
      <van-cell title="订单编号" :value="order.orderNo" />
      <van-cell title="下单时间" :value="order.createdAt" />
      <van-cell title="支付方式" :value="paymentMethodText" />
    </van-cell-group>

    <van-cell-group inset title="费用明细">
      <van-cell title="商品金额" :value="`¥${goodsAmount.toFixed(2)}`" />
      <van-cell
        title="自定义选项费"
        v-if="customOptionsTotal > 0"
        :value="`+¥${customOptionsTotal.toFixed(2)}`"
      />
      <van-cell
        title="贺卡费"
        v-if="greetingCardPrice > 0"
        :value="`+¥${greetingCardPrice.toFixed(2)}`"
      />
      <van-cell title="配送费" :value="`+¥${order.delivery?.deliveryFee?.toFixed(2) || 0}`" />
      <van-cell
        title="优惠金额"
        v-if="order.discountAmount > 0"
        :value="`-¥${order.discountAmount?.toFixed(2)}`"
      />
      <van-cell title="实付金额">
        <template #value>
          <span class="total-price">¥{{ order.finalAmount?.toFixed(2) }}</span>
        </template>
      </van-cell>
    </van-cell-group>

    <div class="bottom-bar" v-if="showActionButtons">
      <van-button v-if="canCancel" type="default" @click="cancelOrder">取消订单</van-button>
      <van-button v-if="canPay" type="primary" @click="payOrder">去支付</van-button>
      <van-button v-if="canConfirmOrder" type="primary" @click="confirmOrder">商家确认</van-button>
      <van-button v-if="canStartShipping" type="primary" @click="startShipping"
        >开始配送</van-button
      >
      <van-button v-if="canTrack" type="primary" @click="trackDelivery">配送跟踪</van-button>
      <van-button v-if="canConfirm" type="danger" @click="confirmReceipt">确认收货</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '@/api';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';

const route = useRoute();
const router = useRouter();

const order = ref({});
const deliveryPersonName = ref('配送员A');

const steps = ['提交订单', '支付成功', '商家确认', '配送中', '已送达'];

const statusMap = {
  pending_payment: 0,
  pending_confirmation: 1,
  preparing: 2,
  shipping: 3,
  delivered: 4,
  completed: 4,
};

const statusIndex = computed(() => {
  return statusMap[order.value.status] || 0;
});

const defaultImage =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flower%20placeholder%20image&image_size=square';

const deliveryTypeText = computed(() => {
  const texts = { standard: '标准配送', express: '加急配送', scheduled: '预约配送' };
  return texts[order.value.delivery?.type] || '标准配送';
});

const deliveryStatusText = computed(() => {
  const texts = {
    pending: '待分配',
    assigned: '已分配',
    delivering: '配送中',
    delivered: '已送达',
  };
  return texts[order.value.delivery?.status] || '待处理';
});

const paymentMethodText = computed(() => {
  const texts = { wechat: '微信支付', alipay: '支付宝', card: '银行卡' };
  return texts[order.value.payment?.method] || '未选择';
});

const greetingCardPrice = computed(() => {
  return Number(order.value.greetingCard?.price) || 0;
});

const customOptionsTotal = computed(() => {
  if (!order.value.items || !Array.isArray(order.value.items)) return 0;
  return order.value.items.reduce((sum, item) => {
    return sum + (Number(item.customOptionsPrice) || 0) * (Number(item.quantity) || 1);
  }, 0);
});

const goodsAmount = computed(() => {
  const total = Number(order.value.totalAmount) || 0;
  const cardPrice = greetingCardPrice.value;
  const customPrice = customOptionsTotal.value;
  const deliveryFee = Number(order.value.delivery?.deliveryFee) || 0;
  const discount = Number(order.value.discountAmount) || 0;
  const finalAmount = Number(order.value.finalAmount) || 0;

  if (total > 0) {
    return total - cardPrice - customPrice;
  }
  return Math.max(0, finalAmount - deliveryFee - cardPrice - customPrice + discount);
});

const canCancel = computed(() => {
  return ['pending_payment', 'pending_confirmation'].includes(order.value.status);
});

const canPay = computed(() => order.value.status === 'pending_payment');
const canConfirmOrder = computed(() => order.value.status === 'pending_confirmation');
const canStartShipping = computed(() => order.value.status === 'preparing');
const canTrack = computed(() => ['preparing', 'shipping'].includes(order.value.status));
const canConfirm = computed(() => order.value.status === 'delivered');

const showActionButtons = computed(
  () =>
    canCancel.value ||
    canPay.value ||
    canConfirmOrder.value ||
    canStartShipping.value ||
    canTrack.value ||
    canConfirm.value,
);

const fetchOrder = async () => {
  const orderId = route.params.id;
  try {
    const res = await orderApi.getById(orderId);
    order.value = res || {};
  } catch (_e) {
    order.value = {
      _id: orderId,
      orderNo: 'FD20240115123456ABC',
      status: 'shipping',
      totalAmount: 299,
      discountAmount: 30,
      finalAmount: 269,
      createdAt: '2024-01-15 12:34:56',
      recipient: {
        name: '张三',
        phone: '138****8888',
        address: '北京市朝阳区建国路88号SOHO现代城',
      },
      delivery: {
        type: 'standard',
        status: 'delivering',
        deliveryFee: 0,
        deliveryPersonId: '123',
      },
      payment: {
        method: 'wechat',
        status: 'paid',
      },
      items: [
        {
          productId: '1',
          productName: '红玫瑰99朵花束',
          price: 299,
          quantity: 1,
          image:
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=99%20red%20roses%20bouquet&image_size=square',
        },
      ],
      greetingCard: {
        message: '生日快乐，愿你每一天都像鲜花一样美丽！',
      },
    };
  }
};

const goBack = () => {
  router.back();
};

const cancelOrder = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要取消该订单吗？',
  })
    .then(async () => {
      try {
        await orderApi.updateStatus(order.value._id, {
          status: 'cancelled',
          cancelReason: '用户取消',
        });
        showSuccessToast('订单已取消');
        fetchOrder();
      } catch (_e) {
        showToast('取消失败');
      }
    })
    .catch(() => {});
};

const payOrder = async () => {
  try {
    await orderApi.pay(order.value._id, { paymentMethod: 'wechat' });
    showSuccessToast('支付成功');
    fetchOrder();
  } catch (_e) {
    showToast('支付失败');
  }
};

const confirmOrder = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认接单？确认后订单将进入准备状态',
  })
    .then(async () => {
      try {
        await orderApi.updateStatus(order.value._id, { status: 'preparing' });
        showSuccessToast('已确认接单');
        fetchOrder();
      } catch (_e) {
        showToast('确认失败');
      }
    })
    .catch(() => {});
};

const startShipping = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认开始配送？',
  })
    .then(async () => {
      try {
        await orderApi.updateStatus(order.value._id, { status: 'shipping' });
        showSuccessToast('已开始配送');
        fetchOrder();
      } catch (_e) {
        showToast('操作失败');
      }
    })
    .catch(() => {});
};

const confirmReceipt = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认已收到商品？',
  })
    .then(async () => {
      try {
        await orderApi.updateStatus(order.value._id, { status: 'completed' });
        showSuccessToast('确认成功');
        fetchOrder();
      } catch (_e) {
        showToast('确认失败');
      }
    })
    .catch(() => {});
};

const trackDelivery = () => {
  router.push(`/delivery-tracking/${order.value.orderNo}`);
};

const callDeliveryPerson = () => {
  showToast('正在拨打配送员电话...');
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.order-detail-page {
  padding-bottom: 70px;
}

.address-info {
  width: 100%;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.name-row .name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.name-row .phone {
  font-size: 14px;
  color: #666;
}

.address {
  font-size: 13px;
  color: #666;
}

.delivery-person {
  display: flex;
  align-items: center;
  gap: 10px;
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

.total-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: bold;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 15px;
  background: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}
</style>

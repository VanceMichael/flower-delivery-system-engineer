<template>
  <div class="order-list-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div v-if="orders.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无订单" />
        </div>
        <div v-else class="order-list">
          <div class="order-item" v-for="order in orders" :key="order._id" @click="goToOrderDetail(order._id)">
            <div class="order-header">
              <span class="order-no">{{ order.orderNo }}</span>
              <span class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
            </div>
            <div class="order-items">
              <div class="order-product" v-for="item in order.items" :key="item.productId">
                <img :src="item.image || defaultImage" alt="" class="product-image" />
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-price-row">
                    <span class="product-price">¥{{ item.price }}</span>
                    <span class="product-quantity">x{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">共{{ order.items.length }}件商品 实付：<span class="total-price">¥{{ order.finalAmount?.toFixed(2) }}</span></span>
              <div class="order-actions">
                <van-button v-if="order.status === 'pending_payment'" type="primary" size="mini" @click.stop="payOrder(order)">去支付</van-button>
                <van-button v-if="order.status === 'pending_confirmation'" type="primary" size="mini" @click.stop="confirmOrder(order)">商家确认</van-button>
                <van-button v-if="order.status === 'preparing'" type="primary" size="mini" @click.stop="startShipping(order)">开始配送</van-button>
                <van-button v-if="order.status === 'pending_payment' || order.status === 'pending_confirmation'" type="default" size="mini" @click.stop="cancelOrder(order)">取消订单</van-button>
                <van-button v-if="order.status === 'delivered'" type="danger" size="mini" @click.stop="confirmReceipt(order)">确认收货</van-button>
                <van-button v-if="['preparing', 'shipping'].includes(order.status)" type="primary" size="mini" plain @click.stop="trackDelivery(order)">配送跟踪</van-button>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '@/api';
import { useUserStore } from '@/store';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';

const props = defineProps({
  statusFilter: {
    type: [String, Array],
    default: null
  }
});

const router = useRouter();
const userStore = useUserStore();

const orders = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);
const pageSize = 10;

const defaultImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flower%20placeholder%20image&image_size=square';

const statusMap = {
  'pending_payment': '待付款',
  'pending_confirmation': '待确认',
  'preparing': '准备中',
  'shipping': '配送中',
  'delivered': '已送达',
  'completed': '已完成',
  'cancelled': '已取消',
  'refunded': '已退款'
};

const getStatusText = (status) => {
  return statusMap[status] || '未知';
};

const getStatusClass = (status) => {
  const classMap = {
    'pending_payment': 'status-pending',
    'pending_confirmation': 'status-pending',
    'preparing': 'status-preparing',
    'shipping': 'status-shipping',
    'delivered': 'status-delivered',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'refunded': 'status-refunded'
  };
  return classMap[status] || '';
};

const fetchOrders = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    const params = {
      page: page.value,
      limit: pageSize
    };

    if (props.statusFilter) {
      params.status = props.statusFilter;
    }

    const userId = userStore.userInfo?._id || userStore.userInfo?.id;
    if (userId) {
      params.userId = userId;
    }

    const res = await orderApi.getAll(params);
    const newOrders = res?.orders || [];

    if (refreshing.value) {
      orders.value = newOrders;
    } else {
      orders.value = [...orders.value, ...newOrders];
    }

    page.value++;
    finished.value = newOrders.length < pageSize;
  } catch (e) {
    console.error('获取订单列表失败:', e);
    showToast('获取订单列表失败');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const onLoad = () => {
  fetchOrders();
};

const onRefresh = () => {
  page.value = 1;
  finished.value = false;
  refreshing.value = true;
  fetchOrders();
};

const goToOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`);
};

const payOrder = async (order) => {
  try {
    await orderApi.pay(order._id, { paymentMethod: 'wechat' });
    showSuccessToast('支付成功');
    onRefresh();
  } catch (e) {
    showToast('支付失败');
  }
};

const cancelOrder = (order) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要取消该订单吗？'
  }).then(async () => {
    try {
      await orderApi.updateStatus(order._id, { status: 'cancelled', cancelReason: '用户取消' });
      showSuccessToast('订单已取消');
      onRefresh();
    } catch (e) {
      showToast('取消失败');
    }
  }).catch(() => {});
};

const confirmOrder = (order) => {
  showConfirmDialog({
    title: '提示',
    message: '确认接单？确认后订单将进入准备状态'
  }).then(async () => {
    try {
      await orderApi.updateStatus(order._id, { status: 'preparing' });
      showSuccessToast('已确认接单');
      onRefresh();
    } catch (e) {
      showToast('确认失败');
    }
  }).catch(() => {});
};

const startShipping = (order) => {
  showConfirmDialog({
    title: '提示',
    message: '确认开始配送？'
  }).then(async () => {
    try {
      await orderApi.updateStatus(order._id, { status: 'shipping' });
      showSuccessToast('已开始配送');
      onRefresh();
    } catch (e) {
      showToast('操作失败');
    }
  }).catch(() => {});
};

const confirmReceipt = (order) => {
  showConfirmDialog({
    title: '提示',
    message: '确认已收到商品？'
  }).then(async () => {
    try {
      await orderApi.updateStatus(order._id, { status: 'completed' });
      showSuccessToast('确认成功');
      onRefresh();
    } catch (e) {
      showToast('确认失败');
    }
  }).catch(() => {});
};

const trackDelivery = (order) => {
  router.push(`/delivery-tracking/${order.orderNo}`);
};

watch(
  () => props.statusFilter,
  () => {
    onRefresh();
  }
);

onMounted(() => {
  onRefresh();
});
</script>

<style scoped>
.order-list-page {
  min-height: 100%;
  background: #f7f8fa;
  padding-bottom: 10px;
}

.empty-state {
  padding: 40px 0;
}

.order-list {
  padding: 10px;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.order-no {
  font-size: 12px;
  color: #999;
}

.order-status {
  font-size: 14px;
  font-weight: bold;
}

.status-pending {
  color: #ff976a;
}

.status-preparing {
  color: #1989fa;
}

.status-shipping {
  color: #07c160;
}

.status-delivered {
  color: #1989fa;
}

.status-completed {
  color: #969799;
}

.status-cancelled,
.status-refunded {
  color: #969799;
}

.order-items {
  margin-bottom: 10px;
}

.order-product {
  display: flex;
  padding: 8px 0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
}

.product-quantity {
  font-size: 12px;
  color: #999;
}

.order-footer {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-size: 12px;
  color: #666;
}

.total-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: 8px;
}
</style>

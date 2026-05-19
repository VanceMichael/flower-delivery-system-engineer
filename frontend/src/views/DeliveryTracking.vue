<template>
  <div class="delivery-tracking-page">
    <van-nav-bar title="配送跟踪" left-arrow @click-left="goBack" />

    <div class="tracking-info">
      <div class="order-status">
        <van-icon name="logistics" size="32" color="#1989fa" />
        <div class="status-text">
          <div class="main-status">{{ currentStatus }}</div>
          <div class="sub-status">预计今天送达</div>
        </div>
      </div>
    </div>

    <van-cell-group inset title="配送员信息" v-if="deliveryPerson">
      <van-cell>
        <template #default>
          <div class="delivery-person-info">
            <van-avatar size="48" color="#1989fa">{{ deliveryPerson.name?.charAt(0) }}</van-avatar>
            <div class="person-detail">
              <div class="person-name">{{ deliveryPerson.name }}</div>
              <div class="person-phone">{{ deliveryPerson.phone }}</div>
            </div>
            <van-button type="primary" size="small" @click="callPerson">联系</van-button>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="配送路线">
      <van-steps direction="vertical" :active="activeStep" active-color="#1989fa">
        <van-step v-for="(step, index) in steps" :key="index">
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-time" v-if="step.time">{{ step.time }}</div>
          </div>
        </van-step>
      </van-steps>
    </van-cell-group>

    <van-cell-group inset title="订单信息">
      <van-cell title="订单编号" :value="orderNo" />
      <van-cell title="收货人" :value="recipientInfo" />
      <van-cell title="收货地址">
        <template #value>
          <div class="address-text">{{ address }}</div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '@/api';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();

const orderNo = ref('');
const currentStatus = ref('配送中');
const deliveryPerson = ref({ name: '李师傅', phone: '138****8888' });
const address = ref('北京市朝阳区建国路88号SOHO现代城');
const recipientInfo = ref('张三 138****8888');

const steps = ref([
  { title: '订单已确认', time: '2024-01-15 14:30' },
  { title: '商家已接单', time: '2024-01-15 14:35' },
  { title: '商品已出库', time: '2024-01-15 15:00' },
  { title: '配送员已接单', time: '2024-01-15 15:10' },
  { title: '商品正在配送中', time: '2024-01-15 15:30' },
  { title: '已送达', time: '' },
]);

const activeStep = computed(() => {
  const index = steps.value.findIndex((step) => !step.time);
  return index > -1 ? index : steps.value.length;
});

const goBack = () => {
  router.back();
};

const callPerson = () => {
  showToast('正在拨打配送员电话...');
};

onMounted(() => {
  orderNo.value = route.params.orderNo || 'FD20240115123456ABC';
});
</script>

<style scoped>
.delivery-tracking-page {
  padding-bottom: 20px;
}

.tracking-info {
  padding: 20px;
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
}

.order-status {
  display: flex;
  align-items: center;
}

.status-text {
  margin-left: 15px;
}

.main-status {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.sub-status {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.delivery-person-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.person-detail {
  flex: 1;
  margin-left: 12px;
}

.person-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.person-phone {
  font-size: 13px;
  color: #666;
}

.step-content {
  padding-right: 10px;
}

.step-title {
  font-size: 14px;
  color: #333;
}

.step-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.address-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
</style>

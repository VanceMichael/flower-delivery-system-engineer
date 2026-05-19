<template>
  <div class="promotions-page page-container">
    <van-nav-bar title="节日活动" left-arrow @click-left="goBack" />

    <div v-if="activePromotions.length > 0" class="active-promotions">
      <div class="section-title">正在进行的活动</div>
      <div
        v-for="promo in activePromotions"
        :key="promo._id"
        class="promotion-banner"
        @click="goToPromotion(promo)"
      >
        <img :src="promo.bannerImage || defaultBanner" alt="" class="banner-image" />
        <div class="promotion-info">
          <div class="promotion-name">
            {{ promo.name }}
          </div>
          <div class="promotion-discount">
            <span v-if="promo.discountType === 'percentage'">{{ promo.discountValue }}折优惠</span>
            <span v-else>立减{{ promo.discountValue }}元</span>
          </div>
          <div class="promotion-time">
            {{ formatDate(promo.startDate) }} - {{ formatDate(promo.endDate) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="upcomingPromotions.length > 0" class="upcoming-promotions">
      <div class="section-title">即将开始</div>
      <div
        v-for="promo in upcomingPromotions"
        :key="promo._id"
        class="promotion-card"
        @click="goToPromotion(promo)"
      >
        <img :src="promo.bannerImage || defaultBanner" alt="" class="card-image" />
        <div class="card-info">
          <div class="card-name">
            {{ promo.name }}
          </div>
          <div class="card-discount">
            <span v-if="promo.discountType === 'percentage'">{{ promo.discountValue }}折</span>
            <span v-else>减{{ promo.discountValue }}元</span>
          </div>
          <div class="card-time">{{ formatDate(promo.startDate) }}开始</div>
        </div>
      </div>
    </div>

    <van-empty v-else description="暂无活动" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { promotionApi } from '@/api';

const router = useRouter();

const activePromotions = ref([]);
const upcomingPromotions = ref([]);

const defaultBanner =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flower%20promotion%20banner&image_size=landscape_16_9';

const fetchPromotions = async () => {
  try {
    const activeRes = await promotionApi.getActive();
    const upcomingRes = await promotionApi.getUpcoming();
    activePromotions.value = activeRes || [];
    upcomingPromotions.value = upcomingRes || [];
  } catch (_e) {
    activePromotions.value = [
      {
        _id: '1',
        name: '情人节专属特惠',
        discountType: 'percentage',
        discountValue: 80,
        startDate: '2024-02-10',
        endDate: '2024-02-14',
        bannerImage:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=valentines%20day%20flower%20promotion%20banner&image_size=landscape_16_9',
      },
      {
        _id: '2',
        name: '母亲节感恩活动',
        discountType: 'fixed',
        discountValue: 30,
        startDate: '2024-05-08',
        endDate: '2024-05-12',
        bannerImage:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mothers%20day%20flower%20promotion%20banner&image_size=landscape_16_9',
      },
    ];
  }
};

const formatDate = (date) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const goBack = () => {
  router.back();
};

const goToPromotion = (promo) => {
  router.push(`/promotions/${promo._id}`);
};

onMounted(() => {
  fetchPromotions();
});
</script>

<style scoped>
.promotions-page {
  padding-bottom: 20px;
  background: #f7f8fa;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 15px;
  background: #fff;
}

.promotion-banner {
  margin: 10px 15px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.banner-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.promotion-info {
  padding: 12px;
}

.promotion-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.promotion-discount {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
  margin-bottom: 4px;
}

.promotion-time {
  font-size: 12px;
  color: #999;
}

.upcoming-promotions {
  margin-top: 10px;
}

.promotion-card {
  display: flex;
  margin: 0 15px 10px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.card-image {
  width: 100px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-discount {
  font-size: 13px;
  color: #ff4d4f;
  font-weight: bold;
}

.card-time {
  font-size: 11px;
  color: #999;
}
</style>

<template>
  <div class="card-list">
    <van-grid :column-num="2" :gutter="10" v-if="cards.length > 0">
      <van-grid-item v-for="card in cards" :key="card._id">
        <div class="card-item" @click="selectCard(card)">
          <img :src="card.image" alt="" class="card-image" />
          <div class="card-name">{{ card.name }}</div>
          <div class="card-price" v-if="card.isPremium && card.price > 0">¥{{ card.price }}</div>
          <div class="card-free" v-else>免费</div>
        </div>
      </van-grid-item>
    </van-grid>
    <van-empty description="暂无贺卡" v-else />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { greetingCardApi } from '@/api';

const props = defineProps({
  category: {
    type: String,
    default: null,
  },
});

const router = useRouter();

const cards = ref([]);

const fetchCards = async () => {
  try {
    let res;
    if (props.category) {
      res = await greetingCardApi.getByCategory(props.category);
    } else {
      const result = await greetingCardApi.getAll({ limit: 20 });
      res = result?.cards || [];
    }
    cards.value = res || [];
  } catch (e) {
    cards.value = [
      {
        _id: '1',
        name: '浪漫爱情卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20love%20greeting%20card&image_size=square',
        isPremium: false,
        price: 0,
      },
      {
        _id: '2',
        name: '生日祝福卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=birthday%20greeting%20card&image_size=square',
        isPremium: false,
        price: 0,
      },
      {
        _id: '3',
        name: '感恩卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=thanksgiving%20greeting%20card&image_size=square',
        isPremium: true,
        price: 20,
      },
      {
        _id: '4',
        name: '节日贺卡',
        image:
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=festival%20greeting%20card&image_size=square',
        isPremium: false,
        price: 0,
      },
    ];
  }
};

const selectCard = (card) => {
  router.push(`/greeting-cards/${card._id}`);
};

watch(
  () => props.category,
  () => {
    fetchCards();
  },
);

onMounted(() => {
  fetchCards();
});
</script>

<style scoped>
.card-list {
  padding: 10px;
}

.card-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  padding-bottom: 10px;
}

.card-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.card-name {
  padding: 8px 8px 4px;
  font-size: 13px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-price {
  font-size: 12px;
  color: #ff4d4f;
  text-align: center;
  font-weight: bold;
}

.card-free {
  font-size: 12px;
  color: #07c160;
  text-align: center;
}
</style>

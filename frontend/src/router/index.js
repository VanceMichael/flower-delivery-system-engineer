import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: { title: '商品列表' },
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情' },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '我的订单', requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true },
  },
  {
    path: '/order-create',
    name: 'OrderCreate',
    component: () => import('@/views/OrderCreate.vue'),
    meta: { title: '创建订单', requiresAuth: true },
  },
  {
    path: '/delivery',
    name: 'Delivery',
    component: () => import('@/views/Delivery.vue'),
    meta: { title: '配送管理' },
  },
  {
    path: '/delivery-tracking/:orderNo',
    name: 'DeliveryTracking',
    component: () => import('@/views/DeliveryTracking.vue'),
    meta: { title: '配送跟踪' },
  },
  {
    path: '/greeting-cards',
    name: 'GreetingCards',
    component: () => import('@/views/GreetingCards.vue'),
    meta: { title: '贺卡选择' },
  },
  {
    path: '/greeting-cards/:id',
    name: 'GreetingCardDetail',
    component: () => import('@/views/GreetingCardDetail.vue'),
    meta: { title: '贺卡详情' },
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: () => import('@/views/Promotions.vue'),
    meta: { title: '节日活动' },
  },
  {
    path: '/promotions/:id',
    name: 'PromotionDetail',
    component: () => import('@/views/PromotionDetail.vue'),
    meta: { title: '活动详情' },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心' },
  },
  {
    path: '/delivery-schedule',
    name: 'DeliverySchedule',
    component: () => import('@/views/DeliverySchedule.vue'),
    meta: { title: '预约配送' },
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/Address.vue'),
    meta: { title: '收货地址', requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '鲜花配送管理系统';

  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  next();
});

export default router;

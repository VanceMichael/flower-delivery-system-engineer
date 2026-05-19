<template>
  <div class="register-page page-container">
    <van-nav-bar title="注册账号" left-arrow @click-left="goBack" />

    <div class="register-header">
      <div class="logo">
        <van-icon name="plus" size="48" color="#ff6b9d" />
      </div>
      <div class="title">创建新账号</div>
      <div class="subtitle">加入鲜花配送系统</div>
    </div>

    <div class="register-form">
      <van-form @submit="onRegister">
        <van-field
          v-model="formData.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名（4-20位）"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />

        <van-field
          v-model="formData.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
          ]"
        />

        <van-field
          v-model="formData.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]"
        />

        <van-field
          v-model="formData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码（至少6位）"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' },
          ]"
        />

        <van-field
          v-model="formData.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[{ required: true, message: '请再次输入密码' }]"
        />

        <div class="form-actions">
          <van-button type="primary" size="large" block native-type="submit" :loading="loading">
            注册
          </van-button>
          <div class="links">
            <span class="link" @click="goToLogin">已有账号？去登录</span>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '@/api';
import { useUserStore } from '@/store';
import { showToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
});

const goBack = () => {
  router.back();
};

const goToLogin = () => {
  router.push('/login');
};

const onRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    showToast('两次输入的密码不一致');
    return;
  }

  if (formData.username.length < 4 || formData.username.length > 20) {
    showToast('用户名需要4-20位');
    return;
  }

  loading.value = true;
  try {
    const result = await authApi.register({
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (result?.token && result?.user) {
      userStore.setUser(result.user, result.token);
      showToast('注册成功');
      router.replace('/home');
    }
  } catch (error) {
    console.error('注册失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, #fff5f7 0%, #ffeef2 100%);
  min-height: 100vh;
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 10px;
}

.logo {
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(255, 107, 157, 0.2);
  margin-bottom: 16px;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: #999;
}

.register-form {
  padding: 16px;
}

.form-actions {
  margin-top: 24px;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.link {
  font-size: 13px;
  color: #1989fa;
}
</style>

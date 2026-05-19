<template>
  <div class="login-page page-container">
    <van-nav-bar title="登录" left-arrow @click-left="goBack" />

    <div class="login-header">
      <div class="logo">
        <van-icon name="flower-o" size="48" color="#ff6b9d" />
      </div>
      <div class="title">鲜花配送系统</div>
      <div class="subtitle">用鲜花传递美好</div>
    </div>

    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-field
          v-model="loginForm.username"
          name="username"
          label="账号"
          placeholder="请输入用户名或邮箱"
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <template #left-icon>
            <van-icon name="user-o" />
          </template>
        </van-field>

        <van-field
          v-model="loginForm.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #left-icon>
            <van-icon name="lock" />
          </template>
        </van-field>

        <div class="form-actions">
          <van-button type="primary" size="large" block native-type="submit" :loading="loading">
            登录
          </van-button>
          <div class="links">
            <span class="link" @click="goToRegister">注册账号</span>
            <span class="link">忘记密码</span>
          </div>
        </div>
      </van-form>

      <div class="demo-accounts">
        <div class="demo-title">演示账号（点击快速登录）：</div>
        <div class="demo-item" @click="quickLogin('admin', '123456')">
          <van-icon name="manager-o" />
          <span>管理员：admin / 123456</span>
        </div>
        <div class="demo-item" @click="quickLogin('user1', '123456')">
          <van-icon name="user-o" />
          <span>普通用户：user1 / 123456</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authApi } from '@/api';
import { useUserStore } from '@/store';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const goBack = () => {
  router.back();
};

const goToRegister = () => {
  router.push('/register');
};

const quickLogin = (username, password) => {
  loginForm.username = username;
  loginForm.password = password;
  onSubmit();
};

const onSubmit = async () => {
  if (!loginForm.username || !loginForm.password) {
    showToast('请输入账号和密码');
    return;
  }

  loading.value = true;
  try {
    const result = await authApi.login({
      username: loginForm.username,
      password: loginForm.password,
    });

    if (result?.token && result?.user) {
      userStore.setUser(result.user, result.token);
      showToast('登录成功');

      const redirect = route.query.redirect || '/home';
      router.replace(redirect);
    }
  } catch (error) {
    console.error('登录失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #fff5f7 0%, #ffeef2 100%);
  min-height: 100vh;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 20px;
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
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: #999;
}

.login-form {
  padding: 16px;
}

.form-actions {
  margin-top: 24px;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.link {
  font-size: 13px;
  color: #1989fa;
}

.demo-accounts {
  margin-top: 32px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.demo-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.demo-item:active {
  background: #ebedf0;
}
</style>

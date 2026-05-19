<template>
  <div class="address-page">
    <van-nav-bar
      title="收货地址"
      left-arrow
      @click-left="goBack"
      right-text="新增"
      @click-right="showAddPopup = true"
    />

    <van-cell-group v-if="addresses.length > 0">
      <div class="address-item" v-for="address in addresses" :key="address.id">
        <van-cell>
          <template #default>
            <div class="address-info">
              <div class="name-row">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
                <van-tag v-if="address.isDefault" size="mini" type="primary">默认</van-tag>
              </div>
              <div class="detail">{{ address.detail }}</div>
            </div>
          </template>
        </van-cell>
        <div class="address-actions">
          <div class="action-item" @click="setDefault(address)">
            <van-icon
              :name="address.isDefault ? 'success' : 'circle'"
              :color="address.isDefault ? '#1989fa' : '#999'"
            />
            <span>默认</span>
          </div>
          <div class="action-item" @click="editAddress(address)">
            <van-icon name="edit" color="#999" />
            <span>编辑</span>
          </div>
          <div class="action-item" @click="deleteAddress(address)">
            <van-icon name="delete" color="#999" />
            <span>删除</span>
          </div>
        </div>
      </div>
    </van-cell-group>

    <van-empty description="暂无收货地址" v-else />

    <van-popup
      v-model:show="showAddPopup"
      round
      position="bottom"
      class="address-popup"
      style="height: 80%"
    >
      <template #title>{{ editingAddress ? '编辑地址' : '新增地址' }}</template>
      <div class="address-form">
        <van-cell-group inset>
          <van-field v-model="formData.name" label="收货人" placeholder="请输入收货人姓名" />
          <van-field
            v-model="formData.phone"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
          />
          <van-field
            v-model="formData.detail"
            label="详细地址"
            placeholder="请输入详细地址"
            type="textarea"
            :rows="2"
          />
        </van-cell-group>
        <van-cell-group inset class="default-switch">
          <van-cell title="设为默认地址">
            <template #right-icon>
              <van-switch v-model="formData.isDefault" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="popup-footer">
        <van-button type="primary" block class="submit-btn" @click="submitAddress">保存</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();

const showAddPopup = ref(false);
const editingAddress = ref(null);

const addresses = computed(() => userStore.addresses);

const formData = ref({
  name: '',
  phone: '',
  detail: '',
  isDefault: false,
});

const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    detail: '',
    isDefault: false,
  };
  editingAddress.value = null;
};

const goBack = () => {
  router.back();
};

const setDefault = (address) => {
  userStore.updateAddress(address.id, { isDefault: true });
};

const editAddress = (address) => {
  editingAddress.value = address;
  formData.value = { ...address };
  showAddPopup.value = true;
};

const deleteAddress = (address) => {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除该地址吗？',
  })
    .then(() => {
      userStore.deleteAddress(address.id);
      showSuccessToast('删除成功');
    })
    .catch(() => {});
};

const submitAddress = () => {
  if (!formData.value.name.trim()) {
    showToast('请输入收货人姓名');
    return;
  }
  if (!formData.value.phone.trim()) {
    showToast('请输入手机号');
    return;
  }
  if (!formData.value.detail.trim()) {
    showToast('请输入详细地址');
    return;
  }

  if (editingAddress.value) {
    userStore.updateAddress(editingAddress.value.id, formData.value);
  } else {
    userStore.addAddress(formData.value);
  }

  showSuccessToast('保存成功');
  showAddPopup.value = false;
  resetForm();
};

onMounted(() => {
  if (!userStore.isLoggedIn) {
    showToast('请先登录');
    router.push({ path: '/login', query: { redirect: '/address' } });
    return;
  }
  if (userStore.userInfo?.addresses?.length > 0 && addresses.value.length === 0) {
    userStore.userInfo.addresses.forEach((addr) => {
      userStore.addAddress(addr);
    });
  }
});
</script>

<style scoped>
.address-page {
  padding-bottom: 20px;
  overflow-x: hidden;
}

.address-popup {
  max-width: 100vw;
  overflow-x: hidden;
}

.address-popup :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}

.popup-footer {
  padding: 15px;
  background: #fff;
}

.submit-btn {
  margin: 0;
}

.address-item {
  background: #fff;
  margin-bottom: 10px;
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

.detail {
  font-size: 13px;
  color: #666;
}

.address-actions {
  display: flex;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
}

.action-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.address-form {
  padding-top: 10px;
}

.default-switch {
  margin-top: 10px;
}
</style>

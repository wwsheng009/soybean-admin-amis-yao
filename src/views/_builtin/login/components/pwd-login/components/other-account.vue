<template>
  <n-space :vertical="true">
    <n-divider class="!mb-0 text-14px text-#666">{{ $t('page.login.pwdLogin.otherAccountLogin') }}</n-divider>
    <n-space justify="center">
      <n-button
        v-for="item in accounts"
        :key="item.userName"
        type="primary"
        @click="login(item.userName, item.password)"
      >
        {{ item.label }}
      </n-button>
    </n-space>
  </n-space>
</template>

<script lang="ts" setup>
import { userRoleLabels } from '@/constants';
import { $t } from '@/locales';

interface Emits {
  (e: 'login', param: { userName: string; password: string }): void;
}

const emit = defineEmits<Emits>();

interface Account {
  key: Auth.RoleType;
  label: string;
  userName: string;
  password: string;
}

const accounts: Account[] = [
  {
    key: 'super',
    label: userRoleLabels.super,
    userName: 'xiang@iqka.com',
    password: 'A123456p+'
  },
  {
    key: 'admin',
    label: userRoleLabels.admin,
    userName: 'xiang@iqka.com',
    password: 'A123456p+'
  },
  {
    key: 'user',
    label: userRoleLabels.user,
    userName: 'xiang@iqka.com',
    password: 'A123456p+'
  }
];

function login(userName: string, password: string) {
  emit('login', { userName, password });
}
</script>

<style scoped></style>

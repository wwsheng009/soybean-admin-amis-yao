<template>
  <n-config-provider
    :theme="theme.naiveTheme"
    :theme-overrides="theme.naiveThemeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="h-full"
  >
    <naive-provider>
      <router-view />
    </naive-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui';
import { subscribeStore, useThemeStore } from '@/store';
import { useGlobalEvents } from '@/composables';
import { registerCustomComponent } from '@/views/amis/CustomComponent';

const theme = useThemeStore();

subscribeStore();
useGlobalEvents();
// 注册自定义组件
registerCustomComponent();
</script>

<style scoped></style>

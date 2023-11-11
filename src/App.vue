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
import { ref } from 'vue';
import { dateZhCN, zhCN, enUS, dateEnUS } from 'naive-ui';
import { fetchSettings } from '@/service';
import { subscribeStore, useAppStore, useThemeStore } from '@/store';
import { useGlobalEvents } from '@/composables';
import { settings } from '@/utils';
import { registerCustomComponent } from '@/views/amis/CustomComponent';
import { setLocale } from '@/locales';
const dateLocale = ref(dateZhCN);
const theme = useThemeStore();
const locale = ref(zhCN);

subscribeStore();
useGlobalEvents();

// 获取设置
fetchSettings().then((res: any) => {
  // subscribeStore();

  settings.setStore(useAppStore()).setSettings(res.data);

  const info = res?.data?.system_theme_setting;
  // let info = JSON.parse(res?.data?.system_theme_setting)
  theme.mergeThemeSetting(info);

  const loc = res?.data?.locale;

  if (loc === 'en') {
    locale.value = enUS;
    dateLocale.value = dateEnUS;
    setLocale('en');
  } else {
    locale.value = zhCN;
    dateLocale.value = dateZhCN;
    setLocale('zh-CN');
  }

  settings.dynamicAssetsHandler(res?.data?.assets);
});

// 注册自定义组件
registerCustomComponent();
</script>

<style scoped></style>

<template>
  <amis-renderer :schema="schema" :locale="localeRef" />
</template>

<script lang="ts" setup>
// 当前页面的路由信息
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { initPageSchema } from '@/service';
import { useAppStore } from '@/store';
import { settings } from '@/utils';
import { setupCustomComponent } from '@/views/amis/CustomComponent';
import amisRenderer from '@/components/custom/amis-renderer.vue';

// @ts-ignore
const amisLib = amisRequire('amis');

// 注册自定义组件
setupCustomComponent(amisLib);

type AmisConfig = {
  schema_api: string;
};
const schema = ref({});
const route = useRoute();

const localeRef = ref('zh-CN');
const locale = settings.setStore(useAppStore()).getSettingItem('locale') || 'zh-CN';

localeRef.value = locale === 'en' ? 'en-US' : locale;

const amisRoute = route.meta as unknown as AmisConfig;
initPageSchema(amisRoute.schema_api).then(async res => {
  schema.value = res.data as object;
});
</script>

<style scoped>
#amis-region {
  overflow: inherit;
  padding-top: 0;
}
</style>

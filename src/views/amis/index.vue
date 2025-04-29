<script lang="ts" setup>
// 当前页面的路由信息
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { initPageSchema } from '@/service/api/amis';
import { useAppStore } from '@/store/modules/app';
import { setupCustomComponent } from '@/components/amis/CustomComponent';
import AmisRender from '@/components/amis/amis-render.vue';

// @ts-expect-error use amis sdk
const amisLib = amisRequire('amis');

// 注册自定义组件
setupCustomComponent(amisLib);

type AmisConfig = {
  schemaApi: string;
};
const schema = ref<object>({});
const route = useRoute();

const appStore = useAppStore();

const amisRoute = route.meta as unknown as AmisConfig;
if (amisRoute && amisRoute.schemaApi && amisRoute.schemaApi !== '') {
  initPageSchema(amisRoute.schemaApi).then(async res => {
    schema.value = res.data || {};
  });
}
</script>

<template>
  <AmisRender :schema="schema" :locale="appStore.locale" class="amis-region" />
</template>

<style scoped>
.amis-region {
  overflow: inherit;
  padding-top: 0;
}
</style>

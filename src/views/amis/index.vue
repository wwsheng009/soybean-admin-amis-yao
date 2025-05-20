<script lang="ts" setup>
import { useAmisSchema } from '@/hooks/common/amis';
import { setupCustomComponent } from '@/components/amis/CustomComponent';
import AmisRender from '@/components/amis/amis-render.vue';
defineOptions({
  name: 'AmisView'
});
// @ts-expect-error use amis sdk
const amisLib = amisRequire('amis');
// 注册自定义组件
setupCustomComponent(amisLib);
const { schema, locale, theme } = useAmisSchema();
</script>

<template>
  <AmisRender :schema="schema" :locale="locale" :theme="theme" class="amis-region" />
</template>

<style scoped>
.amis-region {
  overflow: inherit;
  padding-top: 0;
}
</style>

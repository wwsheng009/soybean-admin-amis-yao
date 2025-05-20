import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { initPageSchema } from '@/service/api/amis';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

export interface AmisConfig {
  schemaApi: string;
}

export function useAmisSchema() {
  const schema = ref<object>({});
  const route = useRoute();
  const appStore = useAppStore();
  const themeStore = useThemeStore();
  const theme = computed(() => (themeStore.darkMode ? 'dark' : ''));
  const locale = computed(() => appStore.locale);
  const amisRoute = route.meta as unknown as AmisConfig;

  async function fetchSchema() {
    if (amisRoute && amisRoute.schemaApi && amisRoute.schemaApi !== '') {
      const res = await initPageSchema({
        url: amisRoute.schemaApi,
        params: { theme: theme.value, locale: locale.value }
      });
      schema.value = res.data || {};
    }
  }

  fetchSchema();

  watch([() => themeStore.darkMode], fetchSchema);

  return {
    schema,
    locale,
    theme
  };
}

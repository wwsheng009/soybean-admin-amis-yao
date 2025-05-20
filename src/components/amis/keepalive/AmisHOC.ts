// components/AmisHOC.ts
import { computed, defineAsyncComponent, defineComponent, h, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { initPageSchema } from '@/service/api/amis';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { setupCustomComponent } from '@/components/amis/CustomComponent';
import styles from './AmisHOC.module.css';
// AMIS library
// @ts-expect-error use amis sdk
const amisLib = amisRequire('amis');

// HOC factory function
export function withDynamicName(dynamicName: string) {
  // Register custom AMIS components
  setupCustomComponent(amisLib);

  return defineComponent({
    name: dynamicName || 'AmisKeepAlive',
    setup() {
      const schema = ref<object>({});
      const route = useRoute();
      const appStore = useAppStore();

      type AmisConfig = {
        schemaApi: string;
      };
      const themeStore = useThemeStore();

      const bgColor = computed(() => {
        if (themeStore.darkMode) {
          return 'dark';
        }
        return '';
      });
      const amisRoute = route.meta as unknown as AmisConfig;
      if (amisRoute && amisRoute.schemaApi && amisRoute.schemaApi !== '') {
        initPageSchema({ url: amisRoute.schemaApi, params: { theme: bgColor.value } }).then(async res => {
          schema.value = res.data || {};
        });
      }
      watch([() => themeStore.darkMode], () => {
        if (amisRoute && amisRoute.schemaApi && amisRoute.schemaApi !== '') {
          initPageSchema({ url: amisRoute.schemaApi, params: { theme: bgColor.value } }).then(async res => {
            schema.value = res.data || {};
          });
        }
      });
      // Return schema and locale for the lazy-loaded component
      return {
        schema,
        locale: appStore.locale,
        theme: bgColor.value
      };
    }
  });
}

// Lazy-loaded wrapper for the HOC
export function createLazyAmisComponent(dynamicName: string) {
  return defineAsyncComponent({
    loader: async () => {
      // Import the AmisRender component dynamically
      const { default: AmisRender } = await import('@/components/amis/amis-render.vue');
      const AmisComponent = withDynamicName(dynamicName);

      // Wrap the HOC in a new component to handle rendering
      return defineComponent({
        name: dynamicName,
        setup(props, { slots }) {
          const amisProps = AmisComponent.setup!(props, { attrs: {}, slots, emit: () => {}, expose: () => {} });
          return () =>
            h(
              AmisRender,
              {
                schema: (amisProps as any)?.schema?.value || {},
                locale: (amisProps as any)?.locale,
                class: styles.amis_region,
                theme: (amisProps as any)?.theme
              },
              slots
            );
        }
      });
    }
  });
}

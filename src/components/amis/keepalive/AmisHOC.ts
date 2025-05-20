// components/AmisHOC.ts
import { defineAsyncComponent, defineComponent, h } from 'vue';
import { useAmisSchema } from '@/hooks/common/amis';
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
      const { schema, locale, theme } = useAmisSchema();

      // Return schema and locale for the lazy-loaded component
      return {
        schema,
        locale,
        theme
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
                locale: (amisProps as any)?.locale?.value,
                class: styles.amis_region,
                theme: (amisProps as any)?.theme?.value
              },
              slots
            );
        }
      });
    }
  });
}

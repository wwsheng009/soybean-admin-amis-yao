<template>
  <div ref="amisRenderer"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { stringify } from 'qs';
import { amisRequest } from '@/service';
import { useRouterPush } from '@/composables';
import { attachmentAdpator } from '@/utils';

interface Props {
  schema: object;
  locale?: string;
  props?: object;
  env?: object;
}
interface Emits {
  (e: 'ready', obj: { instance: any }): void;
}
type AmisInstance = {
  amisRenderer: object;
  unmount: () => void;
  updateProps: (props: object) => void;
  updateSchema: (schema: object) => void;
};
const props = defineProps<Props>();
const routerPush = useRouterPush();

const router = useRouter();
const amisInstance = ref({} as AmisInstance);

const amisRenderer = ref<HTMLElement>();
const route = useRoute();
const context = reactive({
  siteName: 'AMIS DEMO'
});
const emit = defineEmits<Emits>();

const location = getLocation();

// @ts-ignore
const amis = amisRequire('amis/embed');
// @ts-ignore
const { normalizeLink } = amisRequire('amis');

function getLocation() {
  return {
    pathname: route.path,
    hash: route.hash,
    query: route.query,
    search: `?${stringify(route.query)}`
  };
}

onMounted(() => {
  const instance = amis.embed(
    amisRenderer.value,
    props.schema,
    {
      data: {
        locale: props.locale
      },
      context,
      location,

      ...props.props
    },
    {
      fetcher: async (api: any) => {
        const { url, method, data, responseType, config, headers } = api;
        // headers里有额外的定义
        if (config) {
          config.headers = config.headers || {};
          Object.assign(config.headers, headers);
        }
        if (responseType) {
          config.responseType = responseType;
        }

        let response = await amisRequest(url, method, data, config);
        response = attachmentAdpator(response, api);
        return response;
      },
      jumpTo: (toIn: string, action: { actionType: string; blank: boolean; target: string }) => {
        let to = toIn;

        if (to === 'goBack') {
          router.go(-1);
          return;
        }

        to = normalizeLink(to, location);

        if (action?.actionType === 'url') {
          if (action.blank === false) {
            routerPush.routerPush(to);
          } else {
            window.open(to);
          }
          return;
        }

        if (action && to && action.target) {
          window.open(to, action.target);
          return;
        }

        if (/^https?:\/\//.test(to)) {
          window.location.replace(to);
        } else {
          routerPush.routerPush(to);
        }
      },

      updateLocation: (locationIN: string, replace: boolean) => {
        let loc = locationIN;
        if (loc === 'goBack') {
          router.go(-1);
          return;
        }

        loc = normalizeLink(loc, loc);
        if (replace) {
          router.replace(loc);
        }
      },
      enableAMISDebug: true,
      ...props.env
    },
    () => {
      emit('ready', {
        instance
      });
    }
  );

  amisInstance.value = instance;
});
watch([() => props.schema], () => {
  amisInstance.value?.updateSchema(props.schema);
  if (route.params && Object.keys(route.params).length > 0) {
    const config = {
      data: { params: route.params }
    };
    amisInstance.value?.updateProps(config);
  }
});
watch([() => props.locale, () => props.props, () => router], () => {
  amisInstance.value?.updateProps({
    data: {
      locale: props.locale
    },
    context,
    ...props.props
  });
});
onBeforeUnmount(() => {
  amisInstance.value?.unmount();
});
</script>

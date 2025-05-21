<script setup lang="ts">
import type { VNodeChild } from 'vue';
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { stringify } from 'qs';
import Clipboard from 'clipboard';
import { amisRequestProxy } from '@/service/api/amis';
import { useRouterPush } from '@/hooks/common/router';
import { attachmentAdpator } from '@/utils/attachmentAdpator';
import { $t } from '@/locales';

interface Props {
  schema: object;
  locale?: string;
  theme?: string;
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
const { routerPush } = useRouterPush(false);

const router = useRouter();
const amisInstance = ref({} as AmisInstance);

const amisRenderer = ref<HTMLElement>();
const route = useRoute();
const context = reactive({
  // siteName: 'AMIS DEMO'
});
const emit = defineEmits<Emits>();

const location = getLocation();

// @ts-expect-error the amisRequire use the amis sdk js
const amis = amisRequire('amis/embed');
// @ts-expect-error the amisRequire use the amis sdk js
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
  const amisScoped = amis.embed(
    amisRenderer.value,
    props.schema,
    {
      data: {
        locale: props.locale,
        params: route.params,
        __theme: props.theme,
        __query: route.query
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
          config.headers ||= {};
          Object.assign(config.headers, headers);
        }
        if (responseType) {
          config.responseType = responseType;
        }

        const response = await amisRequestProxy({ url, method, data, config });
        interface AmisResponse {
          status: number;
          msg: string;
          data: any;
          code: number;
          message: string;
        }
        let payload = response.data as AmisResponse;
        if (
          response.data &&
          typeof response.data === 'object' &&
          !(response.data !== null && 'data' in response.data && 'msg' in response.data && 'status' in response.data)
        ) {
          payload = {
            status: !payload.code ? 0 : payload.code,
            msg: payload.message ? payload.message : '处理成功',
            data: payload
          } as unknown as AmisResponse; // 显式类型断言
          response.data = payload;
        } else if (response.error) {
          payload = {
            status: -1,
            msg: response.response?.data?.message || response.error?.message || '处理失败',
            data: response.error
          } as unknown as AmisResponse; // 显式类型断言
          response.data = payload as unknown as AmisResponse['data'];
        } else {
          payload = {
            status: 0,
            msg: '处理成功',
            data: response.data
          } as unknown as AmisResponse; // 显式类型断言
          response.data = payload as unknown as AmisResponse['data'];
        }
        return attachmentAdpator(response, api);
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
            routerPush(to);
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
          routerPush(to);
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
      notify: (type: string, msg: string) => {
        if (type === 'error') {
          window.$message?.error(msg);
        } else if (type === 'warn') {
          window.$message?.warning(msg);
        } else if (type === 'info') {
          window.$message?.info(msg);
        } else {
          window.$message?.success(msg);
        }
      },
      alert: (content: string | (() => VNodeChild)) => {
        window.$message?.warning(content);
      },
      confirm: (content: any) => {
        let result = false;
        window.$dialog?.warning({
          title: $t('amis.dialog.comfirmTitle'),
          content,
          positiveText: $t('amis.dialog.sure'),
          negativeText: $t('amis.dialog.notSure'),
          draggable: true,
          onPositiveClick: () => {
            result = true;
          },
          onNegativeClick: () => {
            result = false;
          }
        });
        return result;
      },
      copy: (contents: string, _options?: { silent: boolean; format?: string }) => {
        const clipboard = new Clipboard(contents);

        clipboard.on('success', () => {
          window.$message?.success($t('common.copySuccessMsg'));
        });
      },
      enableAMISDebug: import.meta.env.VITE_AMIS_DEBUG,
      ...props.env
    },
    () => {
      emit('ready', {
        instance: amisScoped
      });
    }
  );

  amisInstance.value = amisScoped;
});
watch([() => props.schema], () => {
  amisInstance.value?.updateSchema(props.schema);
});
watch([() => props.locale, () => props.props, () => router, () => props.theme], () => {
  const config = {
    data: {
      locale: props.locale,
      params: route.params,
      __theme: props.theme,
      __query: route.query
    },
    context,
    ...props.props
  };

  amisInstance.value?.updateProps(config);
});
onBeforeUnmount(() => {
  amisInstance.value?.unmount();
});

defineOptions({
  name: 'AmisRender'
});
</script>

<template>
  <div ref="amisRenderer"></div>
</template>

import type { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import unocss from '@unocss/vite';
import progress from 'vite-plugin-progress';
import VueDevtools from 'vite-plugin-vue-devtools';
import pageRoute from '@soybeanjs/vite-plugin-vue-page-route';
import legacy from '@vitejs/plugin-legacy';
import unplugin from './unplugin';
// import mock from './mock';
import visualizer from './visualizer';
import compress from './compress';
import pwa from './pwa';

/**
 * vite插件
 * @param viteEnv - 环境变量配置
 */
export function setupVitePlugins(viteEnv: ImportMetaEnv): (PluginOption | PluginOption[])[] {
  const plugins = [
    vue({
      script: {
        defineModel: true
      }
    }),
    vueJsx(),
    VueDevtools(),
    ...unplugin(viteEnv),
    unocss(),
    // mock(viteEnv),不需要mock
    progress(),
    // chrome mobile兼容处理，会多生成legacy文件
    legacy({
      targets: ['defaults', 'Chrome < 90', 'Safari  12.1', 'ios >= 12.3', 'edge < 15'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all',
        'es.promise.all-settled',
        'es.object.entries'
      ],
      modernPolyfills: ['es.promise.all-settled', 'es.object.entries', 'es/global-this']
    })
  ];

  if (viteEnv.VITE_VISUALIZER === 'Y') {
    plugins.push(visualizer as PluginOption);
  }
  if (viteEnv.VITE_COMPRESS === 'Y') {
    plugins.push(compress(viteEnv));
  }
  if (viteEnv.VITE_PWA === 'Y' || viteEnv.VITE_VERCEL === 'Y') {
    plugins.push(pwa());
  }
  if (viteEnv.VITE_SOYBEAN_ROUTE_PLUGIN === 'Y') {
    plugins.push(pageRoute());
  }

  return plugins;
}

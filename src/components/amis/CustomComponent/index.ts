import { defineCustomElement } from 'vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { customComponents } from './components';

/**
 * 注册自定义组件
 *
 * @param amis
 */
export const setupCustomComponent = (amis: any) => {
  for (const key in customComponents) {
    if (Object.hasOwn(customComponents, key)) {
      amis.Renderer({ test: new RegExp(`(^|/)${key}`) })(customComponents[key]);
    }
  }
};

/** 通过 web component 方式注册自定义组件, 使 vue 组件可以在 amis 中使用 */
export const registerCustomComponent = () => {
  try {
    customElements.define('svg-icon', defineCustomElement(SvgIcon));
  } catch (e) {
    console.log(e);
  }
};

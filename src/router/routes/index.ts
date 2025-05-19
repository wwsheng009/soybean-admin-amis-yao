import type { RouteRecordRaw } from 'vue-router';
import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { createLazyAmisComponent } from '@/components/amis/keepalive/AmisHOC';
import { generatedRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customRoutes: CustomRoute[] = [];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  [...customRoutes, ...generatedRoutes].forEach(item => {
    if (item.meta?.constant) {
      constantRoutes.push(item);
    } else {
      authRoutes.push(item);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  const elegantRoutes = transformElegantRoutesToVueRoutes(routes, layouts, views);
  return elegantRoutes.map(route => processRouteComponent(route));
}
// 为了能在keep-alive中使用amis组件，需要将amis组件包装成一个lazy组件
// keepalive组件需要将组件的name属性设置为组件的名称
function processRouteComponent(route: RouteRecordRaw): RouteRecordRaw {
  if (route.component === views.amis && route.name && route.meta?.keepAlive) {
    route.component = createLazyAmisComponent(route.name.toString());
  }
  if (route.children) {
    route.children = route.children.map(child => processRouteComponent(child));
  }
  return route;
}

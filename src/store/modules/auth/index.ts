import { unref, nextTick, ref } from 'vue';
import { defineStore } from 'pinia';
import { dateZhCN, zhCN, enUS, dateEnUS } from 'naive-ui';
import { router } from '@/router';
import { fetchLogin, fetchUserInfo, fetchSettings } from '@/service';
import type { XgenResLogin } from '@/store';
import { xgenAfterLogin, useAppStore, useThemeStore } from '@/store';
import { useRouterPush } from '@/composables';
import { localStg, settings } from '@/utils';
import { $t, setLocale } from '@/locales';
import { useTabStore } from '../tab';
import { useRouteStore } from '../route';
import { getToken, getUserInfo, clearAuthStorage } from './helpers';
const dateLocale = ref(dateZhCN);
// subscribeStore();
interface AuthState {
  /** 用户信息 */
  userInfo: Auth.UserInfo;
  /** 用户token */
  token: string;
  /** 登录的加载状态 */
  loginLoading: boolean;
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    userInfo: getUserInfo(),
    token: getToken(),
    loginLoading: false
  }),
  getters: {
    /** 是否登录 */
    isLogin(state) {
      return Boolean(state.token);
    }
  },
  actions: {
    /** 重置auth状态 */
    resetAuthStore() {
      const { toLogin } = useRouterPush(false);
      const { resetTabStore } = useTabStore();
      const { resetRouteStore } = useRouteStore();
      const route = unref(router.currentRoute);

      clearAuthStorage();
      this.$reset();

      if (route.meta.requiresAuth) {
        toLogin();
      }

      nextTick(() => {
        resetTabStore();
        resetRouteStore();
      });
    },
    /**
     * 处理登录后成功或失败的逻辑
     * @param backendToken - 返回的token
     */
    async handleActionAfterLogin(backendToken: ApiAuth.Token) {
      const route = useRouteStore();
      const { toLoginRedirect } = useRouterPush(false);

      const loginSuccess = await this.loginByToken(backendToken);

      if (loginSuccess) {
        await route.initAuthRoute();

        // 跳转登录后的地址
        toLoginRedirect();

        // 登录成功弹出欢迎提示
        if (route.isInitAuthRoute) {
          window.$notification?.success({
            title: $t('page.login.common.loginSuccess'),
            content: $t('page.login.common.welcomeBack', {
              userName: this.userInfo.userName
            }),
            duration: 3000
          });
        }

        return;
      }

      // 不成功则重置状态
      this.resetAuthStore();
    },
    /**
     * 根据token进行登录
     * @param backendToken - 返回的token
     */
    async loginByToken(backendToken: ApiAuth.Token) {
      let successFlag = false;

      // 先把token存储到缓存中(后面接口的请求头需要token)
      const { token, refreshToken } = backendToken;
      localStg.set('token', token);

      localStg.set('refreshToken', refreshToken);

      // 获取设置
      fetchSettings().then((res: any) => {
        const locale = ref(zhCN);
        const theme = useThemeStore();
        settings.setStore(useAppStore()).setSettings(res.data);

        const info = res?.data?.system_theme_setting;
        // let info = JSON.parse(res?.data?.system_theme_setting)
        theme.mergeThemeSetting(info);

        const loc = res?.data?.locale;

        if (loc === 'en') {
          locale.value = enUS;
          dateLocale.value = dateEnUS;
          setLocale('en');
        } else {
          locale.value = zhCN;
          dateLocale.value = dateZhCN;
          setLocale('zh-CN');
        }

        settings.dynamicAssetsHandler(res?.data?.assets);
      });

      // 获取用户信息
      const { data } = await fetchUserInfo();
      if (data) {
        // 成功后把用户信息存储到缓存中
        localStg.set('userInfo', data);

        // 更新状态
        this.userInfo = data;
        this.token = token;

        successFlag = true;
      }

      return successFlag;
    },

    /**
     * update user info
     */
    async updateUserInfo() {
      if (!localStg.get('userInfo')) {
        // 获取用户信息
        const { data } = await fetchUserInfo();
        if (data) {
          // 成功后把用户信息存储到缓存中
          localStg.set('userInfo', data);
          // 更新状态
          this.userInfo = data;
        }
      }
    },
    /**
     * 登录
     * @param userName - 用户名
     * @param password - 密码
     */
    async login(userName: string, password: string) {
      this.loginLoading = true;
      const { data } = await fetchLogin(userName, password);

      // if (data && data.status != 0) {
      // 	this.loginLoading = false;

      //   if (data?.msg) {
      //     window.$message?.error(data.msg);
      //   }

      // 	return true
      // }

      if (data) {
        xgenAfterLogin(data as unknown as XgenResLogin);
        await this.handleActionAfterLogin(data);
      }
      this.loginLoading = false;
    },
    /**
     * 更换用户权限(切换账号)
     * @param userRole
     */
    async updateUserRole(userRole: Auth.RoleType) {
      const { resetRouteStore, initAuthRoute } = useRouteStore();

      const accounts: Record<Auth.RoleType, { userName: string; password: string }> = {
        super: {
          userName: 'xiang@iqka.com',
          password: 'A123456p+'
        },
        admin: {
          userName: 'xiang@iqka.com',
          password: 'A123456p+'
        },
        user: {
          userName: 'xiang@iqka.com',
          password: 'A123456p+'
        }
      };
      const { userName, password } = accounts[userRole];
      const { data } = await fetchLogin(userName, password);
      if (data) {
        xgenAfterLogin(data as unknown as XgenResLogin);
        await this.loginByToken(data);
        resetRouteStore();
        initAuthRoute();
      }
    }
  }
});

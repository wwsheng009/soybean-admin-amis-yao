import type { AxiosResponse } from 'axios';
import type { FlatRequestInstance } from '@sa/axios';
import { createFlatRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { getServiceBaseURL } from '@/utils/service';
import { $t } from '@/locales';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

function handleNotAuthorizedLogout(
  responseCode: string,
  response: AxiosResponse<App.Service.YaoResponse<unknown>, any> | undefined,
  orequest: FlatRequestInstance<RequestInstanceState, App.Service.YaoResponse<unknown>>
): boolean {
  if (!response) {
    return false;
  }
  const authStore = useAuthStore();

  function handleLogout() {
    authStore.resetStore();
  }
  function logoutAndCleanup() {
    handleLogout();
    window.removeEventListener('beforeunload', handleLogout);

    orequest.state.errMsgStack = orequest.state.errMsgStack.filter(msg => msg !== response?.data.message);
  }
  const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];

  if (modalLogoutCodes.includes(responseCode) && !orequest.state.errMsgStack?.includes(response.data.message)) {
    orequest.state.errMsgStack = [...(orequest.state.errMsgStack || []), response.data.message];

    // prevent the user from refreshing the page
    window.addEventListener('beforeunload', handleLogout);
    if (window.$dialog === undefined) {
      logoutAndCleanup();
      return true;
    }
    window.$dialog?.error({
      title: $t('common.error'),
      content: response.data.message,
      positiveText: $t('common.confirm'),
      maskClosable: false,
      closeOnEsc: false,
      onPositiveClick() {
        logoutAndCleanup();
      },
      onClose() {
        logoutAndCleanup();
      }
    });
    return true;
  }
  return false;
}
export const request = createFlatRequest<App.Service.YaoResponse, RequestInstanceState>(
  {
    baseURL,
    headers: {}
  },
  {
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      return response.status === 200;
      // when the backend response code is "0000"(default), it means the request is success
      // to change this logic by yourself, you can modify the `VITE_SERVICE_SUCCESS_CODE` in `.env` file
      // return String(response.data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();
      const backendErrorCode = response?.data?.code || `${response?.status}` || '';
      const responseCode = String(backendErrorCode);

      function handleLogout() {
        authStore.resetStore();
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        return null;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      if (handleNotAuthorizedLogout(responseCode, response, request)) {
        return null;
      }

      // when the backend response code is in `expiredTokenCodes`, it means the token is expired, and refresh token
      // the api `refreshToken` can not return error code in `expiredTokenCodes`, otherwise it will be a dead loop, should return `logoutCodes` or `modalLogoutCodes`
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      return null;
    },
    transformBackendResponse(response) {
      if (
        typeof response.data === 'object' &&
        response.data !== null &&
        'data' in response.data &&
        'msg' in response.data &&
        'status' in response.data
      ) {
        return response.data.data;
      }
      return response.data;
    },

    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;
      let backendErrorCode = '';

      // get backend error message and code

      message = error.response?.data?.message || error.message || error.response?.statusText || '';
      backendErrorCode = String(error.response?.data?.code || `${error.response?.status}` || '');

      // the error message is displayed in the modal
      if (handleNotAuthorizedLogout(backendErrorCode, error.response, request)) {
        return;
      }

      // when the token is expired, refresh token and retry request, so no need to show error message
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      showErrorMsg(request.state, message);
    }
  }
);

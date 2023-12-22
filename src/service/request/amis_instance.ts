import axios from 'axios';
import type { AxiosResponse, AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { REFRESH_TOKEN_CODE } from '@/config';
import {
  handleAxiosError,
  handleBackendError,
  handleResponseError,
  handleServiceResult,
  transformAmisRequestData
} from '@/utils';
import { clearAuthStorage, getToken } from '@/store/modules/auth/helpers';
import { handleRefreshToken } from './helpers';

// @ts-ignore
const amisLib = amisRequire('amis');

type RefreshRequestQueue = (config: AxiosRequestConfig) => void;

/**
 * 封装axios请求类
 * @author Soybean<honghuangdc@gmail.com>
 */
export default class AmisAxiosInstance {
  instance: AxiosInstance;

  backendConfig: Service.BackendResultConfig;

  isRefreshing: boolean;

  retryQueues: RefreshRequestQueue[];

  /**
   *
   * @param axiosConfig - axios配置
   * @param backendConfig - 后端返回的数据配置
   */
  constructor(
    axiosConfig: AxiosRequestConfig,
    backendConfig: Service.BackendResultConfig = {
      codeKey: 'status',
      dataKey: 'data',
      msgKey: 'msg',
      successCode: 0
    }
  ) {
    this.backendConfig = backendConfig;
    this.instance = axios.create(axiosConfig);
    this.setInterceptor();
    this.isRefreshing = false;
    this.retryQueues = [];
  }

  /** 设置请求拦截器 */
  setInterceptor() {
    this.instance.interceptors.request.use(
      async config => {
        const method = config.method;
        if (method !== 'post' && method !== 'put' && method !== 'patch') {
          if (config.data) {
            config.params = config.data;
          }
        } else if (config.data && config.data instanceof FormData) {
          // config.headers = config.headers || {};
          // config.headers['Content-Type'] = 'multipart/form-data';
        } else if (
          config.data &&
          typeof config.data !== 'string' &&
          !(config.data instanceof Blob) &&
          !(config.data instanceof ArrayBuffer)
        ) {
          config.headers = config.headers || {};
          // data = JSON.stringify(data);
          config.headers['Content-Type'] = 'application/json';
        }

        const handleConfig = { ...config };

        if (handleConfig.headers) {
          // 数据转换
          const contentType = handleConfig.headers['Content-Type'] as UnionKey.ContentType;

          handleConfig.data = await transformAmisRequestData(handleConfig.data, contentType);
          // 设置token
          handleConfig.headers.Authorization = `Bearer ${getToken() || ''}`;
        }
        return handleConfig;
      },
      (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError);
        return handleServiceResult(error, null);
      }
    );
    this.instance.interceptors.response.use(
      (async response => {
        const { status, config } = response;
        if (status === 200 || status < 300 || status === 304) {
          let payload = response.data;
          if (
            !(
              typeof response.data === 'object' &&
              response.data !== null &&
              'data' in response.data &&
              'msg' in response.data &&
              'status' in response.data
            )
          ) {
            payload = {
              status: !response.data.code ? 0 : response.data.code,
              msg: response.data.message ? response.data.message : '处理成功',
              data: response.data
            };
            response.data = payload;
          }

          const backend = response.data;
          const { codeKey, successCode } = this.backendConfig;
          // 请求成功
          if (backend[codeKey] === successCode) {
            if (backend?.msg && backend?.doNotDisplayToast === 0) {
              amisLib.toast.success(backend.msg);
            }
            // return handleServiceResult(null, backend);
            return response;
            // return handleServiceResult(null, backend[dataKey]);
          }
          // token失效
          if (backend?.code === 403) {
            clearAuthStorage();
            window.location.reload();
          }
          // token失效, 刷新token
          if (REFRESH_TOKEN_CODE.includes(backend[codeKey])) {
            // 原始请求
            const originRequest = new Promise(resolve => {
              this.retryQueues.push((refreshConfig: AxiosRequestConfig) => {
                config.headers.Authorization = refreshConfig.headers?.Authorization;
                resolve(this.instance.request(config));
              });
            });

            if (!this.isRefreshing) {
              this.isRefreshing = true;
              const refreshConfig = await handleRefreshToken(response.config);
              if (refreshConfig) {
                this.retryQueues.map(cb => cb(refreshConfig));
              }
              this.retryQueues = [];
              this.isRefreshing = false;
            }
            return originRequest;
          }

          const error = handleBackendError(backend, this.backendConfig);
          return handleServiceResult(error, null);
        }
        const error = handleResponseError(response);
        return handleServiceResult(error, null);
      }) as (response: AxiosResponse<any, any>) => Promise<AxiosResponse<any, any>>,
      (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError);
        return handleServiceResult(error, null);
      }
    );
  }
}

import { AmisRequest, YaoRequest } from '../request';

export const initPageSchema = ({ url, params }: any) => YaoRequest<object>({ url, params });

/**
 * amis请求
 *
 * @param url
 * @param method 方法
 * @param data 数据
 * @param config 请求配置
 */

export function amisRequestProxy({ url, method, data, config }: any) {
  let requestData = data;
  if (method !== 'post' && method !== 'put' && method !== 'patch') {
    if (requestData) {
      config.params = data;
    }
  } else if (data && data instanceof FormData) {
    // config.headers = config.headers || {};
    config.headers['Content-Type'] = 'multipart/form-data';
  } else if (data && typeof data !== 'string' && !(data instanceof Blob) && !(data instanceof ArrayBuffer)) {
    // data = JSON.stringify(data);
    config.headers['Content-Type'] = 'application/json';
  }
  if (config.headers['Content-Type']?.toLowerCase().includes('json')) {
    if (typeof data === 'string') {
      try {
        requestData = JSON.parse(data);
      } catch (error) {
        throw new Error(`JSON parse error${(error as Error).message}`);
      }
    }
  }
  // config 可能会包含method,以参数method为准
  return AmisRequest<{ data?: any }>({ ...config, url, method, data: requestData });
}

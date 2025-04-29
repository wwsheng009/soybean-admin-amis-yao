import { request } from '../request';

export const initPageSchema = (path: string) => request<object>({ url: path });

/**
 * amis请求
 *
 * @param url
 * @param method 方法
 * @param data 数据
 * @param config 请求配置
 */

export function amisRequest({ url, method, data, config }: any) {
  return request<{ data?: any }>({ url, method, data, ...config });
}

import { request, requestAmis } from '../request';

/**
 * 初始化页面结构
 * @param path
 */
export const initPageSchema = (path: string) => request.get(path);

/**
 * amis请求
 * @param url
 * @param method  方法
 * @param data  数据
 * @param config 请求配置
 */
// @ts-ignore
export const amisRequest = (url, method, data, config) => requestAmis[method](url, data, config);

/**
 * 获取设置
 */
export const fetchSettings = () => request.get('/api/v1/amis/setting');

/**
 * 保存设置
 * @param data 格式：{key1: value1, key2: value2, ...}
 */
export const saveSettings = (data: any) => request.post('/api/v1/amis/setting', data);

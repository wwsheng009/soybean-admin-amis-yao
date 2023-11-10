import { adapter } from '@/utils';
import { request } from '../request';
import { adapterOfFetchUserList } from './management.adapter';

/** 获取用户列表 */
export const fetchUserList = async () => {
  const data = await request.post<ApiUserManagement.User[] | null>('/api/v1/admin/user/user_list');
  return adapter(adapterOfFetchUserList, data);
};

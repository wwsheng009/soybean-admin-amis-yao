import { localStg } from '@/utils';
import { getXgenToken, xgenLogout } from '@/store/xgen';

/** 获取token */
export function getToken() {
  return getXgenToken() || localStg.get('token') || '';
}

/** 获取用户信息 */
export function getUserInfo() {
  const emptyInfo: Auth.UserInfo = {
    userId: '',
    userName: '',
    userRole: 'user'
  };
  const userInfo: Auth.UserInfo = localStg.get('userInfo') || emptyInfo;

  return userInfo;
}

/** 去除用户相关缓存 */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  localStg.remove('userInfo');
  xgenLogout();
}

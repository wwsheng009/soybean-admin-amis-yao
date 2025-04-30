import { localStg } from '@/utils/storage';
import { getXgenToken, xgenLogout } from '../xgen';

/** Get token */
export function getToken() {
  return localStg.get('token') || getXgenToken() || '';
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  xgenLogout();
}

import { localStg } from '@/utils/storage';
import { xgenLogout } from '../xgen';

/** Get token */
export function getToken() {
  return localStg.get('token') || '';
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  xgenLogout();
}

import { YaoRequest as request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(userName: string, password: string, captcha?: Api.Auth.Captcha) {
  return request<Api.Auth.LoginToken>({
    url: '/api/v1/soybean/auth/login',
    method: 'post',
    data: {
      userName,
      password,
      captcha
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/api/v1/soybean/auth/getUserInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/api/v1/soybean/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/api/v1/soybean/auth/error', params: { code, msg } });
}

export function fetchCaptcha(type: string = 'digit') {
  return request<Api.Auth.CaptchaInfo>({ url: '/api/v1/amis/captcha', params: { type } });
}

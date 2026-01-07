import { YaoRequest as request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
// export function fetchLogin(userName: string, password: string, captcha?: Api.Auth.CaptchaInfo) {
//   return request<Api.Auth.LoginToken>({
//     url: '/api/v1/soybean/auth/login',
//     method: 'post',
//     data: {
//       userName,
//       password,
//       captcha
//     }
//   });
// }

export function postVerifyEmailCode(rquest: Api.Auth.LoginVerifyRequest) {
  return request<Api.Auth.LoginVerifyResponse>({
    url: '/api/user/entry/verify',
    method: 'post',
    data: {
      ...rquest
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

export function postRegister(register: Api.Auth.RegisterRequest, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return request<Api.Auth.RegisterResponse>({
    url: '/api/user/entry/register',
    method: 'post',
    headers,
    data: {
      ...register
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
  return request<Api.Auth.CaptchaInfo>({ url: '/api/user/entry/captcha', params: { type } });
}

export function fetchYaoLogin(
  password: string,
  accessToken: string,
  rememberMe: boolean = false,
  locale: string = 'zh-CN'
) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return request<Api.Auth.YaoLoginResponse>({
    url: '/api/user/entry/login',
    method: 'post',
    headers,
    data: {
      password,
      remember_me: rememberMe,
      locale
    }
  });
}

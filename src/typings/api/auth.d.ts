declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }

    interface LoginVerifyResponse {
      status: string; // login
      access_token: string; // 访问令牌
      expires_in: number; // 过期时间，单位分钟
      token_type: string; // Bearer
      scope: string; // 权限
      user_exists: boolean; // 用户是否存在
      verification_sent: boolean; // 是否发送了验证码
      otp_id: string;
    }

    interface LoginVerifyRequest {
      username: string;
      captcha_id: string;
      captcha: string;
      locale: string;
    }
    interface RegisterRequest {
      password: string;
      confirm_password: string;
      verification_code: string;
      locale: string;
      otp_id: string;
    }
    interface RegisterResponse {
      access_token: string;
      id_token: string;
      refresh_token: string;
      expires_in: number;
      refresh_token_expires_in: number;
      user_id: string;
      session_id: string;
      mfa_enabled: boolean;
      status: string;
      message: string;
    }

    interface YaoLoginResponse {
      id_token: string;
      access_token: string;
      session_id: string;
      refresh_token: string;
      expires_in: number;
      mfa_enabled: boolean;
      refresh_token_expires_in: number;
      status: string;
    }

    interface CaptchaInfo {
      captcha_id: string;
      captcha_image: string;
      captcha: string;
    }
  }
}

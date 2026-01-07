import { computed, reactive, ref } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { REG_EMAIL } from '@/constants/reg';
import { postVerifyEmailCode } from '@/service/api';
import { $t } from '@/locales';

export function useVerifyCode() {
  const { loading, startLoading, endLoading } = useLoading();
  const { count, start, stop, isCounting } = useCountDown(10);

  // 保存验证码返回的数据
  const verifyData = reactive<Api.Auth.LoginVerifyResponse>({} as Api.Auth.LoginVerifyResponse);
  // 保存access_token用于注册
  const accessToken = ref<string>('');

  const label = computed(() => {
    let text = $t('page.login.codeLogin.getCode');

    const countingLabel = $t('page.login.codeLogin.reGetCode', { time: count.value });

    if (loading.value) {
      text = '';
    }

    if (isCounting.value) {
      text = countingLabel;
    }

    return text;
  });
  function isEmailValid(email: string) {
    if (email.trim() === '') {
      window.$message?.error?.($t('form.email.required'));

      return false;
    }

    if (!REG_EMAIL.test(email)) {
      window.$message?.error?.($t('form.email.invalid'));

      return false;
    }

    return true;
  }

  async function getVerifyCodeByEmail(rquest: Api.Auth.LoginVerifyRequest) {
    const valid = isEmailValid(rquest.username);

    if (!valid || loading.value) {
      return { success: false, userExists: false };
    }

    startLoading();

    const { error, data } = await postVerifyEmailCode(rquest);
    if (error) {
      endLoading();
      window.$message?.error?.(error.response?.data?.error || error.message);

      return { success: false, userExists: false };
    }
    if (data?.user_exists) {
      // request to register
      window.$message?.error?.($t('page.login.register.userExist'));
    } else {
      //   window.$message?.success($t('page.login.common.validateSuccess'));
      window.$message?.success?.($t('page.login.codeLogin.sendCodeSuccess'));
    }
    // 保存返回的数据
    if (data) {
      Object.assign(verifyData, data);
      // 保存access_token用于后续注册
      if (data.access_token) {
        accessToken.value = data.access_token;
      }
    }
    // request
    // await new Promise(resolve => {
    //   setTimeout(resolve, 500);
    // });

    start();

    endLoading();

    return { success: !data?.user_exists, userExists: data?.user_exists || false };
  }

  return {
    label,
    start,
    stop,
    isCounting,
    loading,
    verifyData,
    accessToken,
    getVerifyCodeByEmail
  };
}

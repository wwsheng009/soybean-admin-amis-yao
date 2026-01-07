<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { fetchCaptcha, postRegister } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useVerifyCode } from '@/hooks/business/verify-code';
import { $t } from '@/locales';

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { label, isCounting, loading, verifyData, getVerifyCodeByEmail } = useVerifyCode();

interface FormModel {
  email: string;
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
  captcha: string;
}

const model: FormModel = reactive({
  email: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  captcha: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  return {
    email: formRules.email,
    phone: formRules.phone,
    code: formRules.code,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.password),
    captcha: formRules.code
  };
});
const captcha: Api.Auth.CaptchaInfo = reactive({
  captcha_id: '',
  captcha_image: '',
  captcha: ''
});
async function handleSubmit() {
  await validate();
  const { error } = await postRegister({
    otp_id: verifyData?.otp_id,
    password: model.password,
    confirm_password: model.confirmPassword,
    locale: 'zh-CN',
    verification_code: ''
  });
  if (error) {
    window.$message?.error?.(error.message);
    return;
  }
  window.$message?.success?.($t('page.login.register.registerSuccess'));
}

async function updateCaptcha() {
  const { data } = await fetchCaptcha();
  model.captcha = data?.captcha || '';
  Object.assign(captcha, data);
}
onMounted(() => {
  updateCaptcha();
});
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
    </NFormItem>
    <!--
 <NFormItem path="phone">
      <NInput v-model:value="model.phone" :placeholder="$t('page.login.common.phonePlaceholder')" />
    </NFormItem> 
-->
    <NFormItem path="captcha">
      <NInput v-model:value="model.captcha" type="text" :placeholder="$t('page.login.common.captchaPlaceholder')" />
      <NImage :src="captcha.captcha_image" alt="captcha" :preview-disabled="true" @click.prevent="updateCaptcha" />
    </NFormItem>
    <NFormItem path="code">
      <div class="w-full flex-y-center gap-16px">
        <NInput v-model:value="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
        <NButton
          size="large"
          :disabled="isCounting"
          :loading="loading"
          @click="
            getVerifyCodeByEmail({
              username: model.email,
              captcha: model.captcha,
              locale: 'zh-CN',
              captcha_id: captcha.captcha_id || ''
            })
          "
        >
          {{ label }}
        </NButton>
      </div>
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NFormItem path="confirmPassword">
      <NInput
        v-model:value="model.confirmPassword"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
      />
    </NFormItem>
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped></style>

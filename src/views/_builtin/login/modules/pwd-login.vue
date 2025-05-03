<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { fetchCaptcha } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  userName: string;
  email: string;
  password: string;
  captcha: {
    id: string;
    code: string;
  };
}

const model: FormModel = reactive({
  userName: 'Admin',
  email: '',
  password: '',
  captcha: {
    id: '',
    code: ''
  }
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    email: formRules.email,
    password: formRules.pwd,
    captcha: formRules.code
  };
});

async function handleSubmit() {
  await validate();
  await authStore.login({ userName: model.email, password: model.password, captcha: model.captcha });
  await updateCaptcha();
}

const captcha: Api.Auth.CaptchaInfo = reactive({
  captcha: {
    code: '',
    id: ''
  }
});
async function updateCaptcha() {
  const { data } = await fetchCaptcha();
  model.captcha.id = data?.captcha.id || '';
  Object.assign(captcha, data);
}
onMounted(() => {
  updateCaptcha();
});
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <!--
 <NFormItem path="userName">
      <NInput v-model:value="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem> 
-->
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NFormItem path="captcha">
      <NInput
        v-model:value="model.captcha.code"
        type="text"
        :placeholder="$t('page.login.common.captchaPlaceholder')"
      />
      <NImage :src="captcha.captcha.code" alt="captcha" :preview-disabled="true" @click.prevent="updateCaptcha" />
    </NFormItem>
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </NButton>
      </div>
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </NButton>
      </div>
      <!--
      <NDivider class="text-14px text-#666 !m-0">{{ $t('page.login.pwdLogin.otherAccountLogin') }}</NDivider>
      <div class="flex-center gap-12px">
        <NButton v-for="item in accounts" :key="item.key" type="primary" @click="handleAccountLogin(item)">
          {{ item.label }}
        </NButton>
      </div>
      -->
    </NSpace>
  </NForm>
</template>

<style scoped></style>

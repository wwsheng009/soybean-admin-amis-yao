export function deleteXgenToken(tokenIn?: string) {
  const tokenName = tokenIn ? tokenIn : 'token';
  sessionStorage.removeItem(`xgen:${tokenName}`);
  localStorage.removeItem(`xgen:${tokenName}`);
  deleteCookie(tokenName);
}

export function checkLogin() {
  const token = getXgenToken();
  if (!token) {
    // history.push('/login');
  }
}
export function xgenLogout() {
  deleteXgenToken('token');
  deleteXgenToken('studio');
  localStorage.removeItem(`store`);

  // history.replace('/login');
  // window.location.reload();
}

/**
 * 获取xgenToken的保存类型，与xgen保持一致
 * @returns
 */
function getTokenStorageType() {
  const storage = localStorage.getItem(`xgen:token_storage`);
  let stoarge_type = 'localStorage';
  if (storage) {
    try {
      const o = JSON.parse(storage);
      if (o.value === 'sessionStorage') {
        stoarge_type = 'sessionStorage';
      }
    } catch (error) {}
  }
  return stoarge_type;
}
export function setTokenStorageType(typeIn: string) {
  const type = typeIn === 'localStorage' ? 'localStorage' : 'sessionStorage';
  xgenSetStorage(`xgen:token_storage`, type, 'localStorage');
}

/**
 * 保存xgen的设置，与xgen保持一致
 * @param {string} key key
 * @param {object} obj object
 * @param {string} storageIn
 */
function xgenSetStorage(key: string, obj: any, storageIn?: string) {
  // 默认使用localStorage
  const storage = storageIn === 'sessionStorage' ? sessionStorage : localStorage;
  let ty = 'String';
  let value = obj;
  switch (typeof obj) {
    case 'string':
      ty = 'String';
      value = encodeURIComponent(obj);
      break;
    case 'object':
      ty = 'Object';
      if (Array.isArray(obj)) {
        ty = 'Array';
      }
      break;
    case 'number':
      ty = 'Number';
      break;
    default:
      // console.log(`Error=========> Not Support Type:${typeof obj}`);
      break;
  }

  storage.setItem(key, JSON.stringify({ type: ty, value }));
}

function xgenGetStorage(key: string, storageIn?: string): object | string | null {
  const storage = storageIn === 'sessionStorage' ? sessionStorage : localStorage;

  let s = storage.getItem(key);

  if (s && key.startsWith('xgen:')) {
    try {
      s = JSON.parse(s);
    } catch (error) {}
  }
  return s;
}
export interface XgenResLogin {
  expires_at: number;
  menus: { items: Array<App.Menu>; setting: Array<App.Menu> };
  token: string;
  user: App.User;
  type: App.UserType;
  studio?: {
    expires_at: number;
    port: number;
    token: string;
  };
}

export function xgenAfterLogin(payload: XgenResLogin) {
  const token = encodeURIComponent(payload.token);

  const newDate = new Date();
  if (payload.expires_at) {
    newDate.setTime(payload.expires_at * 1000);
  } else {
    newDate.setTime(newDate.getTime() + 24 * 60 * 60 * 1000);
  }

  let expires = `expires=${newDate.toUTCString()}`;
  document.cookie = `token=${token};${expires};path=/`;
  document.cookie = `username=${payload.user.name};${expires};path=/`;
  document.cookie = `email=${payload.user.email};${expires};path=/`;

  const tokenStoarageType = getTokenStorageType();
  xgenSetStorage('xgen:token', token, tokenStoarageType);
  xgenSetStorage('xgen:menus', payload.menus);
  xgenSetStorage('xgen:menu', payload.menus.items);
  xgenSetStorage('xgen:user', payload.user);

  if (payload.studio) {
    // studio

    if (payload.studio.expires_at) {
      newDate.setTime(payload.studio.expires_at * 1000);
    } else {
      newDate.setTime(newDate.getTime() + 24 * 60 * 60 * 1000);
    }
    expires = `expires=${newDate.toUTCString()}`;
    document.cookie = `studio=${encodeURIComponent(payload.studio.token)};${expires};path=/`;

    xgenSetStorage('xgen:studio', payload.studio, tokenStoarageType);
  }
}
export function setToken(tokenIn: string) {
  const token = encodeURIComponent(tokenIn);

  const tokenStoarageType = getTokenStorageType();
  xgenSetStorage('xgen:token', token, tokenStoarageType);
}
export function getXgenToken(tokenIn?: string) {
  const tokenName = tokenIn ? tokenIn : 'token';
  const stoarage_type = getTokenStorageType();

  const tokenObj = xgenGetStorage(`xgen:${tokenName}`, stoarage_type) as any;

  let token = null;
  if (tokenObj) {
    if (tokenObj && tokenName === 'studio') {
      token = tokenObj.value?.token;
    } else {
      token = tokenObj.value;
    }
  }
  if (token) {
    setCookie(tokenName, token, 8);
  } else {
    // 需要确保当从xgen里退出后，本地的cookie也不能生效，两边的token进行同步
    deleteCookie(tokenName);
  }
  return token;
}
function setCookie(name: string, value: string, hours: number) {
  let expires = '';
  if (hours) {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export function getCookie(name: string) {
  const cookies = document.cookie.split(';');
  const nameEQ = `${name}=`;
  const foundCookie = cookies.find(cookie => {
    return cookie.trim().startsWith(nameEQ);
  });

  if (foundCookie) {
    return decodeURIComponent(foundCookie.substring(nameEQ.length));
  }

  return null;
}

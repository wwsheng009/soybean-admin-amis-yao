export function attachmentAdpator(response: any, api?: any) {
  if (shouldHandleAttachment(response)) {
    return handleAttachmentResponse(response, api);
  }
  if (shouldParseBlob(response)) {
    return parseBlobResponse(response);
  }
  return response;
}

// 工具函数封装
function getFilename(disposition: string, api?: any) {
  if (api?.downloadFileName) return api.downloadFileName;

  const filenameRegex = /filename\*?=((['"]).*?\2|[^;\n]*)/gi;
  const matches = [...disposition.matchAll(filenameRegex)];
  const encodedName = matches.pop()?.[1] || '';

  let filename = encodedName.replace(`UTF-8''`, '').replace(/['"]/g, '');

  if (/%[0-9A-Fa-f]{2}/.test(filename)) {
    filename = decodeURIComponent(filename);
  }

  return filename;
}

function createBlob(response: any) {
  const type = response.headers['content-type'];
  return response.data?.data.toString() === '[object Blob]'
    ? response.data.data
    : new Blob([response.data?.data], { type });
}

function handleDownload(blob: Blob, filename: string) {
  if ((window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
    return;
  }

  const URL = window.URL || (window as any).webkitURL;
  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  if (typeof a.download !== 'undefined') {
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    window.location.assign(downloadUrl);
  }

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
}

function handleAttachmentResponse(response: any, api?: any) {
  const disposition = response.headers['content-disposition'];
  const filename = getFilename(disposition, api);
  const blob = createBlob(response);

  handleDownload(blob, filename);

  return {
    ...response,
    data: { status: 0, msg: 'Embed.downloading' }
  };
}

function parseBlobResponse(response: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        resolve({
          ...response,
          data: { ...JSON.parse(reader.result as string) }
        });
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsText(response.data.data);
  });
}

// 条件判断封装
function shouldHandleAttachment(response: any) {
  return response?.headers?.['content-disposition']?.includes('attachment');
}

function shouldParseBlob(response: any) {
  return response.data?.data?.toString() === '[object Blob]';
}

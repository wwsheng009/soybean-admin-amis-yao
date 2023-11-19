export function attachmentAdpator(response: any, api?: any) {
  if (response && response.headers && response.headers['content-disposition']) {
    const disposition = response.headers['content-disposition'];
    let filename = '';

    if (disposition && disposition.indexOf('attachment') !== -1) {
      // 如果 api 中配置了，则优先用 api 中的配置
      if (api?.downloadFileName) {
        filename = api.downloadFileName;
      } else {
        // disposition 有可能是 attachment; filename="??.xlsx"; filename*=UTF-8''%E4%B8%AD%E6%96%87.xlsx
        // 这种情况下最后一个才是正确的文件名
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i;

        const matches = disposition.match(filenameRegex);
        if (matches && matches.length) {
          filename = matches[1].replace(`UTF-8''`, '').replace(/['"]/g, '');
        }

        // 很可能是中文被 url-encode 了
        if (filename && filename.replace(/[^%]/g, '').length > 2) {
          filename = decodeURIComponent(filename);
        }
      }

      const type = response.headers['content-type'];
      const blob =
        response.data?.data.toString() === '[object Blob]'
          ? response.data?.data
          : new Blob([response.data?.data], { type });
      if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        (window.navigator as any).msSaveBlob(blob, filename);
      } else {
        const URL = window.URL || (window as any).webkitURL;
        const downloadUrl = URL.createObjectURL(blob);
        if (filename) {
          // use HTML5 a[download] attribute to specify filename
          const a = document.createElement('a');
          // safari doesn't support this yet
          // eslint-disable-next-line max-depth
          if (typeof a.download === 'undefined') {
            (window as any).location = downloadUrl;
          } else {
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
          }
        } else {
          (window as any).location = downloadUrl;
        }
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 100); // cleanup
      }

      return {
        ...response,
        data: {
          status: 0,
          msg: 'Embed.downloading'
        }
      };
    }
  } else if (response.data?.data && response.data?.data.toString() === '[object Blob]') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', _e => {
        const text = reader.result as string;

        try {
          resolve({
            ...response,
            data: {
              ...JSON.parse(text)
            }
          });
        } catch (e) {
          reject(e);
        }
      });

      reader.readAsText(response.data);
    });
  }

  return response;
}

export default attachmentAdpator;

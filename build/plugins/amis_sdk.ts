import type { Plugin } from 'vite';

export function setupAmisSdkPlugin() {
  const plugin: Plugin = {
    name: 'html-plugin',
    apply: 'build',
    transformIndexHtml(html) {
      return html
        .replace(/\/soy-admin\/amis\/jssdk/g, '/amis-admin/jssdk')
        .replace(/\/soy-admin\/scripts/g, '/amis-admin/scripts')
        .replace(/\/amis\/jssdk/g, '/amis-admin/jssdk');
    }
  };

  return plugin;
}

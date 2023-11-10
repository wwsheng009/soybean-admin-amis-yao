// svg-icon组件

// @ts-ignore
const React = amisRequire('react');

export const AmisSvgIcon = (props: any) => {
  const dom = React.useRef(null);
  let icon = props.icon;

  if (icon.startsWith('${') && icon.endsWith('}')) {
    icon = props?.value;
  }

  React.useEffect(() => {
    dom.current.innerHTML = `<svg-icon class="${props.className}" icon="${icon}" />`;
  });

  return React.createElement('div', { ref: dom });
};

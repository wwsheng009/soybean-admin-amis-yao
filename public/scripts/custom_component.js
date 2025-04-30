(() => {
  // amis 扩展

  const amisLib = amisRequire('amis');
  // 自定义组件
  const React = amisRequire('react');

  // 注册自定义组件
  amisLib.Renderer({
    test: /(^|\/)my-sse-vue/,
    type: 'my-sse-vue'
  })(CustomSSEComponent);

  /**
   * 自定义的SSE Form Item组件,可以通过SSE与AI助手进行交互，
   *
   * 需要与一个editor组件配合使用，通过输入框发送请求到后端，并通过SSE接收AI助手的回复。
   *
   * 使用assistantId参数配置选择后端的助手进行交互，
   *
   * 使用componentId参数配置目标组件的ID，
   *
   * 使用componentName参数配置目标组件的名称。
   *
   * 自定义组件，props 中可以拿到配置中的所有参数，比如 props.label 是 'Name'， props.env 可以拿到env配置中的配置。
   *
   * { "label": "AI", "type": "my-sse-vue", "name": "test", "componentId": "u:18805e926840", "componentName": "source",
   * "placeHolder": "请输入需要生成的模型的描述", "assistantId": "model" }
   *
   * @param {Object} props - 组件属性
   * @param {string} props.label - 组件的标签
   * @param {string} props.name - 组件的名称
   * @param {string} props.placeHolder - 输入框的占位符
   * @param {string} props.assistantId - AI助手的ID
   * @param {string} props.componentId - 目标组件的ID
   * @param {string} props.componentName - 目标组件的名称
   * @returns 返回自定义的SSE组件
   */
  function CustomSSEComponent(props) {
    const dom = React.useRef(null);
    React.useEffect(() => {
      const html = `
        <label class="cxd-Form-label cxd-Form-itemColumn--normal">
          <span><span class="cxd-TplField" >
          <span>${props?.label}</span>
          </span></span>
        </label>
        <div class="cxd-Form-value">
          <div class="cxd-Form-control cxd-TextControl">
            <div class="cxd-TextControl-input">
                <input v-model="inputValue" name=${props?.name} size="10" type="text" placeholder=${props?.placeHolder} />
                <button @click.prevent="toggleSSE">
                  {{ buttonText }}
                  <span v-if="isLoading" class="loading-spinner"></span>
                </button>
            </div>
          </div>
        </div>
    `;
      dom.current.innerHTML = html;

      const { createApp, ref, onBeforeUnmount } = Vue;

      const app = createApp({
        setup() {
          const message = ref('Waiting for server...');
          const inputValue = ref('');
          const buttonText = ref('问AI');
          const isLoading = ref(false); // 新增状态变量，用于控制加载动画
          const sse = ref(null);

          function toggleSSE() {
            if (buttonText.value === '问AI') {
              startSSE();
              buttonText.value = '停止';
              isLoading.value = true; // 开始加载动画
            } else {
              stopSSE();
              buttonText.value = '问AI';
              isLoading.value = false; // 停止加载动画
            }
          }

          function startSSE() {
            if (typeof EventSource === 'undefined') {
              message.value = 'SSE not supported by your browser.';
              return;
            }
            const neo_api = `/api/__yao/neo`;
            sse.value = new EventSource(
              `${neo_api}?content=${encodeURIComponent(
                inputValue.value
              )}&assistant_id=${props?.assistantId}&token=${encodeURIComponent(yao_amis.getToken())}`
            );
            let targetComponent = null;
            if (props?.componentId) {
              // amisInstance是一个全局对象，当在首页中初始化amis实例时会构建出一个scopedContext，在里面可以找到对应的组件实例。
              targetComponent = amisInstance.getComponentById(props?.componentId);
            } else if (props?.componentName) {
              targetComponent = amisInstance.getComponentByName(props?.componentName);
            }

            sse.value.onmessage = event => {
              const data = event.data;
              if (data !== null && data !== undefined && data !== '') {
                formated_data = JSON.parse(data);
                const { text, done } = formated_data;
                if (done) {
                  stopSSE(); // 请求结束时自动停止SSE并更新按钮状态
                } else if (text) {
                  message.value += text;
                  const obj = message.value; // { [props.$schema.formItem]: message.value };
                  if (targetComponent) {
                    if (targetComponent?.setData) {
                      // debugger;
                      targetComponent?.setData(obj, true, null, null);
                    } else {
                      targetComponent?.props.onChange?.(obj);
                    }
                  }
                }
              }
            };
            sse.value.onopen = () => {
              message.value = '';
            };
            sse.value.onerror = () => {
              sse.value.close();
              buttonText.value = '问AI'; // 发生错误时也恢复按钮状态
              isLoading.value = false; // 停止加载动画
            };
          }

          function stopSSE() {
            if (sse.value) {
              sse.value.close();
              sse.value = null;
              buttonText.value = '问AI'; // 停止SSE时恢复按钮状态
              isLoading.value = false; // 停止加载动画
            }
          }

          onBeforeUnmount(() => {
            stopSSE();
          });

          return {
            message,
            inputValue,
            buttonText,
            isLoading,
            toggleSSE
          };
        }
      });

      app.mount(dom.current);
    }, []);

    return React.createElement('div', {
      ref: dom,
      className: 'cxd-Form-item cxd-Form-item--horizontal is-required',
      'data-role': 'form-item',
      'data-amis-name': props?.name
    });
  }
})();

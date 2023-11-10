# Soybean-admin与AMIS集成

## 演示地址

[Soybean演示](http://fun.wwsheng.cloud:5099/soy-admin)

[Amis演示](http://fun.wwsheng.cloud:5099/amis-admin)

[Yao-Xgen](http://fun.wwsheng.cloud:5099/admin/login/admin)

## 项目介绍

此项目用于测试Soybean-admin与amis sdk进行功能集成。

在这个项目里，集成了4个组件：

前端：

- [Soybean-admin](https://github.com/honghuangdc/soybean-admin)
- [Amis-sdk](https://aisuda.bce.baidu.com/amis/zh-CN/docs/start/getting-started#sdk)

后端：

- [Yao-amis-admin](https://github.com/wwsheng009/yao-amis-admin)
- [Yao](https://github.com/YaoApp/yao)

整个架构如下：

Amis-sdk,提供快速的表单，页面开发，使用json配置快速开发页面，不需要前端开发的能力。

SoyBean-admin,提供前端登录，展示框架，可用于开发高度定义化的组件，也可以给amis-sdk开发自定义组件，可以弥补amis-sdk自定义开发困难的问题。

Yao-amis-admin,提供后端功能，提供一些常用的后台管理功能页面，最终前端项目整合后的使用这个项目来执行。

Yao,Yao-amis-admin的执行引擎，AI-应用引擎。Yao-amis-admin使用Yao引擎。

## 感谢

此项目中的Amis-sdk集成功能由另外一个项目启发：

[owl-admin-demo](https://github.com/Slowlyo/owl-admin-demo)

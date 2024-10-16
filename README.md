# Sensorsd 组件模板

## 开发指南

### Getting started

1. ```yarn global add @sensorsd/toolchain```
2. ```sensorsd init``` 在当前空目录初始化， ```sensorsd create <folder>``` （创建并在）目标目录初始化
3. 修改组件相关信息 请勿 ```rm -rf .git``` 或删除 名为 ```@sensorsd-component-template``` 的 remote 以及 名为 ```@sensorsd-component-template/workspace``` 的 branch (会导致后续 upgrade 产生较多 conflict)
4. ```npm start``` 即可启动 `webpack-dev-server`
5. ```npm run build``` 即可使用 `father` 进行 `build`
6. ```sensorsd upgrade``` 即可更新模板, 中途可能提示 conflict 请按提示处理

### 规范

1. 所有组件代码均在 `src` 下完成
2. 在 `demo/demo.js` 中新增组件示例（文档可暂时用 `Table` 写在 `demo` 中）
3. 所有 `classname` 均使用全局命名，形如 `sensorsd-component-name-some-parts`
4. 虽然 `demo` 框架包含 `redux`, 但作为 UI 组件, 状态管理应使用在内部使用 state 处理

### Demo

```import Demo from '@sensorsd/component-template/demo' ```

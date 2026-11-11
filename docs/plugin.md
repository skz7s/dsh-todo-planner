# Harness 插件指南

DSH Todo Planner 是 DeepSeek Harness 的原生 Web 插件。它只向已有 Harness Profile 增加 Todo Host、认证 Remote、右侧任务面板、Schedule 联动、用量统计和模型路由网页搜索；会话、工作区、权限、认证和原生界面继续由 Harness 管理。

## 安装已发布版本

在已初始化的 Web Profile 中执行：

```sh
dsh plugin --profile web add dsh-todo-planner
dsh --profile web
```

Bundle patch 会注册 Todo Host、Typert Remote loader、模型路由网页搜索，并在 Profile 尚未提供 Schedule 服务时加入 Schedule。已有 Schedule 配置会复用，不会启动第二个实例。客户端通过 Harness 的认证 Remote 访问 Todo 数据，因此插件不需要额外的 API 端口或本地启动器。

`dsh` 通过包名 `dsh-todo-planner` 和 `package.json` 中的 `dsh.bundle.patch`、`dsh.client` 元数据识别这个插件：前者声明 Profile bundle patch，后者声明 Web Client 模块及其注入依赖。包名、Host 的 `name`、patch 中的模块 id 保持一致，安装后即可由 `dsh plugin` 纳入当前 Profile。

## 从源码安装

在本仓库目录执行：

```sh
dsh plugin --profile web add /absolute/path/to/dsh-todo-planner
dsh --profile web
```

如果 Web Profile 已开启 HMR，安装完成后页面会随 Host 图更新；否则重启 Profile。

## 数据位置

插件默认把数据放在 `$DSH_HOME/todo-harness`。可以通过 `DSH_TODO_PLANNER_DATA_DIR` 指定数据目录，也可以在 Profile patch 的 `dsh-todo-planner` 配置中指定 `dataRoot`、`dataFile`、`usageFile`、`settingsFile` 和 `workspaceRoot`。旧环境变量 `TODO_HARNESS_DATA_DIR` 和 `TODO_HARNESS_WORKSPACE_DIR` 仍然兼容，已有数据无需迁移。插件会在 Harness 图中直接使用 Todo、用量和每日 Token 预算仓储，数据写入采用文件锁和原子替换。

## 保留的针对性优化

- Todo 工具在每轮开始和结束时读取并核对持久化状态，支持排期、依赖、协作子任务和工时估算。
- 模型发现失败时可以在原生模型设置中输入独立的模型列表地址，地址只对当前请求生效。
- 网页搜索按当前 Provider 和模型路由到 Responses、Anthropic、Gemini、Perplexity 或 DeepSeek Search，并保留结构化来源和用量；失败时不会静默切换供应商。
- 模型能力默认值会补齐图像输入和适用的 reasoning levels，同时保留用户显式配置。

## 卸载

```sh
dsh plugin --profile web remove dsh-todo-planner
```

卸载只移除 Profile 中的插件，不删除 Todo 数据文件。删除数据前请先备份 `$DSH_HOME/todo-harness`。

插件包与当前 DeepSeek Harness `0.2.0-rc.2` API 对齐；升级 Harness 时应运行项目测试，并检查右侧 Sidebar、Remote 和 Client slot 的兼容性。

## 发布到 npm

首次发布不需要创建组织。先在 [npmjs.com](https://www.npmjs.com/) 注册个人账号并验证邮箱，然后在本机登录：

```sh
npm login
npm whoami
```

发布前先检查包内容和元数据：

```sh
npm pack --dry-run
npm publish --access public
```

发布成功后，用户即可直接安装：

```sh
dsh plugin --profile web add dsh-todo-planner
```

个人账号足够维护一个插件。只有需要多人共同管理、统一发布多个包，或希望把项目归属于团队时，才建议创建 npm Organization；Organization 会带来成员权限和计费管理，不是发布单个公开包的前置条件。

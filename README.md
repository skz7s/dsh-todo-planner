# DSH Todo Planner

[English](README.en.md)

DSH Todo Planner 是一个原生 DeepSeek Harness 插件。它增加持久化 Todo 工具、右侧任务面板、计划联动、用量统计，并保留针对模型能力发现和网页搜索路由的优化；会话、工作区、权限和原生界面仍由 Harness 管理。

## 安装

在已初始化的 Harness Web Profile 中执行：

```sh
dsh plugin --profile web add dsh-todo-planner
dsh --profile web
```

从源码安装：

```sh
git clone https://github.com/skz7s/dsh-todo-planner.git
dsh plugin --profile web add /absolute/path/to/dsh-todo-planner
dsh --profile web
```

Bundle 会注册 Todo Host、认证 Remote、Schedule 联动和模型路由网页搜索。Todo 数据、用量和设置默认保存在 `$DSH_HOME/todo-harness`，也可以在 Profile patch 的 `dsh-todo-planner` 配置中指定 `dataRoot`、`dataFile`、`usageFile`、`settingsFile` 和 `workspaceRoot`。数据目录沿用旧名称以兼容已有安装。

## 开发

```sh
npm ci
npm test
npm run check
```

项目固定依赖 DeepSeek Harness `0.2.0-rc.2`。插件安装、卸载和数据备份说明见 [docs/plugin.md](docs/plugin.md)，架构说明见 [docs/architecture.md](docs/architecture.md)。

Apache-2.0，详见 [LICENSE](LICENSE)。

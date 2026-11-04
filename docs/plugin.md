# Harness 插件版

Todo Harness 可以作为 DeepSeek Harness 的可安装 bundle 使用。插件版保留用户现有的 Harness Profile，只增加 Todo 工具、任务面板、计划联动、用量统计和品牌设置；不会自动改变原生权限策略，也不会隐藏原生设置页。

## 安装已发布版本

在已初始化的 Web Profile 中执行：

```sh
dsh plugin --profile web add todo-harness
dsh --profile web
```

`todo-harness` 的 bundle patch 会注册 Todo Host、Typert Remote loader，并在 Profile 尚未提供 Schedule 服务时加入 Schedule。已有 Schedule 配置会直接复用，不会再启动第二个实例。Web Client 通过 Harness 的认证 Remote 访问 Todo 数据，因此插件版不需要额外启动 Todo API 端口。

## 从源码安装

在本仓库目录执行：

```sh
dsh plugin --profile web add /absolute/path/to/Todo-Harness
dsh --profile web
```

如果 Web Profile 已开启 HMR，安装完成后页面会随 Host 图更新；否则重启 Profile。

## 数据位置

插件版默认把数据放在 `$DSH_HOME/todo-harness`。可以通过 `TODO_HARNESS_DATA_DIR` 指定数据目录，也可以在 Profile patch 的 `todo-harness` 配置中指定 `dataRoot`、`dataFile`、`usageFile`、`settingsFile` 和 `workspaceRoot`。

## 卸载

```sh
dsh plugin --profile web remove todo-harness
```

卸载只移除 Profile 中的插件，不删除 Todo 数据文件。删除前请先备份数据目录。

## 与独立版的区别

独立版由 `npm start` 或 Electron 启动器负责 Profile patch、端口、权限、默认模型、搜索和品牌配置，适合直接面向普通用户发布。插件版适合已有 Harness 用户，核心 Host、Remote、存储和 Web UI 与独立版共用。

插件包与当前 DeepSeek Harness `0.2.0-rc.2` API 对齐；升级 Harness 时应同时运行项目测试并检查右侧 Sidebar 与 Client slot 的兼容性。

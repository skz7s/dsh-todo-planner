# DSH Todo Planner

[简体中文](README.md)

DSH Todo Planner is a native DeepSeek Harness plugin. It adds persistent Todo tools, a right-side task panel, schedule integration, usage tracking, and targeted model discovery and web-search routing improvements. Harness continues to own sessions, workspaces, permissions, and the native client chrome.

## Install

In an initialized Harness Web profile:

```sh
dsh plugin --profile web add dsh-todo-planner
dsh --profile web
```

To install from a checkout:

```sh
git clone https://github.com/skz7s/dsh-todo-planner.git
dsh plugin --profile web add /absolute/path/to/dsh-todo-planner
dsh --profile web
```

The bundle registers the Todo Host, authenticated Remote, Schedule integration, and model-routed web search. Todo data, usage, and settings default to `$DSH_HOME/todo-harness`; configure `dataRoot`, `dataFile`, `usageFile`, `settingsFile`, or `workspaceRoot` on the `dsh-todo-planner` profile entry when needed. The storage directory keeps its legacy name so existing installations need no migration.

## Development

```sh
npm ci
npm test
npm run check
```

The plugin targets DeepSeek Harness `0.2.0-rc.2`. See [docs/plugin.md](docs/plugin.md) for installation, removal, and backup guidance, and [docs/architecture.md](docs/architecture.md) for the design. Apache-2.0; see [LICENSE](LICENSE).

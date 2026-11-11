# Architecture

DeepSeek Harness owns conversation history, session management, composer behavior, attachments, images, voice input, workspaces, and permissions. DSH Todo Planner is a bundle that extends that graph with persistent Todo services and a focused Web client contribution.

```text
DeepSeek Harness Web Profile
  ├── native conversation, session list, workspaces, attachments, images, voice input
  ├── Todo tools ───────────────┐
  ├── Todo Remote and panel ────┴─ TodoRepository ── todos.json
  ├── Schedule UI/tools ─────────── Harness Schedule service
  ├── session and web-search usage ─ UsageRepository ── usage.json
  └── daily token budget ─────────── SettingsRepository ─ settings.json
```

`src/plugins/dsh-todo-plugin.js` is the Host entry. It resolves the Profile config, opens the Todo workspace, initializes the repositories, provides them to the Harness graph, registers direct-persistence Todo tools, installs model capability defaults, and records native session and auxiliary web-search usage events.

`src/plugins/dsh-todo-planner-remotes.js` exposes the repositories and Schedule/default-model operations through the authenticated Typert Remote. `src/plugins/typert.host.js` and `src/plugins/typert.remote.js` keep the wire schemas explicit, so the Web client does not need a second HTTP API or a process-local adapter.

`src/dsh/client.js` is a Harness client module, not a standalone application shell. It registers the right-side Todo panel, Today/Plan/Scheduled views, schedule editing, Todo dispatch into native sessions, the daily usage meter, and the mobile layout. It leaves Harness branding, locale, settings navigation, permissions, and session chrome in place. The model-discovery URL control remains a narrow workaround for providers whose catalog endpoint differs from their inference endpoint.

`src/plugins/web-search.js` registers `dsh-todo-planner-auto` behind Harness's existing `web_search` tool. Each operation snapshots the initiating session's Provider/model and live routing overrides, then uses the matching native search protocol or the independent DeepSeek Search API. Structured search metadata is required; ordinary model prose cannot masquerade as search results. Auxiliary usage is emitted as `web/model-search-usage` and persisted by the Host listener.

`TodoRepository`, `UsageRepository`, and `SettingsRepository` serialize writes with file locks and atomic JSON replacement. The plugin bundle is installed into an existing Harness profile through `cordis.patch.yml`; there is no launcher, Electron shell, loopback server, or duplicate client data boundary in this project.

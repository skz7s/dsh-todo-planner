import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { TodoRepository } from '../src/storage/todo-repository.js';
import { UsageRepository } from '../src/storage/usage-repository.js';
import { SettingsRepository } from '../src/storage/settings-repository.js';
import { resolveTodoHarnessConfig } from '../src/plugins/config.js';
import { createTodoHarnessStore } from '../src/plugins/todo-harness-store.js';
import { TodoHarnessRemotes } from '../src/plugins/todo-harness-remotes.js';

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'todo-harness-store-'));
  const repository = await new TodoRepository(join(directory, 'todos.json')).init();
  const usageRepository = await new UsageRepository(join(directory, 'usage.json')).init();
  const settingsRepository = await new SettingsRepository(join(directory, 'settings.json')).init();
  const store = createTodoHarnessStore({ repository, usageRepository, settingsRepository });
  const scheduleCalls = [];
  const remote = Object.create(TodoHarnessRemotes.prototype);
  remote.ctx = {
    todoHarnessStore: store,
    schedule: { create: async (...args) => { scheduleCalls.push(args); return { id: 'schedule-1', kind: 'at' }; } },
    agentDefaultModel: {
      currentSelection: () => ({ provider: 'openai', model: 'gpt-4.1' }),
      saveSelection: async (selection) => { remote.savedSelection = selection; }
    }
  };
  return { directory, repository, usageRepository, settingsRepository, store, remote, scheduleCalls };
}

test('default config resolves environment paths and explicit plugin paths', () => {
  const previous = {
    data: process.env.TODO_HARNESS_DATA_DIR,
    workspace: process.env.TODO_HARNESS_WORKSPACE_DIR,
    dshHome: process.env.DSH_HOME
  };
  const dataRoot = join(tmpdir(), 'todo-harness-config-data');
  const workspaceRoot = join(tmpdir(), 'todo-harness-config-workspace');
  const dshHome = join(tmpdir(), 'todo-harness-config-dsh');
  process.env.TODO_HARNESS_DATA_DIR = dataRoot;
  process.env.TODO_HARNESS_WORKSPACE_DIR = workspaceRoot;
  process.env.DSH_HOME = dshHome;
  try {
    assert.deepEqual(resolveTodoHarnessConfig(), {
      dataRoot,
      dataFile: join(dataRoot, 'todos.json'),
      usageFile: join(dataRoot, 'usage.json'),
      settingsFile: join(dataRoot, 'settings.json'),
      workspaceRoot
    });
    const explicitRoot = join(tmpdir(), 'todo-harness-explicit-data');
    const explicitWorkspace = join(tmpdir(), 'todo-harness-explicit-workspace');
    assert.deepEqual(resolveTodoHarnessConfig({
      dataRoot: explicitRoot,
      dataFile: join(explicitRoot, 'custom-todos.json'),
      usageFile: join(explicitRoot, 'custom-usage.json'),
      settingsFile: join(explicitRoot, 'custom-settings.json'),
      workspaceRoot: explicitWorkspace
    }), {
      dataRoot: explicitRoot,
      dataFile: join(explicitRoot, 'custom-todos.json'),
      usageFile: join(explicitRoot, 'custom-usage.json'),
      settingsFile: join(explicitRoot, 'custom-settings.json'),
      workspaceRoot: explicitWorkspace
    });
  } finally {
    for (const [key, value] of Object.entries({
      TODO_HARNESS_DATA_DIR: previous.data,
      TODO_HARNESS_WORKSPACE_DIR: previous.workspace,
      DSH_HOME: previous.dshHome
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('shared store exposes CRUD, settings, usage, brand, and schedule Remote operations', async () => {
  const { remote, repository, usageRepository, scheduleCalls } = await fixture();
  const scheduled = await remote.createSchedule({ sessionId: 'session-1', request: { title: 'Check in', prompt: 'Review progress' } });
  assert.deepEqual(scheduled, { id: 'schedule-1', kind: 'at' });
  assert.deepEqual(scheduleCalls, [['session-1', { title: 'Check in', prompt: 'Review progress' }]]);
  assert.deepEqual(remote.getDefaultModel(), { provider: 'openai', model: 'gpt-4.1' });
  await remote.setDefaultModel({ provider: 'anthropic', model: 'claude-sonnet' });
  assert.deepEqual(remote.savedSelection, { provider: 'anthropic', model: 'claude-sonnet' });

  const created = await remote.createTodo({ title: 'Remote task', priority: 'high' });
  assert.equal(created.todo.title, 'Remote task');
  assert.deepEqual((await remote.listTodos({})).todos.map((todo) => todo.id), [created.todo.id]);
  const updated = await remote.updateTodo({ id: created.todo.id, patch: { status: 'in_progress', estimatedMinutes: 45 } });
  assert.equal(updated.todo.status, 'in_progress');
  assert.equal(updated.todo.estimatedMinutes, 45);
  assert.equal((await remote.getSettings()).agentName, 'Kre-Weave');
  assert.deepEqual(await remote.updateSettings({ agentName: 'Todo Agent' }), { agentName: 'Todo Agent', dailyTokenBudget: 10_000_000 });
  await usageRepository.recordUsage({ provider: 'openai', model: 'gpt-4.1', inputTokens: 10, outputTokens: 5, totalTokens: 15 });
  const usage = await remote.getUsage();
  assert.equal(usage.available, true);
  assert.equal(usage.entries[0].totalTokens, 15);
  assert.match(await remote.getBrandMark(), /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/);
  assert.equal((await remote.deleteTodo(created.todo.id)).todo.id, created.todo.id);
  assert.equal(await repository.get(created.todo.id), null);
});

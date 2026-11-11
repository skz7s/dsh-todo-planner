import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SettingsRepository } from '../src/storage/settings-repository.js';

async function repository() {
  const directory = await mkdtemp(join(tmpdir(), 'todo-harness-settings-'));
  return new SettingsRepository(join(directory, 'settings.json')).init();
}

test('settings repository persists the daily token budget', async () => {
  const store = await repository();
  assert.deepEqual(await store.get(), { dailyTokenBudget: 10000000 });

  const next = await store.update({ dailyTokenBudget: 500000 });
  assert.deepEqual(next, { dailyTokenBudget: 500000 });
  assert.deepEqual(JSON.parse(await readFile(store.filePath, 'utf8')), {
    version: 1,
    dailyTokenBudget: 500000
  });
});

test('settings updates serialize and reject invalid preferences without losing the last value', async () => {
  const store = await repository();
  await Promise.all([
    store.update({ dailyTokenBudget: 120000 })
  ]);
  assert.deepEqual(await store.get(), { dailyTokenBudget: 120000 });

  await assert.rejects(() => store.update({ dailyTokenBudget: 1.5 }), /dailyTokenBudget must be an integer/);
  assert.deepEqual(await store.get(), { dailyTokenBudget: 120000 });
});

test('settings updates from separate instances merge under the shared file lock', async () => {
  const first = await repository();
  const second = await new SettingsRepository(first.filePath).init();
  await Promise.all([
    second.update({ dailyTokenBudget: 250000 })
  ]);
  assert.deepEqual(await first.get(), { dailyTokenBudget: 250000 });
});

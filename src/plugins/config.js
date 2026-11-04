import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const DEFAULT_DATA_DIRECTORY = '.todo-harness';

function pathValue(value, fallback) {
  return resolve(typeof value === 'string' && value.trim() ? value : fallback);
}

/**
 * Resolve the same storage contract for a standalone launch and a native
 * Harness profile. Explicit plugin config always wins over environment values.
 */
export function resolveTodoHarnessConfig(config = {}) {
  const configuredDataRoot = config.dataRoot
    ?? process.env.TODO_HARNESS_DATA_DIR
    ?? (process.env.DSH_HOME ? join(process.env.DSH_HOME, 'todo-harness') : join(homedir(), DEFAULT_DATA_DIRECTORY));
  const dataRoot = pathValue(configuredDataRoot, join(homedir(), DEFAULT_DATA_DIRECTORY));
  const workspaceRoot = pathValue(
    config.workspaceRoot ?? process.env.TODO_HARNESS_WORKSPACE_DIR ?? process.cwd(),
    process.cwd()
  );

  return Object.freeze({
    dataRoot,
    dataFile: pathValue(config.dataFile, join(dataRoot, 'todos.json')),
    usageFile: pathValue(config.usageFile, join(dataRoot, 'usage.json')),
    settingsFile: pathValue(config.settingsFile, join(dataRoot, 'settings.json')),
    workspaceRoot
  });
}

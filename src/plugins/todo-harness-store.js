import { readFile } from 'node:fs/promises';

const BRAND_MARK_PATH = new URL('../http/assets/brand-mark.png', import.meta.url);

/**
 * The Host-side data boundary shared by tools, authenticated Remotes, and the
 * standalone loopback API. Keeping this boundary small makes the two product
 * editions use the same persistence implementation.
 */
export function createTodoHarnessStore({ repository, usageRepository, settingsRepository } = {}) {
  if (!repository || !usageRepository || !settingsRepository) {
    throw new TypeError('repository, usageRepository, and settingsRepository are required');
  }

  return Object.freeze({
    async listTodos(filters = {}) {
      return { todos: await repository.list(filters), stats: await repository.stats() };
    },
    async createTodo(input) {
      return { todo: await repository.create(input) };
    },
    async updateTodo({ id, patch } = {}) {
      return { todo: await repository.update(id, patch ?? {}) };
    },
    async deleteTodo(id) {
      return { todo: await repository.remove(id) };
    },
    async getSettings() {
      return settingsRepository.get();
    },
    async updateSettings(patch = {}) {
      return settingsRepository.update(patch);
    },
    async getUsage() {
      return usageRepository.usage();
    },
    async getBrandMark() {
      const image = await readFile(BRAND_MARK_PATH);
      return `data:image/png;base64,${image.toString('base64')}`;
    }
  });
}

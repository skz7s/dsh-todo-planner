import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';

export class TodoPlannerRemotes extends TypertRemoteService {
  static inject = ['schedule', 'agentDefaultModel', 'todoRepository', 'usageRepository', 'settingsRepository'];

  constructor(ctx) {
    super(ctx, 'todoPlanner');
  }

  createSchedule({ sessionId, request }) {
    return this.ctx.schedule.create(sessionId, request);
  }

  getDefaultModel() {
    return this.ctx.agentDefaultModel.currentSelection();
  }

  setDefaultModel(selection) {
    return this.ctx.agentDefaultModel.saveSelection(selection);
  }

  listTodos(filters) {
    return Promise.all([
      this.ctx.todoRepository.list(filters),
      this.ctx.todoRepository.stats()
    ]).then(([todos, stats]) => ({ todos, stats }));
  }

  createTodo(input) {
    return this.ctx.todoRepository.create(input).then((todo) => ({ todo }));
  }

  updateTodo(payload) {
    return this.ctx.todoRepository.update(payload?.id, payload?.patch ?? {}).then((todo) => ({ todo }));
  }

  deleteTodo(id) {
    return this.ctx.todoRepository.remove(id).then((todo) => ({ todo }));
  }

  getSettings() {
    return this.ctx.settingsRepository.get();
  }

  updateSettings(patch) {
    return this.ctx.settingsRepository.update(patch);
  }

  getUsage() {
    return this.ctx.usageRepository.usage();
  }
}

const initializers = [];
for (const method of [
  'createSchedule',
  'getDefaultModel',
  'setDefaultModel',
  'listTodos',
  'createTodo',
  'updateTodo',
  'deleteTodo',
  'getSettings',
  'updateSettings',
  'getUsage'
]) {
  Remote(TodoPlannerRemotes.prototype[method], {
    kind: 'method',
    name: method,
    static: false,
    private: false,
    addInitializer(initializer) { initializers.push(initializer); }
  });
}
for (const initialize of initializers) initialize.call(Object.create(TodoPlannerRemotes.prototype));

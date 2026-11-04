import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';

export class TodoHarnessRemotes extends TypertRemoteService {
  static inject = ['schedule', 'agentDefaultModel', 'todoHarnessStore'];

  constructor(ctx) {
    super(ctx, 'todoHarness');
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
    return this.ctx.todoHarnessStore.listTodos(filters);
  }

  createTodo(input) {
    return this.ctx.todoHarnessStore.createTodo(input);
  }

  updateTodo(payload) {
    return this.ctx.todoHarnessStore.updateTodo(payload);
  }

  deleteTodo(id) {
    return this.ctx.todoHarnessStore.deleteTodo(id);
  }

  getSettings() {
    return this.ctx.todoHarnessStore.getSettings();
  }

  updateSettings(patch) {
    return this.ctx.todoHarnessStore.updateSettings(patch);
  }

  getUsage() {
    return this.ctx.todoHarnessStore.getUsage();
  }

  getBrandMark() {
    return this.ctx.todoHarnessStore.getBrandMark();
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
  'getUsage',
  'getBrandMark'
]) {
  Remote(TodoHarnessRemotes.prototype[method], {
    kind: 'method',
    name: method,
    static: false,
    private: false,
    addInitializer(initializer) { initializers.push(initializer); }
  });
}
for (const initialize of initializers) initialize.call(Object.create(TodoHarnessRemotes.prototype));

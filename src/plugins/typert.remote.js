import {
  brandMarkResultSchema,
  createSchedulePayloadSchema,
  modelSelectionSchema,
  noResultSchema,
  scheduleRecordSchema,
  settingsPatchSchema,
  settingsResultSchema,
  todoFiltersSchema,
  todoIdSchema,
  todoInputSchema,
  todoListResultSchema,
  todoResultSchema,
  todoUpdatePayloadSchema,
  usageResultSchema
} from './remote-schemas.js';

const requestParameter = (name, schemaName, create) => ({
  name,
  wire: name,
  source: 'json',
  codec: { mode: 'strict', typeSymbol: schemaName, create }
});

const result = (name, create) => ({
  mode: 'strict',
  typeSymbol: `todo-harness#todoHarness/${name}:result`,
  create
});

export const TYPERT_REMOTE = {
  package: 'todo-harness',
  descriptors: [
    {
      id: 'todo-harness#todoHarness/createSchedule',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'createSchedule',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('payload', 'todo-harness#CreateSchedulePayload', () => createSchedulePayloadSchema)],
      result: result('createSchedule', () => scheduleRecordSchema)
    },
    {
      id: 'todo-harness#todoHarness/getDefaultModel',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'getDefaultModel',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getDefaultModel', () => modelSelectionSchema)
    },
    {
      id: 'todo-harness#todoHarness/setDefaultModel',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'setDefaultModel',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('selection', 'todo-harness#ModelSelection', () => modelSelectionSchema)],
      result: result('setDefaultModel', () => noResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/listTodos',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'listTodos',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('filters', 'todo-harness#TodoFilters', () => todoFiltersSchema)],
      result: result('listTodos', () => todoListResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/createTodo',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'createTodo',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('input', 'todo-harness#TodoInput', () => todoInputSchema)],
      result: result('createTodo', () => todoResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/updateTodo',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'updateTodo',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('payload', 'todo-harness#TodoUpdatePayload', () => todoUpdatePayloadSchema)],
      result: result('updateTodo', () => todoResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/deleteTodo',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'deleteTodo',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('id', 'todo-harness#TodoId', () => todoIdSchema)],
      result: result('deleteTodo', () => todoResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/getSettings',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'getSettings',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getSettings', () => settingsResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/updateSettings',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'updateSettings',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('patch', 'todo-harness#SettingsPatch', () => settingsPatchSchema)],
      result: result('updateSettings', () => settingsResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/getUsage',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'getUsage',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getUsage', () => usageResultSchema)
    },
    {
      id: 'todo-harness#todoHarness/getBrandMark',
      service: 'todoHarness',
      namespace: 'todoHarness',
      method: 'getBrandMark',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getBrandMark', () => brandMarkResultSchema)
    }
  ]
};

export default TYPERT_REMOTE;

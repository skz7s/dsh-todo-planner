import {
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
  typeSymbol: `dsh-todo-planner#todoPlanner/${name}:result`,
  create
});

export const TYPERT_REMOTE = {
  package: 'dsh-todo-planner',
  descriptors: [
    {
      id: 'dsh-todo-planner#todoPlanner/createSchedule',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'createSchedule',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('payload', 'dsh-todo-planner#CreateSchedulePayload', () => createSchedulePayloadSchema)],
      result: result('createSchedule', () => scheduleRecordSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/getDefaultModel',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'getDefaultModel',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getDefaultModel', () => modelSelectionSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/setDefaultModel',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'setDefaultModel',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('selection', 'dsh-todo-planner#ModelSelection', () => modelSelectionSchema)],
      result: result('setDefaultModel', () => noResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/listTodos',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'listTodos',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('filters', 'dsh-todo-planner#TodoFilters', () => todoFiltersSchema)],
      result: result('listTodos', () => todoListResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/createTodo',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'createTodo',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('input', 'dsh-todo-planner#TodoInput', () => todoInputSchema)],
      result: result('createTodo', () => todoResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/updateTodo',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'updateTodo',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('payload', 'dsh-todo-planner#TodoUpdatePayload', () => todoUpdatePayloadSchema)],
      result: result('updateTodo', () => todoResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/deleteTodo',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'deleteTodo',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('id', 'dsh-todo-planner#TodoId', () => todoIdSchema)],
      result: result('deleteTodo', () => todoResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/getSettings',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'getSettings',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getSettings', () => settingsResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/updateSettings',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'updateSettings',
      invocation: { kind: 'direct' },
      parameters: [requestParameter('patch', 'dsh-todo-planner#SettingsPatch', () => settingsPatchSchema)],
      result: result('updateSettings', () => settingsResultSchema)
    },
    {
      id: 'dsh-todo-planner#todoPlanner/getUsage',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'getUsage',
      invocation: { kind: 'direct' },
      parameters: [],
      result: result('getUsage', () => usageResultSchema)
    },
  ]
};

export default TYPERT_REMOTE;

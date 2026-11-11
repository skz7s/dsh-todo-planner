import {
  createSchedulePayloadSchema,
  modelSelectionSchema,
  noResultSchema,
  scheduleCreateRequestSchema,
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

const remoteMethod = (method, parameters, resultType, resultFactory, line) => ({
  id: `dsh-todo-planner#todoPlanner/${method}`,
  service: 'todoPlanner',
  namespace: 'todoPlanner',
  method,
  invocation: { kind: 'direct' },
  parameters,
  result: {
    mode: 'strict',
    typeSymbol: `dsh-todo-planner#todoPlanner/${method}:result`,
    create: resultFactory
  },
  sourceLocation: { file: 'src/plugins/dsh-todo-planner-remotes.js', line, column: 3 }
});

const requestParameter = (name, schemaName, create) => ({
  name,
  wire: name,
  source: 'json',
  codec: { mode: 'strict', typeSymbol: schemaName, create }
});

export const TYPERT = {
  package: 'dsh-todo-planner',
  face: 'host',
  schemas: [
    { name: 'CreateSchedulePayload', create: () => createSchedulePayloadSchema },
    { name: 'ScheduleCreateRequest', create: () => scheduleCreateRequestSchema },
    { name: 'ScheduleRecord', create: () => scheduleRecordSchema },
    { name: 'ModelSelection', create: () => modelSelectionSchema },
    { name: 'TodoFilters', create: () => todoFiltersSchema },
    { name: 'TodoInput', create: () => todoInputSchema },
    { name: 'TodoUpdatePayload', create: () => todoUpdatePayloadSchema },
    { name: 'TodoId', create: () => todoIdSchema },
    { name: 'SettingsPatch', create: () => settingsPatchSchema },
    { name: 'TodoListResult', create: () => todoListResultSchema },
    { name: 'TodoResult', create: () => todoResultSchema },
    { name: 'SettingsResult', create: () => settingsResultSchema },
    { name: 'UsageResult', create: () => usageResultSchema },
    { name: 'NoResult', create: () => noResultSchema }
  ],
  invocations: [
    remoteMethod('createSchedule', [requestParameter('payload', 'dsh-todo-planner#CreateSchedulePayload', () => createSchedulePayloadSchema)], 'dsh-todo-planner#ScheduleRecord', () => scheduleRecordSchema, 12),
    remoteMethod('getDefaultModel', [], 'dsh-todo-planner#ModelSelection', () => modelSelectionSchema, 16),
    remoteMethod('setDefaultModel', [requestParameter('selection', 'dsh-todo-planner#ModelSelection', () => modelSelectionSchema)], 'dsh-todo-planner#NoResult', () => noResultSchema, 20),
    remoteMethod('listTodos', [requestParameter('filters', 'dsh-todo-planner#TodoFilters', () => todoFiltersSchema)], 'dsh-todo-planner#TodoListResult', () => todoListResultSchema, 24),
    remoteMethod('createTodo', [requestParameter('input', 'dsh-todo-planner#TodoInput', () => todoInputSchema)], 'dsh-todo-planner#TodoResult', () => todoResultSchema, 28),
    remoteMethod('updateTodo', [requestParameter('payload', 'dsh-todo-planner#TodoUpdatePayload', () => todoUpdatePayloadSchema)], 'dsh-todo-planner#TodoResult', () => todoResultSchema, 32),
    remoteMethod('deleteTodo', [requestParameter('id', 'dsh-todo-planner#TodoId', () => todoIdSchema)], 'dsh-todo-planner#TodoResult', () => todoResultSchema, 36),
    remoteMethod('getSettings', [], 'dsh-todo-planner#SettingsResult', () => settingsResultSchema, 40),
    remoteMethod('updateSettings', [requestParameter('patch', 'dsh-todo-planner#SettingsPatch', () => settingsPatchSchema)], 'dsh-todo-planner#SettingsResult', () => settingsResultSchema, 44),
    remoteMethod('getUsage', [], 'dsh-todo-planner#UsageResult', () => usageResultSchema, 48)
  ],
  model: {
    services: [{
      description: 'DSH Todo Planner actions exposed over the authenticated browser Remote.',
      summary: 'DSH Todo Planner actions exposed over the authenticated browser Remote.',
      tags: [],
      key: 'todoPlanner',
      exportName: 'TodoPlannerRemotes',
      members: [
        { kind: 'method', name: 'createSchedule', signature: '@Remote async createSchedule(payload: CreateSchedulePayload): Promise<ScheduleRecord>' },
        { kind: 'method', name: 'getDefaultModel', signature: '@Remote getDefaultModel(): ModelSelection' },
        { kind: 'method', name: 'setDefaultModel', signature: '@Remote async setDefaultModel(selection: ModelSelection): Promise<void>' },
        { kind: 'method', name: 'listTodos', signature: '@Remote async listTodos(filters: TodoFilters): Promise<TodoListResult>' },
        { kind: 'method', name: 'createTodo', signature: '@Remote async createTodo(input: TodoInput): Promise<TodoResult>' },
        { kind: 'method', name: 'updateTodo', signature: '@Remote async updateTodo(payload: TodoUpdatePayload): Promise<TodoResult>' },
        { kind: 'method', name: 'deleteTodo', signature: '@Remote async deleteTodo(id: TodoId): Promise<TodoResult>' },
        { kind: 'method', name: 'getSettings', signature: '@Remote async getSettings(): Promise<SettingsResult>' },
        { kind: 'method', name: 'updateSettings', signature: '@Remote async updateSettings(patch: SettingsPatch): Promise<SettingsResult>' },
        { kind: 'method', name: 'getUsage', signature: '@Remote async getUsage(): Promise<UsageResult>' }
      ],
      types: [
        { name: 'CreateSchedulePayload', declaration: 'export interface CreateSchedulePayload { sessionId: string; request: ScheduleCreateRequest }' },
        { name: 'ScheduleCreateRequest', declaration: 'export interface ScheduleCreateRequest { title: string; prompt: string; at?: string | LocalAtInput; every_seconds?: number; daily?: DailyInput; weekly?: WeeklyInput; cron?: CronInput }' },
        { name: 'ScheduleRecord', declaration: 'export type ScheduleRecord = object' },
        { name: 'ModelSelection', declaration: 'export interface ModelSelection { provider: string; model: string; reasoningEffort?: string }' },
        { name: 'TodoFilters', declaration: 'export interface TodoFilters { status?: string; query?: string; includeArchived?: boolean }' },
        { name: 'TodoInput', declaration: 'export type TodoInput = object' },
        { name: 'TodoUpdatePayload', declaration: 'export interface TodoUpdatePayload { id: string; patch: object }' },
        { name: 'TodoId', declaration: 'export type TodoId = string' },
        { name: 'SettingsPatch', declaration: 'export interface SettingsPatch { dailyTokenBudget?: number }' },
        { name: 'TodoListResult', declaration: 'export interface TodoListResult { todos: object[]; stats: object }' },
        { name: 'TodoResult', declaration: 'export interface TodoResult { todo: object }' },
        { name: 'SettingsResult', declaration: 'export interface SettingsResult { dailyTokenBudget: number }' },
        { name: 'UsageResult', declaration: 'export interface UsageResult { available: boolean; entries: object[] }' }
      ]
    }],
    events: [],
    objects: []
  }
};

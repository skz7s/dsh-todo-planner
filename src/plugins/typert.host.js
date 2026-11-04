import {
  createSchedulePayloadSchema,
  brandMarkResultSchema,
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
  id: `todo-harness#todoHarness/${method}`,
  service: 'todoHarness',
  namespace: 'todoHarness',
  method,
  invocation: { kind: 'direct' },
  parameters,
  result: {
    mode: 'strict',
    typeSymbol: `todo-harness#todoHarness/${method}:result`,
    create: resultFactory
  },
  sourceLocation: { file: 'src/plugins/todo-harness-remotes.js', line, column: 3 }
});

const requestParameter = (name, schemaName, create) => ({
  name,
  wire: name,
  source: 'json',
  codec: { mode: 'strict', typeSymbol: schemaName, create }
});

export const TYPERT = {
  package: 'todo-harness',
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
    { name: 'BrandMarkResult', create: () => brandMarkResultSchema },
    { name: 'NoResult', create: () => noResultSchema }
  ],
  invocations: [
    remoteMethod('createSchedule', [requestParameter('payload', 'todo-harness#CreateSchedulePayload', () => createSchedulePayloadSchema)], 'todo-harness#ScheduleRecord', () => scheduleRecordSchema, 12),
    remoteMethod('getDefaultModel', [], 'todo-harness#ModelSelection', () => modelSelectionSchema, 16),
    remoteMethod('setDefaultModel', [requestParameter('selection', 'todo-harness#ModelSelection', () => modelSelectionSchema)], 'todo-harness#NoResult', () => noResultSchema, 20),
    remoteMethod('listTodos', [requestParameter('filters', 'todo-harness#TodoFilters', () => todoFiltersSchema)], 'todo-harness#TodoListResult', () => todoListResultSchema, 24),
    remoteMethod('createTodo', [requestParameter('input', 'todo-harness#TodoInput', () => todoInputSchema)], 'todo-harness#TodoResult', () => todoResultSchema, 28),
    remoteMethod('updateTodo', [requestParameter('payload', 'todo-harness#TodoUpdatePayload', () => todoUpdatePayloadSchema)], 'todo-harness#TodoResult', () => todoResultSchema, 32),
    remoteMethod('deleteTodo', [requestParameter('id', 'todo-harness#TodoId', () => todoIdSchema)], 'todo-harness#TodoResult', () => todoResultSchema, 36),
    remoteMethod('getSettings', [], 'todo-harness#SettingsResult', () => settingsResultSchema, 40),
    remoteMethod('updateSettings', [requestParameter('patch', 'todo-harness#SettingsPatch', () => settingsPatchSchema)], 'todo-harness#SettingsResult', () => settingsResultSchema, 44),
    remoteMethod('getUsage', [], 'todo-harness#UsageResult', () => usageResultSchema, 48),
    remoteMethod('getBrandMark', [], 'todo-harness#BrandMarkResult', () => brandMarkResultSchema, 52)
  ],
  model: {
    services: [{
      description: 'Todo Harness actions exposed over the authenticated browser Remote.',
      summary: 'Todo Harness actions exposed over the authenticated browser Remote.',
      tags: [],
      key: 'todoHarness',
      exportName: 'TodoHarnessRemotes',
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
        { kind: 'method', name: 'getUsage', signature: '@Remote async getUsage(): Promise<UsageResult>' },
        { kind: 'method', name: 'getBrandMark', signature: '@Remote async getBrandMark(): Promise<BrandMarkResult>' }
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
        { name: 'SettingsPatch', declaration: 'export interface SettingsPatch { agentName?: string; dailyTokenBudget?: number }' },
        { name: 'TodoListResult', declaration: 'export interface TodoListResult { todos: object[]; stats: object }' },
        { name: 'TodoResult', declaration: 'export interface TodoResult { todo: object }' },
        { name: 'SettingsResult', declaration: 'export interface SettingsResult { agentName: string; dailyTokenBudget: number }' },
        { name: 'UsageResult', declaration: 'export interface UsageResult { available: boolean; entries: object[] }' },
        { name: 'BrandMarkResult', declaration: 'export type BrandMarkResult = string' }
      ]
    }],
    events: [],
    objects: []
  }
};

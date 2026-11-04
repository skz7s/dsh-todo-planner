import { z } from 'zod';

const localAtSchema = z.object({
  date: z.string(),
  time: z.string(),
  time_zone: z.string()
}).strict();

const dailySchema = z.object({ time: z.string(), time_zone: z.string() }).strict();
const weeklySchema = z.object({
  time: z.string(),
  time_zone: z.string(),
  weekdays: z.array(z.number())
}).strict();
const cronSchema = z.object({ expression: z.string(), time_zone: z.string() }).strict();

export const scheduleCreateRequestSchema = z.object({
  title: z.string().min(1),
  prompt: z.string().min(1),
  after_seconds: z.number().optional(),
  at: z.union([z.string(), localAtSchema]).optional(),
  every_seconds: z.number().optional(),
  daily: dailySchema.optional(),
  weekly: weeklySchema.optional(),
  cron: cronSchema.optional()
}).strict();

export const createSchedulePayloadSchema = z.object({
  sessionId: z.string().min(1),
  request: scheduleCreateRequestSchema
}).strict();

export const scheduleRecordSchema = z.discriminatedUnion('kind', [
  z.object({ id: z.string(), kind: z.literal('after'), title: z.string(), prompt: z.string(), afterSeconds: z.number(), scheduledAt: z.string() }).strict(),
  z.object({ id: z.string(), kind: z.literal('at'), title: z.string(), prompt: z.string(), scheduledAt: z.string() }).strict(),
  z.object({ id: z.string(), kind: z.literal('every'), title: z.string(), prompt: z.string(), everySeconds: z.number(), scheduledAt: z.string() }).strict(),
  z.object({ id: z.string(), kind: z.literal('daily'), title: z.string(), prompt: z.string(), time: z.string(), timeZone: z.string(), scheduledAt: z.string() }).strict(),
  z.object({ id: z.string(), kind: z.literal('weekly'), title: z.string(), prompt: z.string(), time: z.string(), timeZone: z.string(), weekdays: z.array(z.number()), scheduledAt: z.string() }).strict(),
  z.object({ id: z.string(), kind: z.literal('cron'), title: z.string(), prompt: z.string(), expression: z.string(), timeZone: z.string(), scheduledAt: z.string() }).strict()
]);

export const modelSelectionSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  reasoningEffort: z.string().optional()
}).strict();

const jsonRecordSchema = z.record(z.string(), z.unknown());

export const todoFiltersSchema = z.object({
  status: z.string().optional(),
  query: z.string().optional(),
  includeArchived: z.boolean().optional()
}).strict();

export const todoInputSchema = jsonRecordSchema;
export const todoUpdatePayloadSchema = z.object({
  id: z.string().min(1),
  patch: jsonRecordSchema
}).strict();
export const todoIdSchema = z.string().min(1);
export const settingsPatchSchema = z.object({
  agentName: z.string().optional(),
  dailyTokenBudget: z.number().optional()
}).strict();
export const todoListResultSchema = z.object({
  todos: z.array(jsonRecordSchema),
  stats: jsonRecordSchema
}).strict();
export const todoResultSchema = z.object({ todo: jsonRecordSchema }).strict();
export const settingsResultSchema = z.object({
  agentName: z.string(),
  dailyTokenBudget: z.number()
}).strict();
export const usageResultSchema = z.object({
  available: z.boolean(),
  entries: z.array(jsonRecordSchema)
}).strict();
export const brandMarkResultSchema = z.string().min(1);

export const noResultSchema = z.void();

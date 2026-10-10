import { z } from 'zod';

export const actionSuggestionSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  type: z.enum(['action', 'habit']),
  sourceQuote: z.string().min(1).max(400),
  reason: z.string().min(1).max(240),
}).readonly();

export const actionSuggestionResponseSchema = z.object({
  suggestions: z.array(actionSuggestionSchema).max(3),
  cached: z.boolean().optional(),
}).readonly();

export type ActionSuggestion = z.infer<typeof actionSuggestionSchema>;

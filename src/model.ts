import { z } from 'zod';

export const entrySchema = z.object({
  id: z.string().uuid(), user_id: z.string(), entry_date: z.iso.date(),
  title: z.string().max(200), body: z.string().max(200000),
  created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }),
  version: z.number().int().nonnegative(),
}).readonly();
export type Entry = z.infer<typeof entrySchema>;
export type EntryEdit = Pick<Entry, 'title' | 'body' | 'entry_date'>;
export const draftSchema = z.object({ entry: entrySchema, baseVersion: z.number().int().nonnegative() }).readonly();
export type Draft = z.infer<typeof draftSchema>;
export type SaveResult = { readonly ok: true; readonly entry: Entry } | { readonly ok: false; readonly reason: 'conflict' | 'error' };
export interface Repository {
  list(): Promise<readonly Entry[]>;
  save(draft: Draft): Promise<SaveResult>;
}
export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function newEntry(userId: string): Entry {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), user_id: userId, entry_date: localDate(), title: '', body: '', created_at: now, updated_at: now, version: 0 };
}
export function markdown(entries: readonly Entry[]): string {
  return entries.map(e => `# ${e.entry_date}${e.title ? ` — ${e.title}` : ''}\n\n${e.body}\n`).join('\n---\n\n');
}

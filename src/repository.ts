import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { entrySchema } from './model';
import type { Entry, Repository } from './model';

const config = z.object({ url: z.url(), key: z.string().min(1) }).safeParse({
  url: import.meta.env['VITE_SUPABASE_URL'], key: import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],
});
export const supabase = config.success ? createClient(config.data.url, config.data.key, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
}) : null;

export function cloudRepository(client: SupabaseClient, userId: string): Repository {
  return {
    async list() {
      const entries: Entry[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await client.from('journal_entries').select('*').eq('user_id', userId)
          .order('id').range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000));
        if (error) throw error;
        const page = entrySchema.array().parse(data);
        entries.push(...page);
        if (page.length < 500) return entries;
      }
    },
    async save(draft) {
      try {
        const { data, error } = await client.rpc('save_journal_entry', {
          p_id: draft.entry.id, p_date: draft.entry.entry_date,
          p_title: draft.entry.title, p_body: draft.entry.body, p_version: draft.baseVersion,
        }).abortSignal(AbortSignal.timeout(15000));
        if (error) return { ok: false, reason: error.code === '40001' ? 'conflict' : 'error' };
        const saved = entrySchema.array().parse(data)[0];
        return saved ? { ok: true, entry: saved } : { ok: false, reason: 'conflict' };
      } catch (error) {
        if (error instanceof Error) return { ok: false, reason: 'error' };
        throw error;
      }
    },
  };
}

export function previewRepository(storage: Storage): Repository {
  const key = 'life-journal:preview-entries';
  function read(): Entry[] {
    return entrySchema.array().parse(JSON.parse(storage.getItem(key) ?? '[]'));
  }
  return {
    async list() { return read(); },
    async save(draft) {
      try {
        const entries = read();
        const old = entries.find(e => e.id === draft.entry.id);
        if ((old?.version ?? 0) !== draft.baseVersion) return { ok: false, reason: 'conflict' };
        const entry = { ...draft.entry, version: draft.baseVersion + 1, updated_at: new Date().toISOString() };
        storage.setItem(key, JSON.stringify([...entries.filter(e => e.id !== entry.id), entry]));
        return { ok: true, entry };
      } catch (error) {
        if (error instanceof Error) return { ok: false, reason: 'error' };
        throw error;
      }
    },
  };
}

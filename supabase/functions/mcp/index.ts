import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createMcpHandler, McpServer } from 'npm:@modelcontextprotocol/server@^2.0.0';
import { pipeline } from 'npm:@supabase/middleware@1';
import { withOAuthProtectedResource, withSupabase } from 'npm:@supabase/server@1';
import { z } from 'npm:zod@^4.3.6';
import type { Database } from './database.types.ts';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const uuidSchema = z.string().uuid();

function text(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

Deno.serve(
  pipeline(
    [withOAuthProtectedResource(), withSupabase<Database>({ auth: 'user' })],
    async (request, { supabase }) => {
      const handler = createMcpHandler(() => {
        const server = new McpServer({ name: 'life-journal', version: '0.1.0' });

        server.registerTool('create_journal_entry', {
          description: 'Create one private Life Journal entry for the signed-in user. Ask the user to confirm the final title, body, and date before calling this tool.',
          inputSchema: z.object({
            entry_date: dateSchema.describe('Local date in YYYY-MM-DD format.'),
            title: z.string().max(200).default('').describe('Optional journal title.'),
            body: z.string().max(200000).describe('Journal body to save exactly as confirmed by the user.'),
            idempotency_key: uuidSchema.describe('A stable UUID for this requested write. Reuse it only when retrying the same request.'),
          }),
          annotations: { destructiveHint: false, idempotentHint: true, openWorldHint: false },
        }, async ({ entry_date, title, body, idempotency_key }) => {
          const { error: insertError } = await supabase.from('journal_entries').upsert({
            id: idempotency_key, entry_date, title, body,
          }, { onConflict: 'id', ignoreDuplicates: true });
          if (insertError) throw new Error('Life Journal could not save this entry.');
          const { data, error } = await supabase.from('journal_entries')
            .select('id,entry_date,title,created_at,updated_at').eq('id', idempotency_key).single();
          if (error || !data) throw new Error('Life Journal could not confirm this entry.');
          return text({ entry: data });
        });

        server.registerTool('create_action', {
          description: 'Create one private action for the signed-in user. Ask the user to confirm the final title and optional due date before calling this tool.',
          inputSchema: z.object({
            title: z.string().trim().min(1).max(300).describe('Action title.'),
            due_date: dateSchema.nullable().default(null).describe('Optional due date in YYYY-MM-DD format.'),
            source_entry_id: uuidSchema.nullable().default(null).describe('Optional existing Life Journal entry id that prompted this action.'),
            idempotency_key: uuidSchema.describe('A stable UUID for this requested write. Reuse it only when retrying the same request.'),
          }),
          annotations: { destructiveHint: false, idempotentHint: true, openWorldHint: false },
        }, async ({ title, due_date, source_entry_id, idempotency_key }) => {
          if (source_entry_id) {
            const { data: sourceEntry, error: sourceError } = await supabase.from('journal_entries')
              .select('id').eq('id', source_entry_id).maybeSingle();
            if (sourceError || !sourceEntry) throw new Error('The source entry is not available to this user.');
          }
          const { error: insertError } = await supabase.from('action_items').upsert({
            id: idempotency_key, title, due_date, source_entry_id,
          }, { onConflict: 'id', ignoreDuplicates: true });
          if (insertError) throw new Error('Life Journal could not save this action.');
          const { data, error } = await supabase.from('action_items')
            .select('id,title,due_date,completed_at,archived_at,created_at,updated_at').eq('id', idempotency_key).single();
          if (error || !data) throw new Error('Life Journal could not confirm this action.');
          return text({ action: data });
        });

        server.registerTool('list_open_actions', {
          description: 'List the signed-in user\'s open, unarchived Life Journal actions.',
          inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
          annotations: { readOnlyHint: true, openWorldHint: false },
        }, async ({ limit }) => {
          const { data, error } = await supabase.from('action_items')
            .select('id,title,due_date,source_entry_id,created_at')
            .is('completed_at', null).is('archived_at', null)
            .order('due_date', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(limit);
          if (error) throw new Error('Life Journal could not load your open actions.');
          return text({ actions: data ?? [] });
        });

        return server;
      });
      return handler.fetch(request);
    },
  ),
);

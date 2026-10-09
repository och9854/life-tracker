import { afterEach, describe, expect, it, vi } from 'vitest';
import { JournalStore } from './journal-store';
import { localDate, markdown, newEntry } from './model';
import type { Draft, Entry, Repository, SaveResult } from './model';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}
function repo(initial: readonly Entry[] = []): Repository {
  const rows = new Map(initial.map(e => [e.id, e]));
  return {
    async list() { return [...rows.values()]; },
    async save(draft) {
      if ((rows.get(draft.entry.id)?.version ?? 0) !== draft.baseVersion) return { ok: false, reason: 'conflict' };
      const entry = { ...draft.entry, version: draft.baseVersion + 1 };
      rows.set(entry.id, entry);
      return { ok: true, entry };
    },
  };
}
afterEach(() => vi.useRealTimers());
describe('journal persistence', () => {
  it('keeps multiple entries on one date and preserves mixed-language export', async () => {
    vi.useFakeTimers();
    const storage = new MemoryStorage(); const repository = repo(); const store = new JournalStore(repository, 'a', storage);
    await store.load();
    const first = store.add(); const second = store.add();
    store.edit(first, { title: '오늘', body: '한글 and English\n- 기록', entry_date: localDate() });
    store.edit(second, { title: '', body: 'Second entry', entry_date: localDate() });
    await store.flush();
    expect(store.getSnapshot().pending).toBe(0);
    expect(await repository.list()).toHaveLength(2);
    expect(markdown(await repository.list())).toContain('한글 and English\n- 기록');
    store.stop();
  });
  it('keeps edits as a device draft until the user saves', async () => {
    const storage = new MemoryStorage(); const repository = repo(); const store = new JournalStore(repository, 'a', storage);
    await store.load();
    const id = store.add();
    store.edit(id, { title: 'Later', body: 'Saved locally first', entry_date: localDate() });
    expect(store.getSnapshot().status[id]).toBe('pending');
    expect(await repository.list()).toHaveLength(0);
    expect(storage.getItem('life-journal:drafts:a')).toContain('Saved locally first');
    await store.flush();
    expect(store.getSnapshot().status[id]).toBe('saved');
    expect(await repository.list()).toHaveLength(1);
    store.stop();
  });
  it('recovers unsynced drafts after failure and reload', async () => {
    vi.useFakeTimers();
    const storage = new MemoryStorage();
    const failing: Repository = { async list() { return []; }, async save() { return { ok: false, reason: 'error' }; } };
    const store = new JournalStore(failing, 'a', storage); await store.load();
    const id = store.add(); store.edit(id, { title: '', body: 'Keep me', entry_date: '2026-10-08' }); await store.flush();
    expect(store.getSnapshot().status[id]).toBe('error'); store.stop();
    const restored = new JournalStore(repo(), 'a', storage); await restored.load();
    expect(restored.getSnapshot().entries[0]?.body).toBe('Keep me'); await restored.flush();
    expect(restored.getSnapshot().pending).toBe(0); restored.stop();
    const other = new JournalStore(repo(), 'b', storage); await other.load();
    expect(other.getSnapshot().entries).toHaveLength(0); other.stop();
  });
  it('does not lose typing that arrives during a save', async () => {
    vi.useFakeTimers();
    let resolve: ((result: SaveResult) => void) | undefined;
    let sent: Draft | undefined;
    const repository: Repository = { async list() { return []; }, save(draft) { sent = draft; return new Promise(done => { resolve = done; }); } };
    const store = new JournalStore(repository, 'a', new MemoryStorage()); await store.load(); const id = store.add();
    store.edit(id, { title: '', body: 'First', entry_date: localDate() }); const saving = store.flush();
    store.edit(id, { title: '', body: 'First plus new typing', entry_date: localDate() });
    if (!sent || !resolve) throw new Error('Save must be in flight');
    resolve({ ok: true, entry: { ...sent.entry, version: 1 } }); await saving;
    expect(store.getSnapshot().entries[0]?.body).toBe('First plus new typing');
    expect(store.getSnapshot().pending).toBe(1);
    expect(store.getSnapshot().status[id]).toBe('pending'); store.stop();
  });
  it('stops conflicting drafts from overwriting another device', async () => {
    vi.useFakeTimers();
    const original = { ...newEntry('a'), body: 'Other device', version: 2 };
    const storage = new MemoryStorage();
    storage.setItem('life-journal:drafts:a', JSON.stringify([{ entry: { ...original, body: 'My draft', version: 1 }, baseVersion: 1 }]));
    const repository = repo([original]); const store = new JournalStore(repository, 'a', storage); await store.load(); await store.flush();
    expect(store.getSnapshot().status[original.id]).toBe('conflict');
    expect((await repository.list())[0]?.body).toBe('Other device');
    store.keepAsNew(original.id); await store.flush();
    expect(await repository.list()).toHaveLength(2); store.stop();
  });
  it('reports quota failures without discarding editor content', async () => {
    vi.useFakeTimers();
    const storage = new MemoryStorage(); vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    const store = new JournalStore(repo(), 'a', storage); await store.load(); const id = store.add();
    store.edit(id, { title: '', body: 'Still visible', entry_date: localDate() });
    expect(store.getSnapshot().storageError).toBe(true);
    expect(store.getSnapshot().entries[0]?.body).toBe('Still visible'); store.stop();
  });
});

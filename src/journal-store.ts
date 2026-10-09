import { draftSchema, newEntry } from './model';
import type { Draft, Entry, EntryEdit, Repository } from './model';

export type SaveState = 'pending' | 'saving' | 'saved' | 'error' | 'conflict';
type Snapshot = {
  readonly entries: readonly Entry[];
  readonly status: Readonly<Record<string, SaveState>>;
  readonly loaded: boolean;
  readonly loadError: boolean;
  readonly storageError: boolean;
  readonly pending: number;
};

export class JournalStore {
  private state: Snapshot = { entries: [], status: {}, loaded: false, loadError: false, storageError: false, pending: 0 };
  private drafts = new Map<string, Draft>();
  private listeners = new Set<() => void>();
  private busy = false;
  private stopped = false;
  private readonly key: string;

  constructor(private readonly repository: Repository, private readonly userId: string, private readonly storage: Storage) {
    this.key = `life-journal:drafts:${userId}`;
  }
  getSnapshot = (): Snapshot => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  private publish(update: Partial<Snapshot>): void {
    this.state = { ...this.state, ...update, pending: this.drafts.size };
    for (const listener of this.listeners) listener();
  }
  private persist(): void {
    try {
      this.storage.setItem(this.key, JSON.stringify([...this.drafts.values()]));
      this.publish({ storageError: false });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      this.publish({ storageError: true });
    }
  }
  async load(): Promise<void> {
    this.stopped = false;
    this.publish({ loadError: false });
    try {
      const entries = await this.repository.list();
      if (this.stopped) return;
      try {
        const restored = draftSchema.array().parse(JSON.parse(this.storage.getItem(this.key) ?? '[]'));
        for (const draft of restored) {
          if (draft.entry.user_id === this.userId) this.drafts.set(draft.entry.id, draft);
        }
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        this.publish({ storageError: true });
      }
      const merged = new Map(entries.map(e => [e.id, e]));
      const status: Record<string, SaveState> = {};
      for (const [id, draft] of this.drafts) {
        const server = merged.get(id);
        if (server && server.title === draft.entry.title && server.body === draft.entry.body && server.entry_date === draft.entry.entry_date) {
          this.drafts.delete(id);
          continue;
        }
        merged.set(id, draft.entry);
        status[id] = (server?.version ?? 0) === draft.baseVersion ? 'pending' : 'conflict';
      }
      this.publish({ entries: [...merged.values()], status, loaded: true });
    } catch (error) {
      if (this.stopped) return;
      this.publish({ loadError: true });
    }
  }
  add(): string {
    const entry = newEntry(this.userId);
    this.publish({ entries: [entry, ...this.state.entries] });
    return entry.id;
  }
  edit(id: string, edit: EntryEdit): void {
    const previous = this.state.entries.find(e => e.id === id);
    if (!previous) return;
    const entry = { ...previous, ...edit };
    const baseVersion = this.drafts.get(id)?.baseVersion ?? previous.version;
    this.drafts.set(id, { entry, baseVersion });
    this.publish({ entries: this.state.entries.map(e => e.id === id ? entry : e),
      status: { ...this.state.status, [id]: this.state.status[id] === 'conflict' ? 'conflict' : 'pending' } });
    this.persist();
  }
  async flush(): Promise<void> {
    if (this.busy || this.stopped || !this.state.loaded) return;
    this.busy = true;
    try {
      for (const [id, draft] of [...this.drafts]) {
        if (this.stopped) break;
        if (this.state.status[id] === 'conflict') continue;
        this.publish({ status: { ...this.state.status, [id]: 'saving' } });
        const result = await this.repository.save(draft);
        if (this.stopped) break;
        if (!result.ok) {
          this.publish({ status: { ...this.state.status, [id]: result.reason } });
          continue;
        }
        const latest = this.drafts.get(id);
        if (latest === draft) {
          this.drafts.delete(id);
          this.publish({ entries: this.state.entries.map(e => e.id === id ? result.entry : e), status: { ...this.state.status, [id]: 'saved' } });
        } else if (latest) {
          this.drafts.set(id, { entry: { ...latest.entry, version: result.entry.version }, baseVersion: result.entry.version });
          this.publish({ status: { ...this.state.status, [id]: 'pending' } });
        }
        this.persist();
      }
    } finally { this.busy = false; }
  }
  keepAsNew(id: string): string | undefined {
    const draft = this.drafts.get(id);
    if (!draft) return undefined;
    const entry = { ...newEntry(this.userId), title: draft.entry.title, body: draft.entry.body, entry_date: draft.entry.entry_date };
    this.drafts.delete(id);
    this.drafts.set(entry.id, { entry, baseVersion: 0 });
    this.publish({ entries: [entry, ...this.state.entries.filter(e => e.id !== id)], status: { ...this.state.status, [id]: 'saved', [entry.id]: 'pending' } });
    this.persist();
    return entry.id;
  }
  stop(): void { this.stopped = true; }
}

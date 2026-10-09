import { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { localDate } from './model';
import type { Locale } from './i18n';

type Action = { id: string; title: string; due_date: string | null; completed_at: string | null; archived_at: string | null; source_entry_id: string | null };
type Habit = { id: string; name: string; weekly_target: number; cadence: 'week' | 'month' };
type HabitCheck = { id: string; habit_id: string; completed_on: string; count: number };
type TrackerData = { actions: Action[]; habits: Habit[]; checks: HabitCheck[] };
const key = (userId: string) => `life-journal:tracker:${userId}`;
const empty: TrackerData = { actions: [], habits: [], checks: [] };

function copy(data: TrackerData): TrackerData { return JSON.parse(JSON.stringify(data)) as TrackerData; }

export function Tracker({ client, userId, preview, locale }: { readonly client: SupabaseClient | null; readonly userId: string; readonly preview: boolean; readonly locale: Locale }) {
  const [data, setData] = useState<TrackerData>(empty);
  const [loading, setLoading] = useState(true);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habitTarget, setHabitTarget] = useState(1);
  const [habitCadence, setHabitCadence] = useState<'week' | 'month'>('week');
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const today = localDate();
  const korean = locale === 'ko';
  const load = async () => {
    setLoading(true);
    if (preview) {
      setData(JSON.parse(localStorage.getItem(key(userId)) ?? JSON.stringify(empty)) as TrackerData);
      setLoading(false);
      return;
    }
    if (!client) return;
    const [actions, habits, checks] = await Promise.all([
      client.from('action_items').select('id,title,due_date,completed_at,archived_at,source_entry_id').order('created_at', { ascending: false }),
      client.from('habits').select('id,name,weekly_target,cadence').eq('active', true).order('created_at'),
      client.from('habit_completions').select('id,habit_id,completed_on,count').gte('completed_on', monthStart(today)),
    ]);
    if (!actions.error && !habits.error && !checks.error) setData({ actions: actions.data as Action[], habits: habits.data as Habit[], checks: checks.data as HabitCheck[] });
    setLoading(false);
  };
  useEffect(() => { void load(); }, [client, preview, userId]);
  const savePreview = (next: TrackerData) => { localStorage.setItem(key(userId), JSON.stringify(next)); setData(next); };
  const addAction = async () => {
    const title = actionTitle.trim(); if (!title) return;
    if (preview) savePreview({ ...data, actions: [{ id: crypto.randomUUID(), title, due_date: actionDate || null, completed_at: null, archived_at: null, source_entry_id: null }, ...data.actions] });
    else { await client?.from('action_items').insert({ id: crypto.randomUUID(), title, due_date: actionDate || null }); await load(); }
    setActionTitle(''); setActionDate('');
  };
  const archiveAction = async (action: Action) => {
    const archived_at = action.archived_at ? null : new Date().toISOString();
    if (preview) savePreview({ ...data, actions: data.actions.map(item => item.id === action.id ? { ...item, archived_at } : item) });
    else { await client?.from('action_items').update({ archived_at }).eq('id', action.id); await load(); }
    setOpenMenu(null);
  };
  const deleteAction = async (action: Action) => {
    if (preview) savePreview({ ...data, actions: data.actions.filter(item => item.id !== action.id) });
    else { await client?.from('action_items').delete().eq('id', action.id); await load(); }
    setOpenMenu(null);
  };
  const toggleAction = async (action: Action) => {
    const completed_at = action.completed_at ? null : new Date().toISOString();
    if (preview) savePreview({ ...data, actions: data.actions.map(item => item.id === action.id ? { ...item, completed_at } : item) });
    else { await client?.from('action_items').update({ completed_at }).eq('id', action.id); await load(); }
  };
  const addHabit = async () => {
    const name = habitName.trim(); if (!name) return;
    if (preview) savePreview({ ...data, habits: [...data.habits, { id: crypto.randomUUID(), name, weekly_target: habitTarget, cadence: habitCadence }] });
    else { await client?.from('habits').insert({ id: crypto.randomUUID(), name, weekly_target: habitTarget, cadence: habitCadence }); await load(); }
    setHabitName(''); setHabitTarget(1);
  };
  const changeHabitCount = async (habit: Habit, delta: number) => {
    const check = data.checks.find(item => item.habit_id === habit.id && item.completed_on === today);
    const next = (check?.count ?? 0) + delta; if (next < 0) return;
    if (preview) savePreview({ ...data, checks: next === 0 ? data.checks.filter(item => item.id !== check?.id) : check ? data.checks.map(item => item.id === check.id ? { ...item, count: next } : item) : [...data.checks, { id: crypto.randomUUID(), habit_id: habit.id, completed_on: today, count: next }] });
    else { if (next === 0 && check) await client?.from('habit_completions').delete().eq('id', check.id); else if (check) await client?.from('habit_completions').update({ count: next }).eq('id', check.id); else await client?.from('habit_completions').insert({ id: crypto.randomUUID(), habit_id: habit.id, completed_on: today, count: next }); await load(); }
  };
  const periodChecks = useMemo(() => data.checks.reduce<Record<string, number>>((counts, item) => ({ ...counts, [item.habit_id]: (counts[item.habit_id] ?? 0) + item.count }), {}), [data.checks]);
  if (loading) return <p className="loading">{korean ? '계획을 불러오는 중…' : 'Opening your plans…'}</p>;
  const actions = data.actions.filter(item => showArchived ? Boolean(item.archived_at) : !item.archived_at);
  return <section className="tracker-page"><header className="tracker-heading"><p>{korean ? '행동으로 이어가기' : 'Turn thoughts into action'}</p><h1>{korean ? '오늘의 계획' : 'Your next steps'}</h1></header>
    <section className="tracker-section"><div className="tracker-section-heading"><h2>{showArchived ? (korean ? '보관함' : 'Archive') : (korean ? '액션 인박스' : 'Action inbox')}</h2><button className="archive-toggle" onClick={() => setShowArchived(value => !value)}>{showArchived ? (korean ? '인박스 보기' : 'View inbox') : (korean ? '보관함' : 'Archive')}</button></div>{!showArchived && <div className="tracker-compose"><input value={actionTitle} onChange={event => setActionTitle(event.target.value)} placeholder={korean ? '해야 할 일을 적어보세요' : 'Add something to do'} onKeyDown={event => { if (event.key === 'Enter') void addAction(); }} /><input type="date" value={actionDate} onChange={event => setActionDate(event.target.value)} aria-label={korean ? '마감일' : 'Due date'} /><button onClick={() => { void addAction(); }}>{korean ? '추가' : 'Add'}</button></div>}<div className="tracker-list">{actions.length ? actions.map(action => <article className={`tracker-row ${action.completed_at ? 'done' : ''}`} key={action.id}><button className="check" aria-label={korean ? '완료 상태 변경' : 'Toggle complete'} onClick={() => { void toggleAction(action); }}>{action.completed_at ? '✓' : ''}</button><div><h3>{action.title}</h3>{action.due_date && <p>{korean ? `${action.due_date}까지` : `Due ${action.due_date}`}</p>}</div><button className="row-menu" aria-label={korean ? '추가 작업' : 'More actions'} onClick={() => setOpenMenu(value => value === action.id ? null : action.id)}>•••</button>{openMenu === action.id && <div className="action-menu"><button onClick={() => { void archiveAction(action); }}>{action.archived_at ? (korean ? '인박스로 복원' : 'Restore') : (korean ? '보관' : 'Archive')}</button>{action.archived_at && <button className="delete-action" onClick={() => { void deleteAction(action); }}>{korean ? '영구 삭제' : 'Delete permanently'}</button>}</div>}</article>) : <p className="tracker-empty">{showArchived ? (korean ? '보관된 액션이 없어요.' : 'Nothing is archived.') : (korean ? '일기에서 다음 행동을 발견하면 여기에 적어 두세요.' : 'Keep the next thing you want to do here.')}</p>}</div></section>
    <section className="tracker-section"><div className="tracker-section-heading"><h2>{korean ? '습관' : 'Habits'}</h2><span>{korean ? '주간 또는 월간 목표' : 'Weekly or monthly goals'}</span></div><div className="tracker-compose habit-compose"><input value={habitName} onChange={event => setHabitName(event.target.value)} placeholder={korean ? '예: 운동' : 'e.g. Run'} /><select value={habitCadence} onChange={event => setHabitCadence(event.target.value as 'week' | 'month')} aria-label={korean ? '주기' : 'Cadence'}><option value="week">{korean ? '주간' : 'Weekly'}</option><option value="month">{korean ? '월간' : 'Monthly'}</option></select><input type="number" min="1" max="99" value={habitTarget} onChange={event => setHabitTarget(Math.max(1, Number(event.target.value) || 1))} aria-label={korean ? '목표 횟수' : 'Target count'} /><button onClick={() => { void addHabit(); }}>{korean ? '추가' : 'Add'}</button></div><div className="tracker-list">{data.habits.length ? data.habits.map(habit => { const todayCount = data.checks.find(item => item.habit_id === habit.id && item.completed_on === today)?.count ?? 0; const start = habit.cadence === 'month' ? monthStart(today) : weekStart(today); const count = data.checks.filter(item => item.habit_id === habit.id && item.completed_on >= start).reduce((sum, item) => sum + item.count, 0); return <article className="tracker-row habit-row" key={habit.id}><div><h3>{habit.name}</h3><p>{korean ? `이번 ${habit.cadence === 'month' ? '달' : '주'} ${count}/${habit.weekly_target}회` : `${count}/${habit.weekly_target} this ${habit.cadence}`}</p></div><div className="count-stepper"><button aria-label="Subtract" onClick={() => { void changeHabitCount(habit, -1); }}>−</button><strong>{todayCount}</strong><button aria-label="Add" onClick={() => { void changeHabitCount(habit, 1); }}>+</button></div></article>; }) : <p className="tracker-empty">{korean ? '이름, 기간, 목표 횟수를 정해 습관을 추가하세요.' : 'Set a name, period, and target to add a habit.'}</p>}</div></section>
  </section>;
}

function weekStart(date: string): string { const value = new Date(`${date}T12:00:00`); value.setDate(value.getDate() - ((value.getDay() + 6) % 7)); return localDate(value); }
function monthStart(date: string): string { return `${date.slice(0, 7)}-01`; }

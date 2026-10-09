import { useEffect, useId, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { localDate } from './model';
import type { Locale } from './i18n';

type Action = { id: string; title: string; due_date: string | null; completed_at: string | null; archived_at: string | null; source_entry_id: string | null };
type Habit = { id: string; name: string; weekly_target: number; cadence: 'week' | 'month'; week_starts_on: 0 | 1; active: boolean };
type HabitCheck = { id: string; habit_id: string; completed_on: string; count: number };
type TrackerData = { actions: Action[]; habits: Habit[]; checks: HabitCheck[] };
const key = (userId: string) => `life-journal:tracker:${userId}`;
const empty: TrackerData = { actions: [], habits: [], checks: [] };

export function useHabitDays({ client, userId, preview, month, active }: { readonly client: SupabaseClient | null; readonly userId: string; readonly preview: boolean; readonly month: string; readonly active: boolean }) {
  const [days, setDays] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!active) return;
      if (preview) {
        const cached = JSON.parse(localStorage.getItem(key(userId)) ?? JSON.stringify(empty)) as TrackerData;
        if (!cancelled) setDays(new Set(cached.checks.filter(check => check.completed_on.startsWith(month)).map(check => check.completed_on)));
        return;
      }
      if (!client) return;
      const end = nextMonth(month);
      const { data } = await client.from('habit_completions').select('completed_on').gte('completed_on', `${month}-01`).lt('completed_on', `${end}-01`);
      if (!cancelled) setDays(new Set((data ?? []).map(check => check.completed_on)));
    };
    void load();
    return () => { cancelled = true; };
  }, [active, client, month, preview, userId]);
  return days;
}

export function Tracker({ client, userId, preview, locale }: { readonly client: SupabaseClient | null; readonly userId: string; readonly preview: boolean; readonly locale: Locale }) {
  const [data, setData] = useState<TrackerData>(empty);
  const [loading, setLoading] = useState(true);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [habitName, setHabitName] = useState('');
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitTarget, setHabitTarget] = useState(1);
  const [habitCadence, setHabitCadence] = useState<'week' | 'month'>('week');
  const [habitWeekStart, setHabitWeekStart] = useState<0 | 1>(1);
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState(1);
  const [editCadence, setEditCadence] = useState<'week' | 'month'>('week');
  const [editWeekStart, setEditWeekStart] = useState<0 | 1>(1);
  const today = localDate();
  const korean = locale === 'ko';

  const load = async () => {
    setLoading(true);
    if (preview) {
      const cached = JSON.parse(localStorage.getItem(key(userId)) ?? JSON.stringify(empty)) as TrackerData;
      setData({ ...cached, habits: cached.habits.map(habit => ({ ...habit, week_starts_on: habit.week_starts_on ?? 1, active: habit.active ?? true })) });
      setLoading(false);
      return;
    }
    if (!client) return;
    const [actions, habits, checks] = await Promise.all([
      client.from('action_items').select('id,title,due_date,completed_at,archived_at,source_entry_id').order('created_at', { ascending: false }),
      client.from('habits').select('id,name,weekly_target,cadence,week_starts_on,active').eq('active', true).order('created_at'),
      client.from('habit_completions').select('id,habit_id,completed_on,count').order('completed_on', { ascending: false }),
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
    const habit = { id: crypto.randomUUID(), name, weekly_target: habitTarget, cadence: habitCadence, week_starts_on: habitWeekStart, active: true };
    if (preview) savePreview({ ...data, habits: [...data.habits, habit] });
    else { await client?.from('habits').insert(habit); await load(); }
    setAddingHabit(false); setHabitName(''); setHabitTarget(1); setHabitCadence('week'); setHabitWeekStart(1);
  };
  const changeHabitCount = async (habit: Habit, delta: number) => {
    const check = data.checks.find(item => item.habit_id === habit.id && item.completed_on === today);
    const next = (check?.count ?? 0) + delta; if (next < 0) return;
    if (preview) savePreview({ ...data, checks: next === 0 ? data.checks.filter(item => item.id !== check?.id) : check ? data.checks.map(item => item.id === check.id ? { ...item, count: next } : item) : [...data.checks, { id: crypto.randomUUID(), habit_id: habit.id, completed_on: today, count: next }] });
    else { if (next === 0 && check) await client?.from('habit_completions').delete().eq('id', check.id); else if (check) await client?.from('habit_completions').update({ count: next }).eq('id', check.id); else await client?.from('habit_completions').insert({ id: crypto.randomUUID(), habit_id: habit.id, completed_on: today, count: next }); await load(); }
  };
  const openHabit = (habit: Habit) => { setSelectedHabitId(habit.id); setEditTarget(habit.weekly_target); setEditCadence(habit.cadence); setEditWeekStart(habit.week_starts_on); };
  const saveHabitSettings = async (habit: Habit) => {
    const update = { weekly_target: editTarget, cadence: editCadence, week_starts_on: editWeekStart };
    if (preview) savePreview({ ...data, habits: data.habits.map(item => item.id === habit.id ? { ...item, ...update } : item) });
    else { await client?.from('habits').update(update).eq('id', habit.id); await load(); }
  };
  if (loading) return <p className="loading">{korean ? '계획을 불러오는 중…' : 'Opening your plans…'}</p>;
  const actions = data.actions.filter(item => showArchived ? Boolean(item.archived_at) : !item.archived_at);
  const selectedHabit = data.habits.find(habit => habit.id === selectedHabitId) ?? null;
  return <section className="tracker-page"><header className="tracker-heading"><p>{korean ? '행동으로 이어가기' : 'Turn thoughts into action'}</p><h1>{korean ? '오늘의 계획' : 'Your next steps'}</h1><span className="page-intro">{korean ? '작은 실천이 쌓여, 나의 하루가 됩니다.' : 'Small steps, a little more you every day.'}</span></header>
    <div className="plan-summary"><div><strong>{data.checks.filter(check => check.completed_on === today).reduce((sum, check) => sum + check.count, 0)}</strong><span>{korean ? '오늘의 실천' : 'Steps today'}</span></div><div><strong>{data.habits.filter(habit => periodCount(data.checks, habit, today) >= habit.weekly_target).length}<small> / {data.habits.length}</small></strong><span>{korean ? '이번 주기 목표 달성' : 'Habit goals reached'}</span></div><div><strong>{data.actions.filter(action => !action.archived_at && !action.completed_at).length}</strong><span>{korean ? '남은 할 일' : 'Open actions'}</span></div></div>
    <section className="tracker-section"><div className="tracker-section-heading"><h2>{showArchived ? (korean ? '보관함' : 'Archive') : (korean ? '액션 인박스' : 'Action inbox')}</h2><button className="archive-toggle" onClick={() => setShowArchived(value => !value)}>{showArchived ? (korean ? '인박스 보기' : 'View inbox') : (korean ? '보관함' : 'Archive')}</button></div>{!showArchived && <div className="tracker-compose"><input aria-label={korean ? '할 일' : 'Action title'} value={actionTitle} onChange={event => setActionTitle(event.target.value)} placeholder={korean ? '해야 할 일을 적어보세요' : 'Add something to do'} onKeyDown={event => { if (event.key === 'Enter') void addAction(); }} /><input type="date" value={actionDate} onChange={event => setActionDate(event.target.value)} aria-label={korean ? '마감일' : 'Due date'} /><button onClick={() => { void addAction(); }}>{korean ? '추가' : 'Add'}</button></div>}<div className="tracker-list">{actions.length ? actions.map(action => <article className={`tracker-row ${action.completed_at ? 'done' : ''}`} key={action.id}><button className="check" aria-label={korean ? '완료 상태 변경' : 'Toggle complete'} onClick={() => { void toggleAction(action); }}>{action.completed_at ? '✓' : ''}</button><div><h3>{action.title}</h3>{action.due_date && <p>{korean ? `${action.due_date}까지` : `Due ${action.due_date}`}</p>}</div><button className="row-menu" aria-label={korean ? '추가 작업' : 'More actions'} onClick={() => setOpenMenu(value => value === action.id ? null : action.id)}>•••</button>{openMenu === action.id && <div className="action-menu"><button onClick={() => { void archiveAction(action); }}>{action.archived_at ? (korean ? '인박스로 복원' : 'Restore') : (korean ? '보관' : 'Archive')}</button>{action.archived_at && <button className="delete-action" onClick={() => { void deleteAction(action); }}>{korean ? '영구 삭제' : 'Delete permanently'}</button>}</div>}</article>) : <p className="tracker-empty">{showArchived ? (korean ? '보관된 액션이 없어요.' : 'Nothing is archived.') : (korean ? '일기에서 다음 행동을 발견하면 여기에 적어 두세요.' : 'Keep the next thing you want to do here.')}</p>}</div></section>
    <section className="tracker-section"><div className="tracker-section-heading"><h2>{korean ? '습관' : 'Habits'}</h2><button className="habit-add-toggle" aria-expanded={addingHabit} aria-controls="habit-create" onClick={() => setAddingHabit(value => !value)}>{addingHabit ? (korean ? '닫기' : 'Close') : (korean ? '+ 습관 추가' : '+ New habit')}</button></div><p className="section-description">{korean ? '한 번 할 때마다 사과 한 조각. 나만의 속도로 채워가요.' : 'One step, one apple slice. Grow at your own pace.'}</p>{addingHabit && <div id="habit-create" className="tracker-compose habit-compose"><label className="habit-name-field"><span>{korean ? '습관 이름' : 'Habit name'}</span><input value={habitName} onChange={event => setHabitName(event.target.value)} placeholder={korean ? '예: 아침 달리기' : 'e.g. Morning run'} /></label><label><span>{korean ? '반복 주기' : 'Repeat'}</span><select value={habitCadence} onChange={event => setHabitCadence(event.target.value as 'week' | 'month')} aria-label={korean ? '주기' : 'Cadence'}><option value="week">{korean ? '매주' : 'Weekly'}</option><option value="month">{korean ? '매월' : 'Monthly'}</option></select></label>{habitCadence === 'week' && <label><span>{korean ? '시작 요일' : 'Week starts'}</span><select value={habitWeekStart} onChange={event => setHabitWeekStart(Number(event.target.value) as 0 | 1)} aria-label={korean ? '주 시작일' : 'Week starts'}><option value="1">{korean ? '월요일 시작' : 'Starts Monday'}</option><option value="0">{korean ? '일요일 시작' : 'Starts Sunday'}</option></select></label>}<label><span>{korean ? '목표 횟수' : 'Target count'}</span><input type="number" min="1" max="99" value={habitTarget} onChange={event => setHabitTarget(Math.max(1, Number(event.target.value) || 1))} aria-label={korean ? '목표 횟수' : 'Target count'} /></label><button disabled={!habitName.trim()} onClick={() => { void addHabit(); }}>{korean ? '습관 만들기' : 'Create habit'}</button></div>}<div className="tracker-list habit-list">{data.habits.length ? data.habits.map(habit => { const todayCount = dayCount(data.checks, habit.id, today); const count = periodCount(data.checks, habit, today); return <article className={`tracker-row habit-row ${count >= habit.weekly_target ? 'goal-met' : ''}`} key={habit.id}><button className="habit-details" onClick={() => openHabit(habit)}><div><h3>{habit.name}</h3><p>{periodSummary(habit, count, korean)}</p><span className="history-link">{korean ? '이력 · 목표 수정 ↗' : 'History & goal ↗'}</span></div><HabitProgress count={count} target={habit.weekly_target} korean={korean} /></button><div className="habit-checkin"><span>{korean ? '오늘의 실천' : 'Today'}</span><div className="count-stepper"><button disabled={todayCount === 0} aria-label={korean ? '한 번 빼기' : 'Subtract one'} onClick={() => { void changeHabitCount(habit, -1); }}>−</button><strong>{todayCount}</strong><button aria-label={korean ? '한 번 추가' : 'Add one'} onClick={() => { void changeHabitCount(habit, 1); }}>+</button></div></div></article>; }) : <p className="tracker-empty">{korean ? '이름, 주기, 기준일, 목표 횟수를 정해 습관을 추가하세요.' : 'Set a name, period, start, and target to add a habit.'}</p>}</div></section>
    {selectedHabit && <section className="tracker-section habit-history"><div className="tracker-section-heading"><div><p className="eyebrow">{korean ? '이행 이력' : 'Completion history'}</p><h2>{selectedHabit.name}</h2></div><button className="archive-toggle" onClick={() => setSelectedHabitId(null)}>{korean ? '닫기' : 'Close'}</button></div><div className="habit-settings"><label><span>{korean ? '주기' : 'Cadence'}</span><select value={editCadence} onChange={event => setEditCadence(event.target.value as 'week' | 'month')}><option value="week">{korean ? '매주' : 'Weekly'}</option><option value="month">{korean ? '매월' : 'Monthly'}</option></select></label>{editCadence === 'week' && <label><span>{korean ? '새 주 시작' : 'Week starts'}</span><select value={editWeekStart} onChange={event => setEditWeekStart(Number(event.target.value) as 0 | 1)}><option value="1">{korean ? '월요일' : 'Monday'}</option><option value="0">{korean ? '일요일' : 'Sunday'}</option></select></label>}<label><span>{korean ? '목표 횟수' : 'Target'}</span><input type="number" min="1" max="99" value={editTarget} onChange={event => setEditTarget(Math.max(1, Number(event.target.value) || 1))} /></label><button onClick={() => { void saveHabitSettings(selectedHabit); }}>{korean ? '변경 저장' : 'Save changes'}</button></div><div className="history-list">{historyPeriods(data.checks, selectedHabit, today).length === 0 && <p className="tracker-empty">{korean ? '아직 실천 기록이 없어요. 첫 기록부터 이력이 쌓여요.' : 'No check-ins yet. Your history begins with your first one.'}</p>}{historyPeriods(data.checks, selectedHabit, today).map(start => { const count = periodCount(data.checks, selectedHabit, start); const done = count >= selectedHabit.weekly_target; return <article className="history-row" key={start}><div><strong>{periodLabel(selectedHabit, start, locale)}</strong><span>{korean ? `${count}/${selectedHabit.weekly_target}회` : `${count}/${selectedHabit.weekly_target} times`}</span></div><b className={done ? 'met' : ''}>{done ? (korean ? '달성' : 'Met') : (count === 0 ? (korean ? '기록 없음' : 'No check-ins') : (korean ? '진행 기록' : 'Logged'))}</b></article>; })}</div></section>}
  </section>;
}

export function HabitProgress({ count, target, korean }: { readonly count: number; readonly target: number; readonly korean: boolean }) {
  const clipId = 'apple-clip-' + useId().replace(/:/g, '');
  const slices = Math.min(target, 8);
  const filled = Math.min(slices, Math.ceil((Math.min(count, target) / target) * slices));
  const sliceHeight = 44 / slices;
  const label = count >= target ? (korean ? '사과 완성!' : 'Apple complete!') : (korean ? String(target - count) + '조각 더' : String(target - count) + ' slices left');
  return <div className="habit-progress" aria-label={korean ? '사과 목표 ' + target + '조각 중 ' + count + '조각 완료' : String(count) + ' of ' + target + ' apple slices completed'}>
    <svg className="apple-progress" viewBox="0 0 64 72" aria-hidden="true">
      <defs><clipPath id={clipId}><path d="M32 18C19 11 7 19 7 36c0 17 11 26 25 26s25-9 25-26C57 19 45 11 32 18Z" /></clipPath></defs>
      <path className="apple-base" d="M32 18C19 11 7 19 7 36c0 17 11 26 25 26s25-9 25-26C57 19 45 11 32 18Z" />
      <g clipPath={'url(#' + clipId + ')'}>{Array.from({ length: slices }, (_, index) => <rect className={index < filled ? 'apple-slice filled' : 'apple-slice'} key={index} x="5" y={61 - (index + 1) * sliceHeight} width="54" height={sliceHeight - .7} />)}</g>
      <path className="apple-outline" d="M32 18C19 11 7 19 7 36c0 17 11 26 25 26s25-9 25-26C57 19 45 11 32 18Z" />
      <path className="apple-leaf" d="M33 16c5-10 14-10 18-8-3 8-10 11-18 8Z" />
      <path className="apple-stem" d="M32 17c0-6 2-9 5-11" />
    </svg>
    <span>{label}</span>
  </div>;
}
function dayCount(checks: HabitCheck[], habitId: string, day: string): number { return checks.find(item => item.habit_id === habitId && item.completed_on === day)?.count ?? 0; }
function periodStart(date: string, habit: Habit): string { if (habit.cadence === 'month') return `${date.slice(0, 7)}-01`; const value = new Date(`${date}T12:00:00`); value.setDate(value.getDate() - ((value.getDay() - habit.week_starts_on + 7) % 7)); return localDate(value); }
function periodCount(checks: HabitCheck[], habit: Habit, date: string): number { const start = periodStart(date, habit); return checks.filter(item => item.habit_id === habit.id && periodStart(item.completed_on, habit) === start).reduce((sum, item) => sum + item.count, 0); }
function periodSummary(habit: Habit, count: number, korean: boolean): string { const cadence = habit.cadence === 'month' ? (korean ? '이번 달' : 'this month') : (korean ? `이번 주 · ${habit.week_starts_on === 1 ? '월' : '일'}요일 시작` : `this week · starts ${habit.week_starts_on === 1 ? 'Mon' : 'Sun'}`); return korean ? `${cadence} ${count}/${habit.weekly_target}회` : `${count}/${habit.weekly_target} ${cadence}`; }
export function historyPeriods(checks: HabitCheck[], habit: Habit, today: string): string[] {
  const observed = checks.filter(item => item.habit_id === habit.id && item.count > 0 && item.completed_on <= today).map(item => periodStart(item.completed_on, habit)).sort();
  const first = observed[0];
  if (!first) return [];
  const current = periodStart(today, habit);
  const periods: string[] = [];
  const date = new Date(`${first}T12:00:00`);
  while (localDate(date) <= current) {
    periods.push(localDate(date));
    if (habit.cadence === 'month') date.setMonth(date.getMonth() + 1);
    else date.setDate(date.getDate() + 7);
  }
  return periods.reverse();
}
function periodLabel(habit: Habit, start: string, locale: Locale): string { const formatter = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }); if (habit.cadence === 'month') return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(`${start}T12:00:00`)); const end = new Date(`${start}T12:00:00`); end.setDate(end.getDate() + 6); return `${formatter.format(new Date(`${start}T12:00:00`))} – ${formatter.format(end)}`; }
function nextMonth(month: string): string { const date = new Date(`${month}-01T12:00:00`); date.setMonth(date.getMonth() + 1); return localDate(date).slice(0, 7); }

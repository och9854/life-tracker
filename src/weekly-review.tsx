import { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Entry } from './model';
import { localDate } from './model';
import type { Locale } from './i18n';

type Action = { completed_at: string | null; created_at: string; title: string };
type Completion = { completed_on: string; count: number };
type Review = { note: string; keep: string; reduce: string; rest: string; reminder: boolean };
type Props = { readonly client: SupabaseClient | null; readonly userId: string; readonly preview: boolean; readonly locale: Locale; readonly entries: readonly Entry[]; readonly onOpenEntry: (id: string) => void };

const blank: Review = { note: '', keep: '', reduce: '', rest: '', reminder: false };
const reviewKey = (userId: string, start: string) => `life-journal:weekly-review:${userId}:${start}`;
const reminderKey = (userId: string) => `life-journal:weekly-reminder:${userId}`;

function weekStart(value = localDate()): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return localDate(date);
}
function shiftWeek(start: string, offset: number): string {
  const date = new Date(`${start}T12:00:00`); date.setDate(date.getDate() + offset * 7); return localDate(date);
}
function weekEnd(start: string): string { return shiftWeek(start, 1); }
function label(start: string, locale: Locale): string {
  const from = new Date(`${start}T12:00:00`); const to = new Date(`${shiftWeek(start, 1)}T12:00:00`); to.setDate(to.getDate() - 1);
  const format = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' });
  return `${format.format(from)} – ${format.format(to)}`;
}
function downloadCalendar(locale: Locale, start: string): void {
  const ko = locale === 'ko';
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const startDate = start.replaceAll('-', '');
  const summary = ko ? 'Life Journal 주간 회고' : 'Life Journal weekly review';
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Life Journal//EN', 'BEGIN:VEVENT', `UID:life-journal-${startDate}@local`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${startDate}`, `SUMMARY:${summary}`, 'RRULE:FREQ=WEEKLY;BYDAY=MO', 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', `DESCRIPTION:${summary}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'life-journal-weekly-review.ics'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function WeeklyReview({ client, userId, preview, locale, entries, onOpenEntry }: Props) {
  const korean = locale === 'ko';
  const first = useMemo(() => entries.length ? weekStart(entries.reduce((earliest, entry) => entry.entry_date < earliest ? entry.entry_date : earliest, entries[0]?.entry_date ?? localDate())) : weekStart(), [entries]);
  const [start, setStart] = useState(weekStart());
  const [actions, setActions] = useState<Action[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [review, setReview] = useState<Review>(blank);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState('');
  const end = weekEnd(start);
  const weekEntries = entries.filter(entry => entry.entry_date >= start && entry.entry_date < end);
  const rangeActions = actions.filter(action => action.completed_at && action.completed_at.slice(0, 10) >= start && action.completed_at.slice(0, 10) < end);
  const steps = completions.filter(item => item.completed_on >= start && item.completed_on < end).reduce((total, item) => total + item.count, 0);

  useEffect(() => {
    let active = true; setLoaded(false); setSaved('');
    const local = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(reviewKey(userId, start)) ?? 'null') as Review | null;
        const reminder = localStorage.getItem(reminderKey(userId)) === 'true';
        if (active) { setReview(stored ? { ...blank, ...stored, reminder } : { ...blank, reminder }); setActions([]); setCompletions([]); setLoaded(true); }
      } catch { if (active) { setReview(blank); setLoaded(true); } }
    };
    if (preview || !client) { local(); return () => { active = false; }; }
    void Promise.all([
      client.from('action_items').select('completed_at,created_at,title').gte('completed_at', `${start}T00:00:00`).lt('completed_at', `${end}T00:00:00`),
      client.from('habit_completions').select('completed_on,count').gte('completed_on', start).lt('completed_on', end),
    ]).then(([actionResult, completionResult]) => {
      if (!active) return;
      setActions((actionResult.data ?? []) as Action[]); setCompletions((completionResult.data ?? []) as Completion[]);
      local();
    }).catch(local);
    return () => { active = false; };
  }, [client, end, preview, start, userId]);
  const save = () => {
    try {
      const { reminder, ...answers } = review;
      localStorage.setItem(reviewKey(userId, start), JSON.stringify(answers));
      localStorage.setItem(reminderKey(userId), String(reminder));
      setSaved(korean ? '이 기기에 저장했어요.' : 'Saved on this device.');
    } catch { setSaved(korean ? '저장하지 못했어요.' : 'Could not save this review.'); }
  };
  const older = start > first;
  return <section className="review-page">
    <header className="review-heading"><p>{korean ? '돌아보기' : 'Weekly reflection'}</p><h1>{korean ? '나와 했던 약속' : 'The promises you made yourself'}</h1><span>{korean ? '사실을 먼저 보고, 다음 한 주의 한 가지를 정해요.' : 'Look at what happened, then choose one gentle next step.'}</span></header>
    <section className="review-period" aria-label={korean ? '회고 기간' : 'Review period'}><button disabled={!older} onClick={() => setStart(value => shiftWeek(value, -1))} aria-label={korean ? '이전 주' : 'Previous week'}>‹</button><strong>{label(start, locale)}</strong><button disabled={start >= weekStart()} onClick={() => setStart(value => shiftWeek(value, 1))} aria-label={korean ? '다음 주' : 'Next week'}>›</button></section>
    {!loaded ? <p className="loading">{korean ? '한 주를 불러오는 중…' : 'Opening your week…'}</p> : <>
      <section className="review-facts"><article><strong>{weekEntries.length}</strong><span>{korean ? '남긴 기록' : 'entries written'}</span></article><article><strong>{steps}</strong><span>{korean ? '습관 실천' : 'habit check-ins'}</span></article><article><strong>{rangeActions.length}</strong><span>{korean ? '완료한 할 일' : 'actions completed'}</span></article></section>
      <section className="review-section"><div><p className="eyebrow">{korean ? '이번 주의 기록' : 'Your words this week'}</p><h2>{weekEntries.length ? (korean ? '다시 읽고 싶은 장면' : 'Moments worth revisiting') : (korean ? '이번 주에 남긴 기록이 없어요.' : 'No entries from this week.')}</h2></div>{weekEntries.length ? <div className="review-entry-list">{weekEntries.map(entry => <button key={entry.id} onClick={() => onOpenEntry(entry.id)}><span>{entry.entry_date}</span><strong>{entry.title || entry.body.split('\n')[0]?.slice(0, 64) || (korean ? '제목 없는 기록' : 'Untitled entry')}</strong><i>↗</i></button>)}</div> : <p>{korean ? '기록이 없다는 것은 비어 있다는 뜻일 뿐, 실패가 아니에요.' : 'No entry is simply no entry, not a failure.'}</p>}</section>
      <section className="review-section"><p className="eyebrow">{korean ? '다음 주를 위한 메모' : 'A note for next week'}</p><label className="review-note"><span>{korean ? '이번 주에 느낀 점' : 'What did you notice?'}</span><textarea value={review.note} maxLength={1000} placeholder={korean ? '짧게 적어도 좋아요.' : 'A few words is enough.'} onChange={event => setReview(value => ({ ...value, note: event.target.value }))} /></label><div className="review-intentions"><label><span>{korean ? '이어갈 것' : 'Keep'}</span><input value={review.keep} maxLength={120} placeholder={korean ? '예: 수요일 산책' : 'e.g. Wednesday walk'} onChange={event => setReview(value => ({ ...value, keep: event.target.value }))} /></label><label><span>{korean ? '줄일 것' : 'Reduce'}</span><input value={review.reduce} maxLength={120} placeholder={korean ? '예: 늦은 밤 일' : 'e.g. late work'} onChange={event => setReview(value => ({ ...value, reduce: event.target.value }))} /></label><label><span>{korean ? '쉬어갈 것' : 'Rest'}</span><input value={review.rest} maxLength={120} placeholder={korean ? '예: 주말 오전' : 'e.g. Saturday morning'} onChange={event => setReview(value => ({ ...value, rest: event.target.value }))} /></label></div><button className="review-save" onClick={save}>{korean ? '이번 주 회고 저장' : 'Save this reflection'}</button>{saved && <span className="review-saved" role="status">{saved}</span>}</section>
      <section className="review-section review-reminder"><p className="eyebrow">{korean ? '내가 정한 알림' : 'Your reminder'}</p><h2>{korean ? '다음 주에도 돌아볼까요?' : 'Make room for next week?'}</h2><p>{korean ? '캘린더에 매주 월요일 회고를 추가합니다. 이메일은 아직 보내지 않아요.' : 'Add a Monday weekly reflection to your calendar. Email is not sent yet.'}</p><label className="reminder-choice"><input type="checkbox" checked={review.reminder} onChange={event => setReview(value => ({ ...value, reminder: event.target.checked }))} />{korean ? '캘린더 알림을 준비해 둘게요' : 'Prepare a calendar reminder for me'}</label><button className="calendar-button" disabled={!review.reminder} onClick={() => downloadCalendar(locale, start)}>{korean ? '캘린더 알림 파일 받기' : 'Download calendar reminder'}</button></section>
    </>}
  </section>;
}

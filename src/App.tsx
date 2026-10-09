import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { User } from '@supabase/supabase-js';
import { formatDate, initialLocale, messages } from './i18n';
import type { Locale } from './i18n';
import { JournalStore } from './journal-store';
import { localDate, markdown } from './model';
import { cloudRepository, previewRepository, supabase } from './repository';
import type { Repository } from './model';
import { Tracker, useHabitDays } from './tracker';
import { MySpace } from './my-space';

function download(text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `life-journal-${localDate()}.md`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Language({ locale, onChange }: { readonly locale: Locale; readonly onChange: (locale: Locale) => void }) {
  return <label className="language"><span className="sr-only">{messages[locale].language}</span>
    <select value={locale} onChange={event => onChange(event.target.value === 'ko' ? 'ko' : 'en')}>
      <option value="en">English</option><option value="ko">한국어</option>
    </select>
  </label>;
}

function Brand() {
  return <div className="brand"><img src="/icon.svg" width="32" height="32" alt="" /><span>Life Journal</span></div>;
}

function ArrowLeft() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7M8 12h9" /></svg>; }
function Plus() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>; }
function Dots() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>; }
function Sliders() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6M16 14v6" /></svg>; }
function Book() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5H7.5A2.5 2.5 0 0 0 5 22V4.5Zm0 0V19.5" /></svg>; }
function Calendar() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>; }
function CheckSquare() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="m8 12 2.5 2.5L16 9" /></svg>; }
function Person() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21c.8-3.6 3.2-5.5 7.5-5.5s6.7 1.9 7.5 5.5" /></svg>; }
function Chevron() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>; }

function weekDays(today: string, locale: Locale) {
  const date = new Date(`${today}T12:00:00`);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() + index);
    const value = localDate(day);
    return {
      value,
      label: new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'narrow' }).format(day),
      day: day.getDate(),
    };
  });
}

function monthDays(month: string) {
  const first = new Date(`${month}-01T12:00:00`);
  const mondayOffset = (first.getDay() + 6) % 7;
  first.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    return { value: localDate(date), day: date.getDate(), inMonth: localDate(date).startsWith(month) };
  });
}

function shiftMonth(month: string, offset: number): string {
  const date = new Date(`${month}-01T12:00:00`);
  date.setMonth(date.getMonth() + offset);
  return localDate(date).slice(0, 7);
}

function formatMonth(month: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
}

type JournalProps = {
  readonly locale: Locale;
  readonly onLocale: (locale: Locale) => void;
  readonly userId: string;
  readonly email: string;
  readonly preview: boolean;
  readonly repository: Repository;
  readonly onExit: () => Promise<void>;
};
type View = 'today' | 'history' | 'calendar' | 'tracker' | 'my';
const routeToView: Record<string, View> = { '#today': 'today', '#entries': 'history', '#calendar': 'calendar', '#plans': 'tracker', '#me': 'my' };
const viewToRoute: Record<View, string> = { today: '#today', history: '#entries', calendar: '#calendar', tracker: '#plans', my: '#me' };

function Journal({ locale, onLocale, userId, email, preview, repository, onExit }: JournalProps) {
  const t = messages[locale];
  const store = useMemo(() => new JournalStore(repository, userId, localStorage), [repository, userId]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [view, setView] = useState<View>(() => routeToView[window.location.hash] ?? 'today');
  const [mode, setMode] = useState<'timeline' | 'editor'>('timeline');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [today, setToday] = useState(localDate());
  const [month, setMonth] = useState(today.slice(0, 7));
  const habitDays = useHabitDays({ client: preview ? null : supabase, userId, preview, month, active: view === 'calendar' });

  useEffect(() => {
    void store.load();
    const resume = () => { setOnline(navigator.onLine); setToday(localDate()); };
    const disconnected = () => setOnline(false);
    const unload = (event: BeforeUnloadEvent) => {
      if (store.getSnapshot().pending > 0) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('online', resume);
    window.addEventListener('offline', disconnected);
    window.addEventListener('focus', resume);
    window.addEventListener('beforeunload', unload);
    const midnightCheck = setInterval(() => setToday(localDate()), 60000);
    return () => {
      store.stop(); clearInterval(midnightCheck);
      window.removeEventListener('online', resume); window.removeEventListener('offline', disconnected);
      window.removeEventListener('focus', resume); window.removeEventListener('beforeunload', unload);
    };
  }, [store]);
  useEffect(() => {
    const syncRoute = () => setView(routeToView[window.location.hash] ?? 'today');
    window.addEventListener('hashchange', syncRoute);
    if (!window.location.hash) window.history.replaceState(null, '', '#today');
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const entries = [...state.entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date) || b.created_at.localeCompare(a.created_at));
  const visible = entries.filter(e => view === 'history' || e.entry_date === today);
  const selected = entries.find(e => e.id === selectedId);
  const status = selected ? state.status[selected.id] ?? 'saved' : 'saved';
  const statusText = preview && status === 'saved' ? t.pending : t[status];
  const days = weekDays(today, locale);

  function create() { setSelectedId(store.add()); setView('today'); setMode('editor'); }
  function navigate(next: View) { window.location.hash = viewToRoute[next]; }
  function openEntry(id: string) { setSelectedId(id); setMode('editor'); }
  async function exit() {
    if (state.pending > 0) { setNotice(t.leave); return; }
    try { await onExit(); }
    catch (error) { if (error instanceof Error) setNotice(t.logoutError); else throw error; }
  }
  const notices = <>{preview && <div className="banner">{t.previewNote}</div>}{!online && !preview && <div className="banner" role="status">{t.offline}</div>}{state.storageError && <div className="alert" role="alert">{t.draftWarning}</div>}{notice && <div className="alert" role="alert">{notice}</div>}</>;
  const settings = settingsOpen && <><button className="scrim" aria-label={t.close} onClick={() => setSettingsOpen(false)} /><section className="settings-sheet" aria-label={t.settings}>
    <header><div><p className="eyebrow">LIFE JOURNAL</p><h2>{t.settings}</h2></div><button className="icon-button" aria-label={t.close} onClick={() => setSettingsOpen(false)}>×</button></header>
    <label className="setting-row"><span>{t.language}</span><Language locale={locale} onChange={onLocale} /></label>
    <button className="setting-row" disabled={!state.loaded || entries.length === 0} onClick={() => { try { download(markdown(entries)); } catch (error) { if (error instanceof Error) setNotice(t.exportError); else throw error; } }}>{t.export}<span>↓</span></button>
    <div className="settings-account"><span>{preview ? 'Preview' : email}</span><button className="quiet" onClick={() => { void exit(); }}>{preview ? t.exit : t.logout}</button></div>
  </section></>;

  if (mode === 'editor' && selected) return <div className="journal-app editor-workspace">
    {notices}<header className="editor-topbar"><button className="back-button" onClick={() => setMode('timeline')}><ArrowLeft />{t.back}</button><div className="editor-actions"><span className={`save-state ${status === 'error' || status === 'conflict' ? 'failed' : ''}`} role="status" aria-live="polite">{statusText}</span><button className="save-button" disabled={status === 'saving' || status === 'conflict'} onClick={() => { void store.flush(); }}>{status === 'saving' ? t.savingNow : status === 'saved' ? t.savedNow : t.save}</button><button className="icon-button" aria-label={t.settings} onClick={() => setSettingsOpen(true)}><Dots /></button></div></header>
    <main className="editor-page"><label className="entry-date"><span className="sr-only">{t.date}</span><input type="date" value={selected.entry_date} required onChange={event => { if (event.target.validity.valid && event.target.value) store.edit(selected.id, { title: selected.title, body: selected.body, entry_date: event.target.value }); }} /></label>
      {(status === 'error' || status === 'conflict') && <button className="quiet recovery" onClick={() => { if (status === 'conflict') { const id = store.keepAsNew(selected.id); if (id) setSelectedId(id); } else void store.flush(); }}>{status === 'conflict' ? t.copy : t.retry}</button>}
      <label className="sr-only" htmlFor="entry-title">{t.title}</label><input id="entry-title" className="editor-title" maxLength={200} placeholder={t.title} value={selected.title} onChange={event => store.edit(selected.id, { title: event.target.value, body: selected.body, entry_date: selected.entry_date })} />
      <label className="sr-only" htmlFor="entry-body">{t.body}</label><textarea id="entry-body" key={selected.id} className="editor-body" maxLength={200000} placeholder={t.placeholder} value={selected.body} onChange={event => store.edit(selected.id, { title: selected.title, body: event.target.value, entry_date: selected.entry_date })} />
      <footer className="editor-footer"><span>{t.writingMeta}</span><span>{Array.from(selected.body).length.toLocaleString(locale)} {t.words}</span></footer>
    </main>{settings}
  </div>;

  return <div className="journal-app timeline-workspace">
    {notices}<header className="journal-topbar"><Brand /><button className="icon-button" aria-label={t.settings} onClick={() => setSettingsOpen(true)}><Sliders /></button></header>
    <main className="timeline-page">{state.loadError ? <section className="empty"><h1>{t.loadError}</h1><button className="primary" onClick={() => { void store.load(); }}>{t.retry}</button></section>
      : !state.loaded ? <p className="loading" role="status">{t.loading}</p> : view === 'my' ? <MySpace client={preview ? null : supabase} email={email} locale={locale} onPlans={() => navigate('tracker')} onSettings={() => setSettingsOpen(true)} /> : view === 'tracker' ? <Tracker client={preview ? null : supabase} userId={userId} preview={preview} locale={locale} /> : view === 'calendar' ? <><section className="calendar-heading"><p>{t.calendar}</p><div><button className="month-button previous" aria-label="Previous month" onClick={() => setMonth(value => shiftMonth(value, -1))}><Chevron /></button><h1>{formatMonth(month, locale)}</h1><button className="month-button" aria-label="Next month" onClick={() => setMonth(value => shiftMonth(value, 1))}><Chevron /></button></div></section>
        <section className="calendar-grid" aria-label={formatMonth(month, locale)}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>)}{monthDays(month).map(day => { const hasEntries = entries.some(entry => entry.entry_date === day.value); const hasHabit = habitDays.has(day.value); return <button key={day.value} className={`calendar-day ${day.inMonth ? '' : 'outside'} ${day.value === today ? 'selected' : ''}`} aria-label={formatDate(day.value, locale)} onClick={() => { setToday(day.value); navigate('today'); }}><span>{day.day}</span>{(hasEntries || hasHabit) && <span className="calendar-markers" aria-hidden="true">{hasEntries && <i className="entry-marker" />}{hasHabit && <i className="habit-marker" />}</span>}</button>; })}</section>
        <section className="calendar-note"><p>{locale === 'ko' ? '파란 점은 일기, 초록 점은 습관 이행이에요. 날짜를 누르면 그날의 기록을 볼 수 있어요.' : 'Blue marks are entries and green marks are habit completions. Choose a date to read what you wrote.'}</p></section></> : <><section className="day-hero"><p>{view === 'today' ? t.todayLabel : t.history}</p><h1>{view === 'today' ? formatDate(today, locale) : t.history}</h1><span>{view === 'today' ? t.todayPrompt : `${entries.length} ${locale === 'en' && entries.length === 1 ? 'entry' : t.entryCount}`}</span></section>
        {view === 'today' && <nav className="week-strip" aria-label={locale === 'ko' ? '이번 주' : 'This week'}>{days.map(day => <button key={day.value} className={day.value === today ? 'week-day active' : 'week-day'} onClick={() => { setToday(day.value); }}><span>{day.label}</span><strong>{day.day}</strong></button>)}</nav>}
        {visible.length ? <section className="entry-feed" aria-label={t.history}>{visible.map(entry => <button className="entry-card" key={entry.id} onClick={() => openEntry(entry.id)}><span className="entry-card-date">{formatDate(entry.entry_date, locale)}</span><h2>{entry.title || entry.body.split('\n')[0]?.slice(0, 70) || t.untitled}</h2><p>{entry.body || t.todayPrompt}</p><small>{state.status[entry.id] === 'error' || state.status[entry.id] === 'conflict' ? '!' : new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(entry.updated_at))}</small></button>)}</section>
          : <section className="empty timeline-empty"><div className="empty-mark" aria-hidden="true">—</div><h2>{view === 'today' ? t.noToday : t.empty}</h2><p>{view === 'today' ? t.noTodayHelp : t.emptyHelp}</p></section>}</>}
    </main>
    <button className="compose-button" disabled={!state.loaded} onClick={create}><Plus />{t.newEntry}</button><nav className="bottom-nav" aria-label={locale === 'ko' ? '기록 탐색' : 'Journal navigation'}><button className={view === 'today' ? 'active' : ''} onClick={() => navigate('today')}><span><Book /></span>{t.today}</button><button className={view === 'history' ? 'active' : ''} onClick={() => navigate('history')}><span><Book /></span>{t.history}</button><button className={view === 'calendar' ? 'active' : ''} onClick={() => { setMonth(today.slice(0, 7)); navigate('calendar'); }}><span><Calendar /></span>{t.calendar}</button><button className={view === 'tracker' ? 'active' : ''} onClick={() => navigate('tracker')}><span><CheckSquare /></span>{locale === 'ko' ? '계획' : 'Plans'}</button><button className={view === 'my' ? 'active' : ''} onClick={() => navigate('my')}><span><Person /></span>{locale === 'ko' ? '내 공간' : 'Me'}</button></nav>{settings}
  </div>;
}

export function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(supabase !== null);
  const [preview, setPreview] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const t = messages[locale];
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'ko' ? 'Life Journal · 나의 기록' : 'Life Journal · Your journal';
    try { localStorage.setItem('life-journal:locale', locale); } catch (error) { if (!(error instanceof Error)) throw error; }
  }, [locale]);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const oauthError = new URLSearchParams(window.location.search).get('error');
    if (oauthError) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setAuthError(true);
    }
    void supabase.auth.getSession().then(({ data, error }) => {
      if (active) { setUser(data.session?.user ?? null); setAuthError(Boolean(error) || Boolean(oauthError)); setLoading(false); }
    }).catch(() => { if (active) { setAuthError(true); setLoading(false); } });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null); setLoading(false);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  const repository = useMemo(() => {
    if (preview) return previewRepository(localStorage);
    if (user && supabase) return cloudRepository(supabase, user.id);
    return null;
  }, [preview, user?.id]);

  async function signIn() {
    if (!supabase) return;
    setSigningIn(true); setAuthError(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) { setAuthError(true); setSigningIn(false); }
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setAuthError(true); setSigningIn(false);
    }
  }
  if (repository && (preview || user)) return <Journal key={preview ? 'preview' : user?.id} locale={locale} onLocale={setLocale} userId={preview ? 'preview' : user?.id ?? ''} email={user?.email ?? ''} preview={preview} repository={repository} onExit={async () => {
    if (preview) { setPreview(false); return; }
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  }} />;
  return <div className="welcome">
    <header className="welcome-header"><Brand /><Language locale={locale} onChange={setLocale} /></header>
    <main className="welcome-content">
      <div className="eyebrow">LIFE JOURNAL / 01</div>
      <h1>{t.greeting}</h1><p className="intro">{t.intro}</p>
      <button className="primary google-button" disabled={!supabase || signingIn || loading} onClick={() => { void signIn(); }}>{loading ? t.loading : t.google}</button>
      <p className="privacy">{t.private}</p>
      {!supabase && <p className="setup">{t.setup}</p>}
      {authError && <p className="alert" role="alert">{t.authError}</p>}
      {!supabase && <button className="quiet preview-link" onClick={() => setPreview(true)}>{t.preview}<span aria-hidden="true"> →</span></button>}
      <section className="landing-story"><div><p className="eyebrow">WRITE · NOTICE · ACT</p><h2>{locale === 'ko' ? '기록이 다음 행동으로 이어지도록.' : 'Let a note become your next step.'}</h2><p>{locale === 'ko' ? '일기를 쓰고, 해야 할 일을 꺼내고, 반복하고 싶은 일을 목표로 남깁니다.' : 'Write what happened, keep the next action, and return to what matters.'}</p></div><div className="landing-grid"><article><strong>{locale === 'ko' ? '기록과 회고' : 'Journal and review'}</strong><span>{locale === 'ko' ? '날짜·달력·주간 회고' : 'Dates, calendar, weekly reflection'}</span></article><article><strong>{locale === 'ko' ? '행동과 습관' : 'Actions and habits'}</strong><span>{locale === 'ko' ? '인박스·보관함·주간/월간 목표' : 'Inbox, archive, weekly/monthly goals'}</span></article></div><div className="coming-soon"><p className="eyebrow">COMING SOON</p><h3>{locale === 'ko' ? '원할 때만 켜는 개인 비서.' : 'A private assistant, only when you ask.'}</h3><ul><li>{locale === 'ko' ? '일기에서 액션 후보를 제안하는 AI 정리' : 'AI suggestions for action candidates'}</li><li>{locale === 'ko' ? '이메일·브라우저 알림과 리마인더 시간 설정' : 'Email, browser notifications, and reminder times'}</li><li>{locale === 'ko' ? '내 기록을 기반으로 묻는 대화형 회고' : 'Conversational reflection over your own records'}</li><li>{locale === 'ko' ? '개발자를 위한 MCP 연결' : 'MCP connection for developers'}</li></ul></div></section>
    </main><footer className="welcome-footer">{t.footer}</footer>
  </div>;
}

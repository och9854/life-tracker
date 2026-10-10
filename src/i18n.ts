export type Locale = 'en' | 'ko';
export const messages = {
  en: {
    today: 'Today', history: 'Entries', calendar: 'Calendar', newEntry: 'New entry', save: 'Save', savingNow: 'Saving…', savedNow: 'Saved', language: 'Language', back: 'Entries', settings: 'Settings', close: 'Close',
    todayPrompt: 'Continue with today’s thoughts.', todayLabel: 'Today', writingMeta: 'Only you can read this entry.',
    greeting: 'A little space for your day.', intro: 'Thoughts, ordinary moments, and everything in between. Start wherever you are.',
    google: 'Continue with Google', private: 'Your entries are private. Only you can read them.',
    preview: 'Try the writing space', previewNote: 'Preview · Saved on this device only. Cloud sync is not connected.',
    setup: 'Sign-in is being prepared. You can try the writing space below.',
    date: 'Entry date', title: 'Title (optional)', body: 'Your entry', placeholder: 'What would you like to remember?',
    untitled: 'Untitled entry', empty: 'Your story starts here.', emptyHelp: 'Write a few words, or take your time. There is no right way to begin.',
    noToday: 'A fresh page for today.', noTodayHelp: 'Start a new entry, or revisit something you wrote before.',
    saved: 'Saved', saving: 'Saving…', pending: 'Draft on this device', error: 'Not synced. Your draft is kept on this device.',
    conflict: 'This entry changed elsewhere. Save your draft as a new entry to keep both versions.',
    retry: 'Retry sync', copy: 'Keep as a new entry', draftWarning: 'Device storage is unavailable. Keep this page open until saved, or export your writing.',
    loadError: 'Could not load your entries. Check your connection and try again.',
    export: 'Export Markdown', logout: 'Sign out', exit: 'Leave preview', loading: 'Opening your journal…',
    words: 'characters', entryCount: 'entries', footer: 'A day, in your own words.',
    leave: 'Some entries are not synced. Export your writing before signing out, or retry sync.',
    authError: 'Sign-in did not finish. Please try again.', logoutError: 'Could not sign out. Please try again.', exportError: 'Could not export your entries.',
    offline: 'You are offline. Keep writing; drafts stay on this device until you reconnect.',
    actionFromEntry: 'Turn this into a next step', actionFromEntryHelp: 'Keep one concrete action from this entry in your plans.', actionTitle: 'What will you do next?', actionDue: 'Due date (optional)', addToPlans: 'Add to plans', actionAdded: 'Added to your plans.', actionAddError: 'Could not add this action. Please try again.',
  },
  ko: {
    today: '오늘', history: '기록', calendar: '달력', newEntry: '새 기록', save: '저장', savingNow: '저장 중…', savedNow: '저장됨', language: '언어', back: '기록', settings: '설정', close: '닫기',
    todayPrompt: '오늘의 생각을 이어가세요.', todayLabel: '오늘', writingMeta: '나만 볼 수 있는 기록이에요.',
    greeting: '오늘을 담을 작은 공간.', intro: '떠오른 생각, 평범한 순간, 마음에 남은 일들. 어디서부터든 적어보세요.',
    google: 'Google로 계속하기', private: '기록은 비공개이며 본인만 읽을 수 있어요.',
    preview: '기록 화면 체험하기', previewNote: '체험 모드 · 이 기기에만 저장돼요. 클라우드 동기화는 연결되지 않았어요.',
    setup: '로그인을 준비하고 있어요. 아래에서 기록 화면을 먼저 체험할 수 있어요.',
    date: '기록 날짜', title: '제목 (선택)', body: '기록 내용', placeholder: '오늘 어떤 순간을 남기고 싶나요?',
    untitled: '제목 없는 기록', empty: '첫 이야기를 남겨보세요.', emptyHelp: '짧은 한 줄도, 긴 생각도 좋아요. 편하게 시작해 보세요.',
    noToday: '오늘의 새 페이지.', noTodayHelp: '새 기록을 시작하거나 이전에 쓴 글을 다시 읽어보세요.',
    saved: '저장 완료', saving: '저장 중…', pending: '이 기기에 초안 저장됨', error: '동기화되지 않았어요. 초안은 이 기기에 남아 있어요.',
    conflict: '다른 곳에서 수정된 기록이에요. 초안을 새 기록으로 저장하면 두 버전 모두 보관할 수 있어요.',
    retry: '동기화 다시 시도', copy: '새 기록으로 보관', draftWarning: '기기에 초안을 저장할 수 없어요. 저장이 완료될 때까지 화면을 유지하거나 기록을 내보내 주세요.',
    loadError: '기록을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.',
    export: 'Markdown 내보내기', logout: '로그아웃', exit: '체험 끝내기', loading: '기록을 열고 있어요…',
    words: '자', entryCount: '개의 기록', footer: '나의 언어로 남기는 하루.',
    leave: '아직 동기화되지 않은 기록이 있어요. 동기화를 다시 시도하거나 기록을 내보낸 뒤 로그아웃해 주세요.',
    authError: '로그인을 완료하지 못했어요. 다시 시도해 주세요.', logoutError: '로그아웃하지 못했어요. 다시 시도해 주세요.', exportError: '기록을 내보내지 못했어요.',
    offline: '오프라인이에요. 다시 연결될 때까지 초안은 이 기기에 보관돼요.',
    actionFromEntry: '이 기록을 다음 행동으로', actionFromEntryHelp: '이 글에서 이어갈 한 가지를 계획에 남겨보세요.', actionTitle: '다음에 할 일은 무엇인가요?', actionDue: '마감일 (선택)', addToPlans: '계획에 담기', actionAdded: '계획에 담았어요.', actionAddError: '액션을 추가하지 못했어요. 다시 시도해 주세요.',
  },
} as const;

export function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem('life-journal:locale');
    if (saved === 'en' || saved === 'ko') return saved;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
  }
  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long', day: 'numeric', weekday: 'long', year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

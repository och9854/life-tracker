import { useState } from 'react';
import type { Locale } from './i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Theme = 'system' | 'light' | 'dark';
const key = 'life-journal:theme';
function readTheme(): Theme {
  try { const value = localStorage.getItem(key); return value === 'light' || value === 'dark' ? value : 'system'; }
  catch { return 'system'; }
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
}
export function initializeTheme() {
  applyTheme(readTheme());
  const query = matchMedia('(prefers-color-scheme: dark)');
  const sync = () => applyTheme(readTheme());
  query.addEventListener('change', sync);
  window.addEventListener('storage', sync);
  return () => { query.removeEventListener('change', sync); window.removeEventListener('storage', sync); };
}
export function ThemeSelect({ locale }: { locale: Locale }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const ko = locale === 'ko';
  return <div className="theme-select"><span id="theme-label">{ko ? '화면 모드' : 'Appearance'}</span><Select value={theme} onValueChange={value => {
    const next = value as Theme;
    setTheme(next); applyTheme(next);
    try { localStorage.setItem(key, next); } catch { /* The current screen can still use the selected theme. */ }
  }}><SelectTrigger aria-labelledby="theme-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="system">{ko ? '시스템 설정' : 'System'}</SelectItem><SelectItem value="light">{ko ? '라이트' : 'Light'}</SelectItem><SelectItem value="dark">{ko ? '다크' : 'Dark'}</SelectItem></SelectContent></Select></div>;
}

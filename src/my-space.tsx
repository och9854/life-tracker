import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Archive, ChevronRight, Download, PauseCircle, RefreshCw } from 'lucide-react';
import type { Locale } from './i18n';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  readonly client: SupabaseClient | null;
  readonly email: string;
  readonly locale: Locale;
  readonly onPlans: () => void;
  readonly onReview: () => void;
  readonly onSettings: () => void;
};

export function MySpace({ client, email, locale, onPlans, onReview, onSettings }: Props) {
  const [counts, setCounts] = useState({ actions: 0, habits: 0 });
  const korean = locale === 'ko';

  useEffect(() => {
    if (!client) return;
    void Promise.all([
      client.from('action_items').select('*', { count: 'exact', head: true }).not('archived_at', 'is', null),
      client.from('habits').select('*', { count: 'exact', head: true }).eq('active', false),
    ]).then(([actions, habits]) => setCounts({ actions: actions.count ?? 0, habits: habits.count ?? 0 }));
  }, [client]);

  return <section className="my-page">
    <header className="tracker-heading">
      <p>{korean ? '나의 기록 공간' : 'Your private space'}</p>
      <h1>{korean ? '내 공간' : 'My space'}</h1>
      <span className="account-email">{email}</span>
    </header>
    <section className="my-section">
      <h2>{korean ? '정리하기' : 'Keep it clear'}</h2>
      <Card className="my-card-list"><CardContent>
        <Button variant="ghost" className="my-row" onClick={onPlans}>
          <span className="my-row-icon"><Archive aria-hidden="true" /><strong>{korean ? '보관함' : 'Archive'}</strong><small>{korean ? '나중에 다시 꺼낼 액션' : 'Actions you may return to'}</small></span>
          <Badge variant="secondary">{counts.actions}</Badge>
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button variant="ghost" className="my-row" onClick={onPlans}>
          <span className="my-row-icon"><PauseCircle aria-hidden="true" /><strong>{korean ? '중단한 습관' : 'Paused habits'}</strong><small>{korean ? '필요할 때 다시 시작하세요' : 'Bring them back when ready'}</small></span>
          <Badge variant="secondary">{counts.habits}</Badge>
          <ChevronRight aria-hidden="true" />
        </Button>
      </CardContent></Card>
    </section>
    <section className="my-section">
      <h2>{korean ? '기록 관리' : 'Your journal'}</h2>
      <Card className="my-card-list"><CardContent>
        <Button variant="ghost" className="my-row" onClick={onReview}>
          <span className="my-row-icon"><RefreshCw aria-hidden="true" /><strong>{korean ? '주간 회고' : 'Weekly reflection'}</strong><small>{korean ? '나와 했던 약속을 돌아보고 다음 주를 정해요' : 'Look back, then choose a gentle next step'}</small></span>
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button variant="ghost" className="my-row" onClick={onSettings}>
          <span className="my-row-icon"><Download aria-hidden="true" /><strong>{korean ? '내보내기와 설정' : 'Export and settings'}</strong><small>{korean ? 'Markdown 내보내기, 언어, 로그아웃' : 'Export, language, and sign out'}</small></span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </CardContent></Card>
    </section>
  </section>;
}

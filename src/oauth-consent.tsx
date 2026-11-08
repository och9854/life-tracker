import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Locale } from './i18n';
import { Button } from '@/components/ui/button';

type AuthorizationDetails = {
  authorization_id: string;
  client: { name: string; uri: string; logo_uri: string };
  redirect_uri: string;
  scope: string;
};

type Props = {
  readonly client: SupabaseClient;
  readonly locale: Locale;
};

export function OAuthConsent({ client, locale }: Props) {
  const korean = locale === 'ko';
  const authorizationId = new URLSearchParams(window.location.search).get('authorization_id');
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authorizationId) {
      setError(korean ? '연결 요청을 찾을 수 없어요.' : 'We could not find this connection request.');
      return;
    }
    let active = true;
    void client.auth.oauth.getAuthorizationDetails(authorizationId).then(({ data, error: requestError }) => {
      if (!active) return;
      if (requestError || !data) {
        setError(korean ? '연결 요청을 불러오지 못했어요. 다시 시도해 주세요.' : 'We could not load this connection request. Please try again.');
      } else if ('redirect_url' in data) {
        window.location.assign(data.redirect_url);
      } else {
        setDetails(data);
      }
    }).catch(() => {
      if (active) setError(korean ? '연결 요청을 불러오지 못했어요. 다시 시도해 주세요.' : 'We could not load this connection request. Please try again.');
    });
    return () => { active = false; };
  }, [authorizationId, client, korean]);

  async function decide(approved: boolean) {
    if (!authorizationId) return;
    setBusy(true); setError('');
    const request = approved
      ? client.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : client.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    const { data, error: requestError } = await request;
    if (requestError || !data) {
      setError(korean ? '연결 상태를 저장하지 못했어요. 다시 시도해 주세요.' : 'We could not save your connection choice. Please try again.');
      setBusy(false);
      return;
    }
    window.location.assign(data.redirect_url);
  }

  const scopes = details?.scope.split(' ').filter(Boolean) ?? [];
  return <div className="oauth-consent-page">
    <main className="oauth-consent-card" aria-live="polite">
      <p className="oauth-consent-kicker">LIFE JOURNAL</p>
      <h1>{korean ? '연결을 승인할까요?' : 'Approve this connection?'}</h1>
      {details && <>
        <section className="oauth-client-details">
          {details.client.logo_uri && <img src={details.client.logo_uri} alt="" />}
          <div><strong>{details.client.name}</strong><span>{details.client.uri || details.redirect_uri}</span></div>
        </section>
        <p>{korean ? '이 앱은 내 기록과 계획을 읽거나 새 기록을 만들 수 있습니다. 앱 이름과 요청 범위를 확인한 뒤에만 허용하세요.' : 'This app can read your journal and plans or create new records. Only continue after you recognize the app and its request.'}</p>
        <ul className="oauth-scope-list">{scopes.map(scope => <li key={scope}>{scope}</li>)}</ul>
        <div className="oauth-consent-actions"><Button disabled={busy} onClick={() => { void decide(true); }}>{korean ? '허용하고 연결하기' : 'Allow and connect'}</Button><Button variant="outline" disabled={busy} onClick={() => { void decide(false); }}>{korean ? '취소' : 'Cancel'}</Button></div>
      </>}
      {!details && !error && <p>{korean ? '연결 요청을 확인하는 중이에요…' : 'Checking this connection request…'}</p>}
      {error && <p className="oauth-consent-error" role="alert">{error}</p>}
    </main>
  </div>;
}

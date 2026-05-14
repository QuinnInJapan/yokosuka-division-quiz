import { useEffect, useState } from 'react';
import { ConfigProvider } from './config/ConfigProvider';
import { DEFAULT_RUNTIME_CONFIG, type RuntimeConfig } from './config/appConfig';
import { StoreProvider } from './state/store';
import { useStore } from './state/hooks';
import { AppShell } from './components/AppShell';
import { Welcome } from './screens/Welcome';
import { Quiz } from './screens/Quiz';
import { Results } from './screens/Results';
import { Admin } from './screens/Admin';

function ScreenSwitch() {
  const { state } = useStore();
  if (state.screen === 'welcome') return <Welcome />;
  if (state.screen === 'quiz') return <Quiz />;
  return <Results />;
}

function useHashRoute(): string {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  );

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}

export default function App({ config = DEFAULT_RUNTIME_CONFIG }: { config?: RuntimeConfig }) {
  const hash = useHashRoute();

  return (
    <ConfigProvider config={config}>
      {hash === '#/admin' ? (
        <Admin initialConfig={config} />
      ) : (
        <StoreProvider>
          <AppShell>
            <ScreenSwitch />
          </AppShell>
        </StoreProvider>
      )}
    </ConfigProvider>
  );
}

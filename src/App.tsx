import { StoreProvider } from './state/store';
import { useStore } from './state/hooks';
import { AppShell } from './components/AppShell';
import { Welcome } from './screens/Welcome';
import { Quiz } from './screens/Quiz';
import { Results } from './screens/Results';

function ScreenSwitch() {
  const { state } = useStore();
  if (state.screen === 'welcome') return <Welcome />;
  if (state.screen === 'quiz') return <Quiz />;
  return <Results />;
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell>
        <ScreenSwitch />
      </AppShell>
    </StoreProvider>
  );
}

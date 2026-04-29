import { useEffect, type ReactNode } from 'react';
import { useStore } from '../state/hooks';

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useStore();

  useEffect(() => {
    document.body.dataset.screen = state.screen;
  }, [state.screen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [state.screen]);

  return <>{children}</>;
}

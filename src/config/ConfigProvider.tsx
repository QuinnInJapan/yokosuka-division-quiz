import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_RUNTIME_CONFIG, type RuntimeConfig } from './appConfig';

const ConfigContext = createContext<RuntimeConfig | null>(null);

export function ConfigProvider({
  children,
  config = DEFAULT_RUNTIME_CONFIG,
}: {
  children: ReactNode;
  config?: RuntimeConfig;
}) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): RuntimeConfig {
  const config = useContext(ConfigContext);
  if (!config) throw new Error('useConfig must be used within <ConfigProvider>');
  return config;
}

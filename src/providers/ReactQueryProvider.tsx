import { useEffect, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { focusManager, QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  PersistQueryClientProviderProps,
} from '@tanstack/react-query-persist-client';
import { persistKey } from '@/features';
// import { useReactQueryDevTools } from "@dev-plugins/react-query";

const queryStorage = new MMKV({
  id: 'react-query-cache',
});

const createMMKVPersister = (key: string) => ({
  persistClient: async (client: any) => {
    try {
      queryStorage.set(key, JSON.stringify(client));
    } catch (error) {
      console.error('Failed to persist query client:', error);
    }
  },
  restoreClient: async () => {
    try {
      const stored = queryStorage.getString(key);
      return stored ? JSON.parse(stored) : undefined;
    } catch (error) {
      console.error('Failed to restore query client:', error);
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      queryStorage.delete(key);
    } catch (error) {
      console.error('Failed to remove query client:', error);
    }
  },
});

const PERSISTED_QUERY_KEYS = [
  'auth',
  'novu',
  persistKey,
];

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        structuralSharing: false,
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  });

const dehydrateOptions: PersistQueryClientProviderProps['persistOptions']['dehydrateOptions'] = {
  shouldDehydrateMutation: () => false,
  shouldDehydrateQuery: (query) => {
    return PERSISTED_QUERY_KEYS.some(key => 
      String(query.queryKey[0]).startsWith(key)
    );
  },
};

const setupNetworkListeners = () => {
  setInterval(() => {
    if (AppState.currentState === 'active') {
    }
  }, 30000);
};

focusManager.setEventListener(onFocus => {
  const subscription = AppState.addEventListener(
    'change',
    (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    },
  );

  return () => subscription.remove();
});

type ReactQueryProviderProps = {
  children: React.ReactNode;
  userId?: string;
};

export function ReactQueryProvider({ 
  children, 
  userId 
}: ReactQueryProviderProps) {
  return (
    <QueryProviderInner
	key={userId}
	userId={userId}
    >
      {children}
    </QueryProviderInner>
  );
}

function QueryProviderInner({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const queryClient = useMemo(() => createQueryClient(), []);
  
  const persistOptions = useMemo(() => {
    const cacheKey = `queryClient-${userId ?? 'anonymous'}`;
    const mmkvPersister = createMMKVPersister(cacheKey);
    
    return {
      persister: mmkvPersister,
      dehydrateOptions,
      maxAge: 24 * 60 * 60 * 1000,
    };
  }, [userId]);

  // useReactQueryDevTools(queryClient);

  useEffect(() => {
    setupNetworkListeners();
  }, []);

  return (
    <PersistQueryClientProvider
	client={queryClient}
	persistOptions={persistOptions}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
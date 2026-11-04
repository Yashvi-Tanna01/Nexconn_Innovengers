import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type LoadingCategory =
  | 'startup'
  | 'navigation'
  | 'city'
  | 'reporting'
  | 'network'
  | 'coordinator'
  | 'chat'
  | 'general';

export interface LoadingState {
  isActive: boolean;
  message: string;
  category: LoadingCategory;
  progress?: number;
}

export interface LoadingContextValue {
  isAppInitialized: boolean;
  setAppInitialized: (initialized: boolean) => void;
  replayStartupAnimation: () => void;
  operationCycle: number;
  loading: LoadingState;
  startLoading: (key: string, message?: string, category?: LoadingCategory) => void;
  stopLoading: (key: string) => void;
  withLoading: <T>(key: string, fn: () => Promise<T>, message?: string, category?: LoadingCategory) => Promise<T>;
}

const defaultLoadingState: LoadingState = {
  isActive: false,
  message: 'Loading...',
  category: 'general',
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fresh launch starts uninitialized
  const [isAppInitialized, setIsAppInitialized] = useState<boolean>(false);
  const [operationCycle, setOperationCycle] = useState<number>(0);
  const [loading, setLoading] = useState<LoadingState>(defaultLoadingState);

  // Track active loading keys with a Map to preserve order and messages
  const activeOperationsRef = useRef<Map<string, { message: string; category: LoadingCategory }>>(new Map());
  const safetyTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const replayStartupAnimation = useCallback(() => {
    setIsAppInitialized(false);
  }, []);

  const stopLoading = useCallback((key: string) => {
    // Clear safety timeout
    const existingTimeout = safetyTimeoutRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      safetyTimeoutRef.current.delete(key);
    }

    activeOperationsRef.current.delete(key);
    if (activeOperationsRef.current.size === 0) {
      setLoading(defaultLoadingState);
    } else {
      // Pick the most recent active operation
      const entries = Array.from(activeOperationsRef.current.entries());
      const last = entries[entries.length - 1];
      setLoading({
        isActive: true,
        message: last[1].message,
        category: last[1].category,
      });
    }
  }, []);

  const startLoading = useCallback(
    (key: string, message = 'Processing signal data...', category: LoadingCategory = 'general') => {
      // Clear any prior safety timer for this key
      const existingTimeout = safetyTimeoutRef.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // 15-second safety timeout so loading state NEVER becomes permanently stuck on network errors
      const timer = setTimeout(() => {
        console.warn(`[LoadingContext] Safety timeout triggered for operation "${key}". Clearing stuck loading state.`);
        stopLoading(key);
      }, 15000);
      safetyTimeoutRef.current.set(key, timer);

      activeOperationsRef.current.set(key, { message, category });
      setOperationCycle((prev) => prev + 1);
      setLoading({
        isActive: true,
        message,
        category,
      });
    },
    [stopLoading]
  );

  const withLoading = useCallback(
    async <T,>(key: string, fn: () => Promise<T>, message?: string, category: LoadingCategory = 'general'): Promise<T> => {
      startLoading(key, message, category);
      try {
        const result = await fn();
        return result;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isAppInitialized,
        setAppInitialized: setIsAppInitialized,
        replayStartupAnimation,
        operationCycle,
        loading,
        startLoading,
        stopLoading,
        withLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};


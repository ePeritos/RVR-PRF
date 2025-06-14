import { useCallback, useRef } from 'react';

// Debounce hook para evitar chamadas excessivas
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T,
    [func, delay]
  );
};

// Throttle hook para limitar frequência de execução
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        func(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [func, delay]
  );
};

// Cache simples para resultados de consultas
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const queryCache = new SimpleCache(5); // 5 minutes TTL

// Utility para measurement de performance
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
};

// Lazy import helper
export const lazyImport = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  const LazyComponent = React.lazy(factory);
  return LazyComponent;
};

import React from 'react';
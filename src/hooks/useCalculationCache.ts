
import { useState, useCallback, useMemo } from 'react';
import { DataRow } from '@/hooks/useSupabaseData';

interface CacheKey {
  parametros: any;
  dataHash: string;
}

interface CachedResult {
  key: CacheKey;
  results: any[];
  timestamp: number;
}

export const useCalculationCache = () => {
  const [cache, setCache] = useState<Map<string, CachedResult>>(new Map());

  // Gera hash dos dados para identificar mudanças
  const generateDataHash = useCallback((data: DataRow[]) => {
    const dataString = JSON.stringify(data.map(item => ({
      id: item.id,
      area_construida_m2: item.area_construida_m2,
      area_do_terreno_m2: item.area_do_terreno_m2,
      idade_aparente_do_imovel: item.idade_aparente_do_imovel,
      rvr: item.rvr,
    })));
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }, []);

  // Gera chave do cache
  const generateCacheKey = useCallback((parametros: any, dataHash: string) => {
    return JSON.stringify({ parametros, dataHash });
  }, []);

  // Verifica se existe resultado em cache
  const getCachedResult = useCallback((parametros: any, data: DataRow[]) => {
    const dataHash = generateDataHash(data);
    const cacheKey = generateCacheKey(parametros, dataHash);
    
    const cached = cache.get(cacheKey);
    if (cached) {
      // Verifica se o cache não está muito antigo (30 minutos)
      const isExpired = Date.now() - cached.timestamp > 30 * 60 * 1000;
      if (!isExpired) {
        console.log('Usando resultado do cache');
        return cached.results;
      } else {
        // Remove cache expirado
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(cacheKey);
          return newCache;
        });
      }
    }
    
    return null;
  }, [cache, generateDataHash, generateCacheKey]);

  // Salva resultado no cache
  const setCachedResult = useCallback((parametros: any, data: DataRow[], results: any[]) => {
    const dataHash = generateDataHash(data);
    const cacheKey = generateCacheKey(parametros, dataHash);
    
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, {
        key: { parametros, dataHash },
        results,
        timestamp: Date.now(),
      });
      
      // Limita o tamanho do cache (máximo 10 entradas)
      if (newCache.size > 10) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }
      
      return newCache;
    });
    
    console.log('Resultado salvo no cache');
  }, [generateDataHash, generateCacheKey]);

  // Limpa todo o cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    console.log('Cache limpo');
  }, []);

  // Estatísticas do cache
  const cacheStats = useMemo(() => ({
    size: cache.size,
    entries: Array.from(cache.values()).map(entry => ({
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
    })),
  }), [cache]);

  return {
    getCachedResult,
    setCachedResult,
    clearCache,
    cacheStats,
  };
};

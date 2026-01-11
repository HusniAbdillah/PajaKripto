import { useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  apiResponseTime: number;
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  networkRequests: number;
}

interface UsePerformanceMonitorResult {
  metrics: PerformanceMetrics;
  startApiCall: () => () => void;
  startRender: () => () => void;
  recordCacheHit: (hit: boolean) => void;
  updateMemoryUsage: (bytes: number) => void;
  reset: () => void;
}

export function usePerformanceMonitor(): UsePerformanceMonitorResult {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    networkRequests: 0,
  });

  const cacheStats = useRef({ hits: 0, total: 0 });

  const startApiCall = useCallback(() => {
    const startTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      networkRequests: prev.networkRequests + 1
    }));

    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        apiResponseTime: responseTime
      }));
    };
  }, []);

  const startRender = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime
      }));
    };
  }, []);

  const recordCacheHit = useCallback((hit: boolean) => {
    cacheStats.current.total++;
    if (hit) {
      cacheStats.current.hits++;
    }
    
    const hitRate = cacheStats.current.total > 0 
      ? (cacheStats.current.hits / cacheStats.current.total) * 100 
      : 0;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate
    }));
  }, []);

  const updateMemoryUsage = useCallback((bytes: number) => {
    setMetrics(prev => ({
      ...prev,
      memoryUsage: bytes
    }));
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      apiResponseTime: 0,
      renderTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      networkRequests: 0,
    });
    cacheStats.current = { hits: 0, total: 0 };
  }, []);

  return {
    metrics,
    startApiCall,
    startRender,
    recordCacheHit,
    updateMemoryUsage,
    reset,
  };
}
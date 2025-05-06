import { Suspense, lazy, ComponentType, PropsWithChildren } from 'react';
import Loading from '@/components/loading';

// Função utilitária para criar componentes lazy com fallback
export function lazyLoad(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback || <Loading />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Função para carregar imagens com lazy loading
export function lazyLoadImage(src: string, alt: string, className?: string) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 w-full h-full" />}>
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
      />
    </Suspense>
  );
} 
import { useEffect } from 'react';

export function useScrollRestoration(key: string) {
  useEffect(() => {
    // Attempt to restore scroll position
    const saved = sessionStorage.getItem(`scroll-${key}`);
    if (saved) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(saved, 10));
      }, 10); // Small delay to let React render lists
    }

    // Save scroll position on scroll (debounced)
    let timeout: any;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
      }, 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
    };
  }, [key]);
}

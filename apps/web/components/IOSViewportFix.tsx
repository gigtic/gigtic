"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function IOSViewportFix() {
  const pathname = usePathname();

  useEffect(() => {
    // Force a resize/scroll event to fix iOS Safari visual viewport glitch
    // where fixed-bottom elements float in the middle of the screen after keyboard closes
    if (typeof window !== 'undefined') {
      window.scrollTo(window.scrollX, window.scrollY);
      
      // Also try to blur any active elements that might be keeping the keyboard ghost alive
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Trigger a hacky resize dispatch
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.scrollTo(window.scrollX, window.scrollY + 1);
        window.scrollTo(window.scrollX, window.scrollY - 1);
      }, 100);
    }
  }, [pathname]);

  return null;
}

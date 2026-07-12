/**
 * SPA-friendly wrapper for the View Transitions API.
 * Falls back to the callback directly when the browser doesn't support it (Firefox, Safari).
 */

export function navigateWithTransition(navigate: () => void): void {
  // @ts-ignore — View Transitions API (Chromium 111+)
  if (typeof document !== 'undefined' && document.startViewTransition) {
    // @ts-ignore
    document.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        navigate();
        // Wait two frames so the browser can capture the new DOM snapshot
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    });
  } else {
    navigate();
  }
}

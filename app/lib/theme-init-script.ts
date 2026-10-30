/**
 * Applies the visitor's theme before first paint, so a saved dark or
 * high-contrast choice never flashes light while the app hydrates.
 *
 * Mirrors ThemeProvider's resolution (nextjs-app/shared/components/
 * ThemeProvider): the saved choice in localStorage ("theme"), then the
 * dt_theme cookie, then prefers-color-scheme, then light. It only touches
 * <html>; ThemeProvider takes over after hydration and also sets <body>.
 *
 * Inline and dependency-free: it runs in <head> before any chunk loads. The
 * intake CSP allows it by hash (THEME_INIT_SCRIPT_HASH in app/lib/intake/csp.ts).
 */
export const THEME_INIT_SCRIPT =
  "(function(){try{var t,s=['light','dark','hcb','hcw'];try{t=localStorage.getItem('theme')}catch(e){}if(s.indexOf(t)<0){var m=document.cookie.match(/(?:^|; )dt_theme=([^;]+)/);t=m?decodeURIComponent(m[1]):null}if(s.indexOf(t)<0){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var r=document.documentElement;r.classList.toggle('themeDark',t==='dark');r.classList.toggle('themeHCB',t==='hcb');r.classList.toggle('themeHCW',t==='hcw');r.dataset.theme=t;r.style.colorScheme=t==='dark'||t==='hcb'?'dark':'light'}catch(e){}})();";

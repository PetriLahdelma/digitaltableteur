/**
 * Saves the server-rendered page before hydration, so a chunk-load failure
 * can put it back (see ssr-snapshot.ts). Kept apart from the hooks in
 * ssr-snapshot.ts so the root layout, a server component, can import it.
 *
 * Inline and dependency-free: it must run before any chunk loads. The page
 * segment is the first child of #main-content (NextLayout's PageTransition
 * wrapper). Scripts are dropped; restored HTML never executes them anyway.
 */
export const SSR_SNAPSHOT_SCRIPT =
  "(function(){try{var d=document,b=d.body,c=b.cloneNode(true),m=d.querySelector('#main-content > div');c.querySelectorAll('script,noscript,template').forEach(function(n){n.remove()});window.__DT_SSR_SNAPSHOT__={path:location.pathname+location.search,body:c.innerHTML,page:m?m.innerHTML:null}}catch(e){}})();";


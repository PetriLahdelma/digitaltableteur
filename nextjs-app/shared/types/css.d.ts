// Side-effect CSS imports (e.g. `import "./globals.css"`) and CSS Modules
// (`import styles from "./Component.module.css"`) used across the app.
// Previously declared in `nextjs-app/src/custom.d.ts` which was deleted as
// part of the legacy Vite/CRA cleanup on 2026-05-26.

declare module "*.css" {
  const content: { readonly [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const content: { readonly [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { readonly [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

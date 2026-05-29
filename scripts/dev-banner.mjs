#!/usr/bin/env node
/**
 * Custom ASCII banner for dev server
 * Displays the D|- brand logo before starting Next.js dev server
 */

// Lime/Neon green like the logo
const LIME = "\x1b[38;2;191;255;0m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const banner = `
${LIME}                ██
${LIME}                ██
${LIME}  █████████     ██
${LIME}  ██      ██    ██    
${LIME}  ██      ██    ██    ███████
${LIME}  ██      ██    ██
${LIME}  █████████     ██
${LIME}                ██
${LIME}                ██${RESET}

  ${DIM}digitaltableteur • Development Server Starting...${RESET}
  ${DIM}First route compile takes ~30–60s (13k modules). Do not refresh until this terminal shows “✓ Compiled /your-route”.${RESET}
  ${DIM}Blog/codeblock generators run on build only — use \`npm run generate:blog\` after editing posts.${RESET}
`;

console.log(banner);

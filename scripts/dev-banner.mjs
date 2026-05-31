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
  ${DIM}“Ready” in ~15–25s only means the server process started — not that pages load yet.${RESET}
  ${DIM}First visit compiles the route (~25–40s cold; revisits and later routes are much faster). Wait for “✓ Compiled /…” before refreshing.${RESET}
  ${DIM}If startup itself takes 5+ min: run \`npm run dev:reset\` (bloated .next/webpack cache).${RESET}
  ${DIM}After editing MDX: \`npm run generate:blog\` (or \`npm run dev:full\`).${RESET}
  ${DIM}Preview scheduled drafts: \`npm run dev:drafts\` or /blog?preview=drafts${RESET}
`;

console.log(banner);

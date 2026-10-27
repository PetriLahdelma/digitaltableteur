import { chromium, type Browser } from "playwright-core";

import { PRINT_TOKEN_HEADER } from "./print-token";

/**
 * Prints the submission's print page with headless Chromium. On Vercel
 * (Linux) the browser is @sparticuz/chromium; locally it is Playwright's
 * own Chromium (`npx playwright install chromium`).
 */
async function launch(): Promise<Browser> {
  if (process.platform === "linux") {
    const serverless = (await import("@sparticuz/chromium")).default;
    return chromium.launch({ executablePath: await serverless.executablePath(), args: serverless.args, headless: true });
  }
  return chromium.launch({ headless: true });
}

export type RenderInput = Readonly<{
  origin: string;
  submissionId: string;
  token: string;
  /** Footer text on every page, before the page number, e.g. "Page". */
  pageLabel: string;
}>;

/** A4, tagged (headings, lists and the document language reach assistive technology), with an outline. */
export async function renderSubmissionPdf(input: RenderInput): Promise<Buffer> {
  const browser = await launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 900, height: 1270 },
      reducedMotion: "reduce",
      extraHTTPHeaders: { [PRINT_TOKEN_HEADER]: input.token },
    });
    const page = await context.newPage();
    const response = await page.goto(`${input.origin}/intake/print/${input.submissionId}`, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response?.ok()) throw new Error(`Print page answered ${response?.status() ?? "nothing"}`);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      tagged: true,
      outline: true,
      scale: 0.75,
      margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;padding:0 16mm;font:8px Helvetica,Arial,'Liberation Sans',sans-serif;color:#626a72;text-align:end">${input.pageLabel} <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

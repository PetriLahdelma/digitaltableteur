# Codex image generation (digitaltableteur only)

> **Scope:** This repo only. Use for blog heroes, OG images, and editorial art — not for SVG diagrams you can build in code.
>
> **Related:** [`OG_IMAGE_GENERATION_GUIDE.md`](OG_IMAGE_GENERATION_GUIDE.md) (1200×630 specs), [`WRITING_STYLE.md`](WRITING_STYLE.md) (prose voice).

---

## How this fits together

| Surface | Can generate images? | Auth |
|---------|-------------------|------|
| **Codex CLI** (interactive or `codex exec`) | Yes — built-in `image_gen` tool (`gpt-image-2`) | ChatGPT/Codex login (`codex login`) — **no** separate API key for default path |
| **Codex fallback CLI** (`~/.codex/skills/.system/imagegen/scripts/image_gen.py`) | Yes — direct Images API | `OPENAI_API_KEY` in environment + network |
| **Cursor agent** (this IDE) | No Codex `image_gen` tool in-session | Delegate via shell: `codex exec …` or `python "$IMAGE_GEN" …` |
| **Cursor `GenerateImage`** | Separate image tool | Not Codex; different limits/billing |

**Cursor cannot call Codex’s `image_gen` tool directly.** To “connect” them, run Codex (or the fallback script) from the repo and save files under `public/` or `content/`.

---

## Prerequisites on your machine

### 1. Fix Codex CLI (currently broken here)

`codex` is on PATH but the native binary is missing from the npm vendor folder (`ENOENT`). Reinstall:

```bash
npm install -g @openai/codex@latest
codex --version
codex login          # if needed
codex login status   # expect: "Logged in using ChatGPT"
```

### 2. Enable image generation in Codex

Either:

```bash
codex features enable image_generation
```

Or in `~/.codex/config.toml`:

```toml
[features]
image_generation = true
```

Restart Codex after changing config. If the session says *“built-in image tool is not exposed”*, the flag is off or the CLI build is too old — upgrade and restart.

### 3. Imagegen skill (already installed)

OpenAI ships the skill at:

`~/.codex/skills/.system/imagegen/`

Invoke in a Codex session with natural language or `$imagegen` in the prompt. It prefers the built-in tool; see `SKILL.md` there for edit/batch/transparent-background rules.

---

## Do you need an API key?

| Workflow | `OPENAI_API_KEY`? |
|----------|-------------------|
| Codex TUI / `codex exec` with built-in `image_gen` | **No** — uses your ChatGPT/Codex subscription (counts toward Codex usage; see [Codex pricing](https://developers.openai.com/codex/cli/features)) |
| Fallback `image_gen.py` CLI | **Yes** — same key as chat (`OPENAI_API_KEY` in `.env.local` is fine) |
| Large batches via API (Codex docs suggest this) | **Yes** — API pricing instead of Codex turn limits |
| Cursor agent runs fallback script for you | **Yes** — script reads env; do not commit the key |

This repo already documents `OPENAI_API_KEY` for chat (`app/api/chat`, `scripts/generate-alt-text.js`). Image fallback can reuse it.

---

## Recommended workflows

### A. Interactive Codex (best for iteration)

From repo root:

```bash
cd /Users/petrilahdelma/SAPDevelop/digitaltableteur
codex
```

Example prompt:

```text
$imagegen

Create a 1536×1024 blog hero for "Agentic Design Systems" — operating-model loop,
minimal diagram aesthetic, brand-appropriate, no stock-photo look.
Read docs/OG_IMAGE_GENERATION_GUIDE.md for safe margins.
Save the final PNG/WebP under public/blog/agentic-design-systems/hero-01-operating-models.png
and tell me the path.
```

Codex should copy outputs into the workspace (not leave them only under `~/.codex/generated_images/`).

### B. Non-interactive `codex exec` (automation / agent delegation)

**Important:** Pass the prompt via **stdin from a file**, not as a multi-line shell argument (otherwise Codex may hang on “Reading additional input from stdin”):

```bash
codex exec --sandbox workspace-write \
  --dangerously-bypass-approvals-and-sandbox \
  --enable image_generation \
  -o /tmp/result.md \
  < content/drafts/agentic-design-systems/codex-prompts/hero-01.txt
```

Put the **prompt before** image flags when using `--image` ([exec + images issue](https://github.com/openai/codex/issues/2323)):

```bash
cd /Users/petrilahdelma/SAPDevelop/digitaltableteur

codex exec \
  --sandbox workspace-write \
  --output-last-message /tmp/codex-image-result.md \
  '$imagegen Generate public/blog/my-post/hero.webp per docs/OG_IMAGE_GENERATION_GUIDE.md: title "…", subtitle "…", 1200x630 composition.'
```

Requires working `codex` binary + `image_generation` feature + network (`[sandbox_workspace_write] network_access = true` — already set in your `~/.codex/config.toml`).

### C. Direct API fallback (no Codex session)

When Codex image tool is unavailable or you want API billing only:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export IMAGE_GEN="$CODEX_HOME/skills/.system/imagegen/scripts/image_gen.py"

# Load key from .env.local without printing it
set -a && source .env.local && set +a

python "$IMAGE_GEN" generate \
  --prompt "Minimal editorial blog hero, design systems theme, …" \
  --size 1536x1024 \
  --quality high \
  --out public/blog/my-slug/hero.png
```

Dry-run (no API call):

```bash
python "$IMAGE_GEN" generate --prompt "Test" --out output/imagegen/test.png --dry-run
```

Install CLI deps in the environment Codex docs recommend (`openai` package; often via `uv pip install openai` in the Codex venv).

### D. Ask Cursor to run Codex for you

In Cursor chat you can say:

> Run `codex exec` with `$imagegen` to create the hero for `content/drafts/...` and save under `public/blog/...`.

The agent will use the shell paths above. **You do not need to give the agent a new key** if the built-in Codex path works after reinstall. **You do need `OPENAI_API_KEY` in `.env.local`** only if you want the agent to use fallback `image_gen.py` instead.

---

## Blog / OG checklist

After any generated asset:

1. **Size:** OG/social → 1200×630 (or generate larger and crop); blog heroes often 1536×1024 or 16:9 per art direction.
2. **Format:** Prefer WebP + PNG fallback for OG (`docs/OG_IMAGE_GENERATION_GUIDE.md`); MDX can reference `/public/...` paths.
3. **Uniqueness:** Do not reuse Sanity CDN heroes from other posts (series policy).
4. **Alt text:** Update MDX `mainImageAlt`; optional `node scripts/generate-alt-text.js` if configured.
5. **Optimize:** Squoosh/ImageOptim; target &lt; 300KB for OG where possible.

---

## External references (research)

| Source | Takeaway |
|--------|----------|
| [Codex CLI — Image generation](https://developers.openai.com/codex/cli/features) | Built-in `gpt-image-2`; `$imagegen`; API key optional for large batches |
| [OpenAI — Image generation API](https://developers.openai.com/api/docs/guides/image-generation) | `gpt-image-2` via Images API or Responses `image_generation` tool |
| [Codex imagegen skill (upstream)](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/imagegen/SKILL.md) | Built-in vs `image_gen.py` fallback; transparency rules |
| [codex exec](https://openai-codex.mintlify.app/cli/exec) | Non-interactive automation from scripts |
| [codex-image-gen (community)](https://github.com/smturtle2/codex-image-gen) | Python wrapper around `codex responses` + OAuth login |
| [Community: gpt-image-2 in Codex](https://community.openai.com/t/introducing-gpt-image-2-available-today-in-the-api-and-codex/1379479) | Rollout/plan limitations on some ChatGPT tiers |

---

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| `spawn …/codex ENOENT` | Reinstall `@openai/codex` globally; verify with `codex doctor` |
| `codex auth status` fails | Use `codex login status` (CLI ≥ 0.135) |
| “Image tool is not exposed” | `codex features enable image_generation` + restart session |
| Codex generates but file not in repo | Prompt explicitly: “save under `public/...` in this workspace” |
| Need true PNG transparency | Built-in uses chroma-key; true alpha needs CLI `gpt-image-1.5 --background transparent` (ask before downgrade) |
| Agent in Cursor says it can’t imagegen | Expected — use `codex exec` or `image_gen.py` via shell |

---

**Last updated:** 2026-05-28 — project-local only; do not mirror to llm-wiki.

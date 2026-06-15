# Contact page experiment rollback (2026-05-29)

**Rollback tag:** `rollback/contact-editorial-baseline`
**Commit:** `377464874` (main through PR #595 — contact editorial, new business, pull quote)

**Experimental branch:** `experiment/contact-editorial` (same starting point; throw-away work OK)

## Restore main to baseline

```bash
git checkout main
git pull origin main
git reset --hard rollback/contact-editorial-baseline
# then force-push only if you intend to rewrite remote main
```

## Abandon experiment only

Delete `experiment/contact-editorial` locally/remotely; `main` and the tag stay unchanged.

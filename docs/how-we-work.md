# How we work: the wayfinder tracker

We plan and ship through GitHub Issues with a small set of labels. The goal is that anyone (or any AI coding session) can pick up the work cold by reading the tracker: what's decided, what's open, and what shipped where.

## Labels

| Label | Used for |
|---|---|
| `wayfinder:map` | The top-level plan. States the destination and indexes every other issue with its status |
| `wayfinder:grilling` | A decision. Lays out the question and options, closes with what was decided and why |
| `wayfinder:research` | Fact-finding that a decision depends on |
| `wayfinder:prototype` | Build something rough to react to, then iterate |
| `wayfinder:task` | Concrete build or verification work with a checklist |

## Rules of the road

- **Every issue links up.** Child issues start with `Part of #N` and list `Blocked by` where it applies.
- **Close with a resolution comment.** What was tested, what passed or failed, what changed, and anything deliberately left out.
- **Decisions get recorded, even "no change".** If the call is to keep something as is, the issue still closes with that call written down, so it doesn't get re-argued later.
- **Pull requests stay out of the issue list.** A PR is linked from a comment on the issue it resolves, never filed as its own issue, so the Issues tab stays a list of real work items.
- **Owner merges.** Changes go up as PRs for review; nothing merges itself.
- **Verify, don't assume.** Resolution comments say how something was checked (a typecheck, a curl of the raw HTML, a live test with tagged URLs), not just that it was done.

## This repo's issues

The issues here mirror the website-related tickets from our private tracker, renumbered and trimmed to the website build. Business, pricing and client tickets are left out. Comments in the files under `code/` still use the original internal ticket numbers; [code/README.md](../code/README.md) maps them to the issues here.

Start with the **Map** issue, which indexes everything else.

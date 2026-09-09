# Branching model

A Gitflow variant with one extra long-lived branch for design prototyping.

## Branches

| Branch | Lives | Purpose |
| --- | --- | --- |
| `main` | forever | Released, tagged versions. The published Storybook and any npm release come from here. Protected. |
| `develop` | forever | Integration branch. Everything lands here first. Protected. |
| `design` | forever | Designer playground. Prototypes, token experiments, new component sketches. Deployed as its own Storybook preview. Not protected. |
| `feature/*` | short | One component or change. Branches from `develop`, merges back to `develop`. |
| `fix/*` | short | Bug fix off `develop`. |
| `release/*` | short | Version bump, changelog, final checks. Branches from `develop`, merges to `main` and back to `develop`. |
| `hotfix/*` | short | Urgent fix off `main`, merges to `main` and back to `develop`. |

## Why `design` is separate

Designers need somewhere to try things in real code without blocking or being blocked by the engineering queue. `design` is that place:

- It always has a live Storybook, so a prototype has a URL to share, not a screenshot.
- Nothing on it is a commitment. Broken states are fine.
- When a prototype is accepted, it does not merge directly. Someone opens a `feature/*` branch off `develop` and brings the accepted parts across properly, with stories, docs and accessibility checks.

That last rule is the important one. `design` is a source of decisions, not a source of merges. Keeping it one-way stops half-finished experiments leaking into the library.

## Keeping `design` current

Pull `develop` into `design` regularly so designers prototype against the current tokens and components:

```bash
git checkout design
git merge develop
git push
```

Do this at least once per release. If `design` drifts too far, delete it and branch a fresh one from `develop`.

## Everyday flow

```bash
# start work
git checkout develop && git pull
git checkout -b feature/tooltip

# ... commit ...
git push -u origin feature/tooltip
# open a PR into develop

# cut a release
git checkout -b release/0.2.0 develop
# bump version, update CHANGELOG
# PR into main, tag v0.2.0, then merge main back into develop
```

## Commit messages

Conventional Commits, so the changelog can be generated:

```
feat(button): add ghost variant
fix(dialog): restore focus to the trigger on close
docs(tokens): document the semantic layer
chore(deps): bump storybook to 10.6
```

## Branch protection to set on GitHub

On `main` and `develop`:

- Require a pull request before merging, one approval.
- Require the `ci` status check to pass.
- Do not allow force pushes.

Leave `design` unprotected on purpose.

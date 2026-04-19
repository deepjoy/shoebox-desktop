# Releases

How versioning, changelog, and release artifacts work for `shoebox-desktop`.

## TL;DR

1. Land conventional commits (`feat:`, `fix:`, …) on `main`.
2. [release-plz.yml](../.github/workflows/release-plz.yml) opens a release PR that bumps the version and updates the changelog. Review and merge.
3. Dispatch [release.yml](../.github/workflows/release.yml) with the new tag (e.g. `v0.3.0`). Installers build, the GitHub release publishes, and the auto-updater picks it up.

You only run step 3 by hand. Steps 1 and 2 are automatic.

## The moving parts

| File | Role |
| --- | --- |
| [src-tauri/Cargo.toml](../src-tauri/Cargo.toml) | **Source of truth** for the app version. |
| [Cargo.toml](../Cargo.toml) | Workspace root + `shoebox-app-shell` shim (see [Why the shim](#why-the-shim)). |
| [src-tauri/CHANGELOG.md](../src-tauri/CHANGELOG.md) | Auto-managed by release-plz. Don't hand-edit. |
| [release-plz.toml](../release-plz.toml) | release-plz config (`git_only`, `version_group`, `changelog_include`). |
| [package.json](../package.json), [src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json) | Followers — `pnpm sync-versions` propagates the Cargo version into them. |
| [scripts/sync-versions.mjs](../scripts/sync-versions.mjs) | The propagation script. Runs in CI on every build. |
| [.github/workflows/release-plz.yml](../.github/workflows/release-plz.yml) | Runs on push to `main`. Opens / updates the release PR. |
| [.github/workflows/release.yml](../.github/workflows/release.yml) | Manual dispatch. Builds installers + publishes the GitHub release. |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Runs on PR + push. Type-check, version-sync check, debug Tauri build per OS. |

## Conventional commits → version bumps

release-plz reads the [Conventional Commits](https://www.conventionalcommits.org/) prefix on every commit since the last tag and picks the bump:

| Commit prefix | Bump |
| --- | --- |
| `fix:` | patch (`0.2.0` → `0.2.1`) |
| `feat:` | minor (`0.2.0` → `0.3.0`) |
| Anything with `BREAKING CHANGE:` in the body or `!` after the type | major (`0.2.0` → `1.0.0`) |
| `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `test:` | no bump (still appears in changelog if scoped to a tracked path) |

Use scopes when useful (`fix(src-tauri): …`, `feat(ui): …`). Squash-merge PRs so the merge commit's message becomes the conventional-commit header on `main`.

## The release flow in detail

### 1. Land work on `main`

PRs use conventional-commit titles. On merge, the squash commit lands on `main` and triggers `release-plz.yml`.

### 2. release-plz opens / updates the release PR

`release-plz.yml`:
- Reads commits since the latest `v*` tag.
- Computes the next version per [conventional commits](#conventional-commits--version-bumps).
- Bumps `src-tauri/Cargo.toml` (and the shim's `Cargo.toml`) to the new version.
- Regenerates `src-tauri/CHANGELOG.md` from the commit log.
- Opens (or updates) a single release PR titled `chore: release vX.Y.Z`.

If multiple commits land before the PR is merged, release-plz amends the same PR. Review the diff, then merge.

### 3. Dispatch `release.yml` with the tag

Once the release PR is merged:

1. Open the **Release** workflow on GitHub Actions.
2. Click **Run workflow**.
3. Leave `tag` blank (it derives `v$version` from `src-tauri/Cargo.toml`) **or** type the tag explicitly (e.g. `v0.3.0`). They must match — a guard in the workflow fails fast if they don't.
4. Run.

`release.yml`:
- Creates a draft GitHub release for the tag.
- Builds installers in parallel on macOS (`.app` + `.dmg`), Windows (`.exe`), and Linux (`.deb` + `.AppImage`).
- Uploads installers + signed updater artifacts (`latest.json`, `*.sig`) to the release.
- Marks the release as published once all platforms succeed. The auto-updater endpoint at [`releases/latest/download/latest.json`](https://github.com/deepjoy/shoebox-desktop/releases/latest/download/latest.json) flips to the new version.

## Why the shim

`Cargo.toml` at the repo root defines a virtual workspace with two members:
- `shoebox-desktop` (the real Tauri crate at `src-tauri/`)
- `shoebox-app-shell` (an empty crate whose only source file is `release-plz-shim.rs`)

release-plz attributes a commit to a package only if it touches a file inside that package's directory. Without the shim, `src-tauri/` is the only "package directory" — so a frontend-only commit (e.g. touching `src/`, `package.json`, `panda.config.ts`) wouldn't trigger a release PR or appear in the changelog.

The shim's package directory is the repo root (excluding `src-tauri/`), so any commit at that level gets attributed to it. [release-plz.toml](../release-plz.toml) then ties them together:

- `version_group = "shoebox"` on both packages — when the shim bumps from a frontend commit, `shoebox-desktop` bumps in lockstep.
- `changelog_include = ["shoebox-app-shell"]` on `shoebox-desktop` — the shim's commits show up in the real changelog.
- `git_tag_enable = false`, `git_release_enable = false`, `publish = false`, `changelog_update = false` on the shim — it never produces a tag, release, crates.io publish, or its own changelog.

`target-dir` is pinned to `src-tauri/target` in [.cargo/config.toml](../.cargo/config.toml) so the workspace conversion didn't move build outputs.

`git_only = true` in `release-plz.toml` tells release-plz to use git tags as the version baseline instead of crates.io (we don't publish to crates.io).

## Version sync

`src-tauri/Cargo.toml` is canonical. Three other files mirror its `version`:
- Root `Cargo.toml` (the shim — kept in lockstep via `version_group`)
- `package.json`
- `src-tauri/tauri.conf.json`

`pnpm sync-versions` reads Cargo.toml and writes the value into the JSON files. It runs in `ci.yml` (verification step — fails CI if drift exists at PR time) and `release.yml` (before the Tauri build).

If you ever need to change the version manually, edit only `src-tauri/Cargo.toml` and run `pnpm sync-versions`.

## Common scenarios

### "I merged a PR but no release PR opened"

- Check that the PR's commit prefix is `feat:` or `fix:`. `chore:`, `ci:`, `docs:` etc. don't bump versions.
- Check that release-plz.yml ran on `main` (Actions tab → release-plz workflow).
- If a release PR is already open, release-plz updates that PR rather than opening a new one.

### "Frontend-only commit didn't trigger anything"

It should — that's what the shim is for. If it doesn't:
- Confirm the commit prefix is `feat:` or `fix:`.
- Look at the release-plz job log; the `release_pr_output` line tells you what it computed.
- As a fallback, push a small `src-tauri/` change (e.g. a doc comment) with the next conventional-commit prefix to nudge it.

### "I need a release right now and release-plz is stuck"

Manual escape hatch:
1. Edit `src-tauri/Cargo.toml` to the new version.
2. Run `pnpm sync-versions`.
3. Append a section to `src-tauri/CHANGELOG.md`.
4. Commit as `chore: release vX.Y.Z`, merge.
5. Dispatch `release.yml` with the new tag.

### "Versions are out of sync"

Run `pnpm sync-versions` locally and commit the result. CI fails fast on drift, so this should only happen if you edited a JSON file by hand.

### "I want to skip a commit from the changelog"

Use a non-bumping prefix (`chore:`, `ci:`, `docs:`, `refactor:`, `style:`, `test:`). Those commits don't get a changelog entry by default.

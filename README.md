# Shoebox

Cross-platform desktop app built with [Tauri 2](https://tauri.app/), React, TypeScript, and Vite.

## Targets

- macOS — `aarch64-apple-darwin` (Apple Silicon)
- Windows — `x86_64-pc-windows-msvc` (NSIS installer)
- Linux — `x86_64-unknown-linux-gnu` (`.deb` + AppImage)

## Prerequisites

- Node.js 20+
- pnpm 9+
- Rust stable toolchain
- Linux dev build deps: `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf libsoup-3.0-dev`

## Quick start

```sh
pnpm install
pnpm tauri dev
```

## Version management

`src-tauri/Cargo.toml` is the version source of truth. The `pnpm sync-versions` script (run in CI) mirrors it into `src-tauri/tauri.conf.json` and `package.json`.

## Release process

1. Land `feat:` / `fix:` commits on `main`.
2. Merge the PR opened by **release-plz**, which bumps `src-tauri/Cargo.toml` and appends a section to `CHANGELOG.md`.
3. Run **Actions → Release → Run workflow**, passing the new tag (e.g. `v0.2.0`). The workflow creates a draft release, builds platform artifacts (`.dmg`, NSIS `.exe`, `.deb`, AppImage), uploads them, and publishes the release.

Use conventional-commit PR titles (e.g. `feat: ...`, `fix: ...`). We squash-merge, so the PR title becomes the commit message that release-plz reads.

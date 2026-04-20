# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1](https://github.com/deepjoy/shoebox-desktop/releases/tag/v0.2.1) - 2026-04-19

### Fixed

- commit auto-generated tauri schemas so release-plz's `cargo package --verify` step doesn't flag them as build-time additions ([#14](https://github.com/deepjoy/shoebox-desktop/pull/14))

## [0.2.0](https://github.com/deepjoy/shoebox-desktop/releases/tag/v0.2.0) - 2026-04-19

### Added

- add Chakra UI + Panda CSS app shell with in-app updater ([#5](https://github.com/deepjoy/shoebox-desktop/pull/5))

### Fixed

- remove .devcontainer from .gitignore ([#6](https://github.com/deepjoy/shoebox-desktop/pull/6))
- document greet command ([#10](https://github.com/deepjoy/shoebox-desktop/pull/10))

## [0.1.0](https://github.com/deepjoy/shoebox-desktop/releases/tag/v0.1.0) - 2026-04-19

### Added

- add auto-updates via signed GitHub releases ([#2](https://github.com/deepjoy/shoebox-desktop/pull/2))
- scaffold Tauri 2 app with cross-platform CI and release pipeline ([#1](https://github.com/deepjoy/shoebox-desktop/pull/1))

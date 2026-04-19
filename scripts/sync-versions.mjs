#!/usr/bin/env node
// Propagate the version from src-tauri/Cargo.toml (source of truth)
// into src-tauri/tauri.conf.json and package.json.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cargoPath = resolve(repoRoot, "src-tauri/Cargo.toml");
const tauriConfPath = resolve(repoRoot, "src-tauri/tauri.conf.json");
const pkgJsonPath = resolve(repoRoot, "package.json");

const cargoToml = readFileSync(cargoPath, "utf8");
const packageSection = cargoToml.split(/^\[/m).find((s) => s.startsWith("package]"));
if (!packageSection) {
  console.error("sync-versions: could not find [package] section in Cargo.toml");
  process.exit(1);
}
const match = packageSection.match(/^version\s*=\s*"([^"]+)"/m);
if (!match) {
  console.error("sync-versions: could not parse version from [package] section");
  process.exit(1);
}
const version = match[1];

function syncJson(path, label) {
  const raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);
  if (obj.version === version) return false;
  console.log(`sync-versions: ${label} ${obj.version} -> ${version}`);
  obj.version = version;
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n");
  return true;
}

const changedTauri = syncJson(tauriConfPath, "tauri.conf.json");
const changedPkg = syncJson(pkgJsonPath, "package.json");

if (!changedTauri && !changedPkg) {
  console.log(`sync-versions: all files already at ${version}`);
}

# Setting this up on a machine

The notes and the site live in two different places on purpose.

| What | Where | Synced by |
|---|---|---|
| The vault (all notes, including `DM/`) | `E:\ObsidianSync\Ascent from Avernus` | **Obsidian Sync** |
| This repo (Quartz, theme, tooling) | `E:\Quartz\avernus` on this machine | **GitHub** |

`content/` in this repo is **not a real folder**. It is a Windows junction pointing at the
vault. Git reads straight through it, so the notes are tracked and published normally while
Obsidian owns the actual files.

## Why the build folders are not synced

`node_modules/` and `.quartz/` hold platform specific binaries (sharp's libvips DLLs, rollup,
the typst compiler) and, more importantly, npm **symlinks** hoisted packages into
`.quartz/plugins/*/node_modules/`.

Copying or syncing those folders between machines flattens every one of those symlinks into an
empty directory. Node then finds the empty directory and fails instead of walking up to the real
package. It has happened twice: 57 plugins broke, and only 4 of them said so out loud. The other
53 failed silently, and the visible symptom was the site building with **zero og-images**.

So: install them per machine, never copy them.

## New machine

```powershell
# 1. the vault: install Obsidian, sign into Obsidian Sync, let it pull down
#    "Ascent from Avernus"

# 2. the repo
git clone https://github.com/ExtendoN64/avernus.git E:\Quartz\avernus
cd E:\Quartz\avernus

# 3. wire content -> vault (adjust both paths to that machine)
New-Item -ItemType Junction -Path "E:\Quartz\avernus\content" `
         -Target "E:\ObsidianSync\Ascent from Avernus"

# 4. dependencies
npm install
npx quartz build
```

A correct build emits **141 files, 44 of them .webp og-images**. If you get 96 files and no
webp, the plugin symlinks are broken. See below.

## Repairing flattened plugin symlinks

Symptom: `Failed to instantiate plugin "og-image" ... Cannot find package .../node_modules/sharp/index.js`

The empty directories shadow the real packages. Delete them and Node resolves up to the root
`node_modules`:

```powershell
$r = "E:\Quartz\avernus"
function Test-Empty($p) { return ((Get-ChildItem -LiteralPath $p -Force -ErrorAction SilentlyContinue).Count -eq 0) }
foreach ($pl in (Get-ChildItem "$r\.quartz\plugins" -Directory -Force)) {
  $nm = Join-Path $pl.FullName "node_modules"
  if (-not (Test-Path -LiteralPath $nm)) { continue }
  foreach ($e in (Get-ChildItem -LiteralPath $nm -Directory -Force)) {
    if ($e.Name.StartsWith("@")) {
      foreach ($s in (Get-ChildItem -LiteralPath $e.FullName -Directory -Force)) {
        if (Test-Empty $s.FullName) { Remove-Item -LiteralPath $s.FullName -Recurse -Force }
      }
      if (Test-Empty $e.FullName) { Remove-Item -LiteralPath $e.FullName -Recurse -Force }
    }
    elseif (Test-Empty $e.FullName) { Remove-Item -LiteralPath $e.FullName -Recurse -Force }
  }
}
```

`npm run install-plugins` does **not** fix this. That script currently dies with
`Unknown file extension ".scss"`, so `.quartz/` has to be moved rather than reinstalled.

## Publishing

Unchanged. From the repo root:

```powershell
.\publish.ps1 "what changed"
```

It refuses to push if anything under `content/DM/` is ever staged.

## The one rule

**`content/DM/` never gets `publish: true` and never leaves the vault.** It is gitignored, so
cloning does not bring it and publishing cannot leak it. Obsidian Sync is what carries it
between machines now, which is also its first real backup.

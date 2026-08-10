<#
.SYNOPSIS
    Preview a quartz-theme on the real site without committing to it.

.DESCRIPTION
    Temporarily injects a theme into quartz.config.yaml, builds to .\preview,
    then RESTORES the config immediately (it is only modified for a few seconds),
    and serves the result locally so you can click around the real wiki.

    Your live site is never touched. Nothing here gets published.

.EXAMPLE
    .\tools\preview-theme.ps1 -List
    Show the shortlist worth trying for this campaign.

.EXAMPLE
    .\tools\preview-theme.ps1 its-theme -Variation ttrpg-dnd
    .\tools\preview-theme.ps1 dune
    .\tools\preview-theme.ps1 -Current
    Build with your existing hand-tuned palette, for side-by-side comparison.

.EXAMPLE
    .\tools\preview-theme.ps1 -Restore
    Panic button: put quartz.config.yaml back if a run was interrupted.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Theme,

    [string]$Variation,

    # swap configuration.theme.colors for a named preset in tools/palettes.json
    [string]$Palette,

    # build with the config exactly as it is now (no theme injected)
    [switch]$Current,

    [switch]$List,
    [switch]$Restore,

    [int]$Port = 8080,

    # build only, do not start the server
    [switch]$NoServe
)

$ErrorActionPreference = "Stop"
$repo = Split-Path $PSScriptRoot -Parent
Set-Location $repo

$cfgPath = Join-Path $repo "quartz.config.yaml"
$bakPath = Join-Path $PSScriptRoot ".quartz.config.backup.yaml"
$outDir = Join-Path $repo "preview"
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Write-Step($t) { Write-Host "`n$t" -ForegroundColor Cyan }
function Write-Ok($t) { Write-Host "  $t" -ForegroundColor Green }
function Write-Warn($t) { Write-Host "  $t" -ForegroundColor Yellow }

$shortlist = @(
    @{ n = "its-theme";  v = "ttrpg-dnd";               d = "Official D&D 5e styling. Statblock-aware callouts." }
    @{ n = "its-theme";  v = "ttrpg-wotc";              d = "WotC house style, a touch cleaner than the dnd variant." }
    @{ n = "its-theme";  v = "ttrpg-pathfinder";        d = "Pathfinder. Warmer, heavier borders." }
    @{ n = "dune";       v = "";                        d = "Sand and rust. Closest to your current parchment." }
    @{ n = "darkember";  v = "";                        d = "Banked coals. Suits the infernal half." }
    @{ n = "cinderpaper";v = "";                        d = "Burnt paper. Light mode is genuinely nice." }
    @{ n = "mulled-wine";v = "";                        d = "Deep red, wintry. Good for the grim register." }
    @{ n = "blood-rush"; v = "";                        d = "Aggressive red. Probably too much, worth seeing." }
    @{ n = "saint-red-paper"; v = "";                   d = "Red on off-white. Very 'illuminated manuscript'." }
    @{ n = "arcane";     v = "";                        d = "Dark, purple-ish. Less hell, more wizard." }
)

$palettePath = Join-Path $PSScriptRoot "palettes.json"

if ($List) {
    Write-Host "`n=== Native palettes (no extra CSS, your custom.scss keeps authority) ===" -ForegroundColor Magenta
    if (Test-Path $palettePath) {
        $pal = Get-Content $palettePath -Raw -Encoding utf8 | ConvertFrom-Json
        foreach ($p in $pal.PSObject.Properties) {
            if ($p.Name -eq "_note") { continue }
            Write-Host ("  {0,-52} {1}" -f ".\tools\preview-theme.ps1 -Palette $($p.Name)", $p.Value.description)
        }
    }
    Write-Host "`n=== Plugin themes (adds ~740 KB of CSS) ===" -ForegroundColor Magenta
    foreach ($s in $shortlist) {
        $cmd = if ($s.v) { ".\tools\preview-theme.ps1 $($s.n) -Variation $($s.v)" } else { ".\tools\preview-theme.ps1 $($s.n)" }
        Write-Host ("  {0,-52} {1}" -f $cmd, $s.d)
    }
    Write-Host "`n  Browse all 752:        tools\theme-gallery.html" -ForegroundColor DarkGray
    Write-Host "  Compare against yours: .\tools\preview-theme.ps1 -Current`n" -ForegroundColor DarkGray
    exit 0
}

if ($Restore) {
    if (Test-Path $bakPath) {
        Copy-Item $bakPath $cfgPath -Force
        Remove-Item $bakPath -Force
        Write-Ok "quartz.config.yaml restored from backup."
    }
    else {
        Write-Warn "No backup found. Your config was probably never modified."
        Write-Warn "Confirm with:  git diff quartz.config.yaml"
    }
    exit 0
}

if (-not $Theme -and -not $Current -and -not $Palette) {
    Write-Warn "Give a theme name, -Palette <name>, -Current, or -List. See -? for help."
    exit 1
}

if ($Palette) {
    if (-not (Test-Path $palettePath)) { Write-Warn "tools/palettes.json not found."; exit 1 }
    $allPalettes = Get-Content $palettePath -Raw -Encoding utf8 | ConvertFrom-Json
    if (-not $allPalettes.PSObject.Properties.Name.Contains($Palette)) {
        Write-Warn "No palette named '$Palette'. Available:"
        $allPalettes.PSObject.Properties.Name | Where-Object { $_ -ne "_note" } | ForEach-Object { Write-Warn "    $_" }
        exit 1
    }
    $chosen = $allPalettes.$Palette
}

# --- guard: refuse to run on a dirty config, we would back up the wrong thing ---
$dirty = git diff --name-only -- quartz.config.yaml
if ($dirty) {
    Write-Warn "quartz.config.yaml has uncommitted changes."
    Write-Warn "Commit or stash them first, so the backup captures a known-good state."
    exit 1
}

# --- back up, inject, build, restore ---
Copy-Item $cfgPath $bakPath -Force
Write-Ok "config backed up"

try {
    if ($Palette) {
        $lines = [System.IO.File]::ReadAllLines($cfgPath, $utf8)
        $tIdx = ($lines | Select-String -Pattern '^  theme:' | Select-Object -First 1).LineNumber
        $pIdx = ($lines | Select-String -Pattern '^plugins:' | Select-Object -First 1).LineNumber
        if (-not $tIdx -or -not $pIdx) { throw "Could not locate the 'theme:' block in quartz.config.yaml" }

        function Emit-Colors($mode, $c) {
            $out = @("      ${mode}:")
            foreach ($k in @('light', 'lightgray', 'gray', 'darkgray', 'dark', 'secondary', 'tertiary', 'highlight', 'textHighlight')) {
                $v = $c.$k
                # rgba(...) must stay unquoted; hex values must stay quoted
                if ($v -match '^(rgba?|hsla?)\(') { $out += "        ${k}: $v" }
                else { $out += "        ${k}: `"$v`"" }
            }
            return $out
        }

        $block = @(
            "  theme:",
            "    fontOrigin: googleFonts",
            "    cdnCaching: true",
            "    typography:",
            "      header: $($chosen.typography.header)",
            "      body: $($chosen.typography.body)",
            "      code: $($chosen.typography.code)",
            "    colors:"
        )
        $block += Emit-Colors "lightMode" $chosen.lightMode
        $block += Emit-Colors "darkMode" $chosen.darkMode

        $new = @()
        $new += $lines[0..($tIdx - 2)]
        $new += $block
        $new += $lines[($pIdx - 1)..($lines.Count - 1)]
        [System.IO.File]::WriteAllText($cfgPath, ($new -join "`n") + "`n", $utf8)
        Write-Ok "applied palette: $Palette  ($($chosen.description))"
    }
    elseif (-not $Current) {
        $lines = [System.IO.File]::ReadAllLines($cfgPath, $utf8)
        $block = @(
            "  - source:",
            "      name: quartz-themes",
            "      repo: github:saberzero1/quartz-themes",
            "      subdir: plugin",
            "    enabled: true",
            "    options:",
            "      theme: $Theme"
        )
        if ($Variation) { $block += "      variation: $Variation" }

        # insert immediately before the top-level `layout:` key, as the ttrpg template does
        $idx = ($lines | Select-String -Pattern '^layout:' | Select-Object -First 1).LineNumber
        if (-not $idx) { throw "Could not find a top-level 'layout:' key in quartz.config.yaml" }
        $new = @()
        $new += $lines[0..($idx - 2)]
        $new += $block
        $new += $lines[($idx - 1)..($lines.Count - 1)]
        [System.IO.File]::WriteAllText($cfgPath, ($new -join "`n") + "`n", $utf8)

        $label = if ($Variation) { "$Theme / $Variation" } else { $Theme }
        Write-Ok "injected theme: $label"
    }
    else {
        Write-Ok "using your current palette, no theme injected"
    }

    Write-Step "Building to .\preview ..."
    npx quartz build --output preview
    if ($LASTEXITCODE -ne 0) { throw "quartz build failed" }
}
finally {
    Copy-Item $bakPath $cfgPath -Force
    Remove-Item $bakPath -Force
    Write-Ok "config restored"
}

# --- prove the restore worked before we let anyone walk away ---
$after = git diff --name-only -- quartz.config.yaml
if ($after) {
    Write-Warn "quartz.config.yaml still differs from HEAD. Run: git checkout -- quartz.config.yaml"
}
else {
    Write-Ok "verified: quartz.config.yaml matches HEAD"
}

if ($NoServe) {
    Write-Step "Built. Open .\preview (not served)."
    exit 0
}

Write-Step "Serving preview..."
node (Join-Path $PSScriptRoot "serve.mjs") $outDir $Port "/avernus"

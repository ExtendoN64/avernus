<#
.SYNOPSIS
    Publishes the campaign wiki: safety-checks, commits, and pushes.

.DESCRIPTION
    Run this after editing notes in Obsidian. It refuses to push if anything
    from DM/ ever ends up staged, then commits and pushes. GitHub Actions
    rebuilds the site (~2 min).

.EXAMPLE
    .\publish.ps1 "session 3 recap"
    .\publish.ps1              # auto-generates a message from the date

.EXAMPLE
    .\publish.ps1 -WhatIf      # show what would happen, change nothing
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message,

    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Write-Step($t) { Write-Host "`n$t" -ForegroundColor Cyan }
function Write-Ok($t)   { Write-Host "  $t" -ForegroundColor Green }
function Write-Warn($t) { Write-Host "  $t" -ForegroundColor Yellow }
function Write-Err($t)  { Write-Host "  $t" -ForegroundColor Red }

Write-Host "`n=== Publish Campaign Wiki ===" -ForegroundColor Magenta

# ---------------------------------------------------------------
# 1. Safety check - nothing from DM/ may ever be committed.
#    .gitignore should prevent this; this is the backstop in case
#    someone edits .gitignore or force-adds a file.
# ---------------------------------------------------------------
Write-Step "Checking for secrets..."

git add -A

$staged = git diff --cached --name-only
$danger = $staged | Where-Object { $_ -match '(^|/)DM/' -or $_ -match '_templates/' -or $_ -match '\.private\.md$' }

if ($danger) {
    Write-Err "STOP - these would be committed to a PUBLIC repo:"
    $danger | ForEach-Object { Write-Err "    $_" }
    Write-Host ""
    Write-Err "Nothing was pushed. Un-stage them with:"
    Write-Err "    git reset"
    Write-Err "Then check .gitignore still contains 'content/DM/'."
    exit 1
}
Write-Ok "No DM files staged."

# ---------------------------------------------------------------
# 2. Report what's actually public vs. held back
# ---------------------------------------------------------------
Write-Step "Notes in the repo:"

$notes = Get-ChildItem "content" -Recurse -Filter *.md -File |
         Where-Object { $_.FullName -notmatch '\\DM\\' -and $_.FullName -notmatch '\\_templates\\' }

$live = @(); $held = @()
foreach ($n in $notes) {
    $head = Get-Content $n.FullName -TotalCount 15 -ErrorAction SilentlyContinue
    $rel  = $n.FullName.Replace("$PSScriptRoot\", "")
    if ($head -match '^\s*publish:\s*true\s*$') { $live += $rel } else { $held += $rel }
}

Write-Host "  LIVE on the site ($($live.Count)):" -ForegroundColor Green
if ($live) { $live | ForEach-Object { Write-Host "    + $_" -ForegroundColor Green } } else { Write-Host "    (none)" }

Write-Host "  Not published ($($held.Count)) - no 'publish: true':" -ForegroundColor DarkGray
if ($held) { $held | ForEach-Object { Write-Host "    - $_" -ForegroundColor DarkGray } } else { Write-Host "    (none)" }

Write-Warn "Reminder: 'not published' still means readable in the public repo."
Write-Warn "Only content/DM/ is truly private."

# ---------------------------------------------------------------
# 3. Anything to do?
# ---------------------------------------------------------------
if (-not $staged) {
    Write-Step "Nothing changed. Site is already up to date."
    exit 0
}

Write-Step "Changes to publish:"
git diff --cached --name-status | ForEach-Object { Write-Host "    $_" }

if (-not $Message) {
    $Message = "Update campaign notes - " + (Get-Date -Format "yyyy-MM-dd")
}

if ($WhatIf) {
    Write-Step "-WhatIf: stopping here. Would commit as:"
    Write-Host "    $Message"
    git reset | Out-Null
    exit 0
}

# ---------------------------------------------------------------
# 4. Commit and push
# ---------------------------------------------------------------
Write-Step "Committing..."
git commit -q -m $Message
Write-Ok $Message

Write-Step "Pushing..."
git push -q origin main
Write-Ok "Pushed."

Write-Step "Done."
Write-Host "  Site rebuilds in ~2 min:  https://extendon64.github.io/avernus/" -ForegroundColor Cyan
Write-Host "  Watch the build:          gh run watch" -ForegroundColor DarkGray
Write-Host ""

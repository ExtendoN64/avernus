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
    .\publish.ps1 -Publish "session 1"
    Marks every note matching "session 1" as publish: true, then pushes.
    Use this instead of hand-editing frontmatter.

.EXAMPLE
    .\publish.ps1 -List        # show what's live vs held, change nothing

.EXAMPLE
    .\publish.ps1 -WhatIf      # show what would happen, change nothing
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message,

    # Note name (or partial) to mark publish: true before pushing
    [string]$Publish,

    # Just report status and exit
    [switch]$List,

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
# 0. -Publish: mark a note as publish: true
#    Adds frontmatter if the note has none, otherwise flips the flag.
#    Refuses to touch DM/ - those must never be published.
# ---------------------------------------------------------------
function Set-NotePublished {
    param([string]$Path)

    $raw  = Get-Content -LiteralPath $Path -Raw -Encoding utf8
    $name = [System.IO.Path]::GetFileNameWithoutExtension($Path).TrimEnd('.')

    if ($raw -match '(?s)^\s*---\r?\n(.*?)\r?\n---\r?\n?(.*)$') {
        $fm   = $Matches[1]
        $body = $Matches[2]

        if ($fm -match '(?m)^\s*publish:\s*.*$') {
            $fm = $fm -replace '(?m)^\s*publish:\s*.*$', 'publish: true'
        } else {
            $fm = $fm.TrimEnd() + "`npublish: true"
        }
        $new = "---`n" + $fm.Trim() + "`n---`n`n" + $body.TrimStart()
    } else {
        # No frontmatter at all - give it some.
        $new = "---`ntitle: $name`npublish: true`n---`n`n" + $raw.TrimStart()
    }

    Set-Content -LiteralPath $Path -Value $new -Encoding utf8 -NoNewline
}

if ($Publish) {
    Write-Step "Marking notes as published: '$Publish'"

    # NB: not named $matches - that collides with PowerShell's automatic
    # $Matches variable, which Set-NotePublished writes to via -match.
    $hits = Get-ChildItem "content" -Recurse -Filter *.md -File |
            Where-Object {
                $_.FullName -notmatch '\\DM\\' -and
                $_.FullName -notmatch '\\_templates\\' -and
                $_.Name -like "*$Publish*"
            }

    if (-not $hits) {
        Write-Err "No note matched '$Publish' (DM/ and _templates/ are never searched)."
        exit 1
    }

    foreach ($m in $hits) {
        $rel = $m.FullName.Replace("$PSScriptRoot\", "")
        if ($WhatIf) {
            Write-Warn "would publish: $rel"
        } else {
            Set-NotePublished -Path $m.FullName
            Write-Ok "publish: true -> $rel"
        }
    }
}

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

if ($held -and -not $List) {
    Write-Host "  To publish one of those:  .\publish.ps1 -Publish ""part of its name""" -ForegroundColor Cyan
}

if ($List) {
    git reset -q | Out-Null
    Write-Step "-List only. Nothing committed."
    exit 0
}

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

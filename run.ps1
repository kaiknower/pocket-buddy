# Pocket Buddy — One-Click Launcher (Windows)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Script = Join-Path $ScriptDir "buddy-reroll.mjs"

$bun = Get-Command bun -ErrorAction SilentlyContinue

if (-not $bun) {
    Write-Host "Installing Bun..." -ForegroundColor Yellow
    powershell -c "irm bun.sh/install.ps1 | iex"
    $env:PATH = "$HOME\.bun\bin;$env:PATH"
}

& bun $Script @args

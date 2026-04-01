#!/usr/bin/env bash
# Pocket Buddy — One-Click Launcher (Mac/Linux)

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$SCRIPT_DIR/buddy-reroll.mjs"

if ! command -v bun &>/dev/null; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

exec bun "$SCRIPT" "$@"

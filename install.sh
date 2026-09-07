#!/usr/bin/env bash
# Symlink every config in this repo to its matching path under $HOME.
# Idempotent: safe to re-run after adding new configs.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$REPO"
git ls-files -z | { grep -zv -e '^install\.sh$' -e '^README' || true; } | while IFS= read -r -d '' f; do
    target="$HOME/$f"
    mkdir -p "$(dirname "$target")"

    if [ -L "$target" ] && [ "$(readlink "$target")" = "$REPO/$f" ]; then
        continue  # already linked
    fi

    if [ -e "$target" ] || [ -L "$target" ]; then
        mv "$target" "$target.bak"
        echo "backed up: $target -> $target.bak"
    fi

    ln -s "$REPO/$f" "$target"
    echo "linked: $target"
done

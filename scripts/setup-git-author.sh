#!/usr/bin/env sh
set -e

repo_root="$(git rev-parse --show-toplevel)"
git_dir="$(git rev-parse --git-dir)"
include_path="../.gitconfig"

if [ "$git_dir" != "$repo_root/.git" ]; then
  include_path="$(realpath "$repo_root/.gitconfig")"
fi

current_include="$(git config --local --get include.path 2>/dev/null || true)"

if [ "$current_include" = "$include_path" ] || [ "$current_include" = "$(realpath "$repo_root/.gitconfig" 2>/dev/null || echo "")" ]; then
  echo "Git author config already set for this repository."
else
  git config --local include.path "$include_path"
  echo "Configured git to use $repo_root/.gitconfig for author info."
fi

git config --local --get-regexp '^user\.' || true

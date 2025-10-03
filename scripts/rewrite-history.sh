#!/usr/bin/env bash
# rewrite-history.sh
#
# Bash helper to run BFG or git-filter-repo to remove secrets from git history.
# Creates a mirror clone and operates on it. By default the script is a dry-run.

set -euo pipefail

REPO_URL=""
TOOL="bfg"
APPLY=0

usage() {
  cat <<EOF
Usage: $0 -r <repo-url> [-t bfg|git-filter-repo] [--apply]

This script expects a local replacements.txt in the working directory (DO NOT commit it).
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -r|--repo) REPO_URL="$2"; shift 2;;
    -t|--tool) TOOL="$2"; shift 2;;
    --apply) APPLY=1; shift;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1"; usage; exit 1;;
  esac
done

if [[ -z "$REPO_URL" ]]; then
  usage
  exit 1
fi

TMP_DIR=$(mktemp -d)
echo "Creating mirror clone in: $TMP_DIR"
git clone --mirror "$REPO_URL" "$TMP_DIR"
pushd "$TMP_DIR"

if [[ ! -f replacements.txt ]]; then
  echo "ERROR: replacements.txt not found in $TMP_DIR. Create it locally and do NOT commit it." >&2
  popd
  exit 1
fi

if [[ "$TOOL" == "bfg" ]]; then
  echo "Using BFG (dry-run unless --apply)"
  if [[ $APPLY -eq 1 ]]; then
    java -jar ../bfg.jar --replace-text replacements.txt
  else
    echo "DRY RUN: java -jar bfg.jar --replace-text replacements.txt"
  fi
else
  echo "Using git-filter-repo (dry-run unless --apply)"
  if [[ $APPLY -eq 1 ]]; then
    git filter-repo --replace-text replacements.txt
  else
    echo "DRY RUN: git filter-repo --replace-text replacements.txt"
  fi
fi

if [[ $APPLY -eq 1 ]]; then
  echo "Running git reflog expire and gc"
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive

  echo "Force-pushing cleaned refs"
  git push --force --all origin
  git push --force --tags origin
  echo "DONE: History rewrite applied and pushed. Inform collaborators to re-clone or reset their branches."
else
  echo "DRY RUN complete. To apply, run with --apply and ensure you have bfg.jar or git-filter-repo installed."
fi

popd

BFG / git-filter-repo history rewrite plan
=========================================

When secrets have been committed to the repository and pushed, the only safe way to remove them from history is to rewrite history and force-push the cleaned branches. This document gives two approaches: the BFG Repo Cleaner (simpler) and git-filter-repo (more flexible). Both require coordination with your team because rewriting history will change commit SHAs and require everyone to re-clone or reset their local branches.

Pre-reqs (local machine):

1. Java (for BFG) or Python (for git-filter-repo).
1. A clean local clone of the repository (don't run these commands in your working repo with uncommitted changes).
1. A copy of the secrets you want to replace (new values) stored safely — do NOT paste them into the repository.

High-level steps (common):

1. Identify the exact secrets/strings to remove. Check `ROTATE_SECRETS.md` and `render.yaml` for the env var names that were exposed (e.g., SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SPOTIFY_CLIENT_SECRET, DATABASE_URL).
1. Rotate those secrets at the provider console (Supabase, Spotify, database) so the old keys are no longer valid.
1. Run a history rewrite to remove the secret strings from all commits.
1. Force-push cleaned branches and tag references.
1. Instruct all collaborators to re-clone or to follow the recovery steps below.

Option A — BFG Repo Cleaner (fast, recommend for simple string removals)

1. Create a bare clone and mirror it locally:

```bash
git clone --mirror https://github.com/<org>/<repo>.git
cd <repo>.git
```

1. Create a `replacements.txt` file with lines of the form `OLD==>NEW` for each secret. The BFG will replace exact matches. Example (use placeholder text — do not put real secrets into the file if you plan to commit it):

```text
SUPABASE_ANON_KEY_OLD==>REDACTED_SUPABASE_ANON
SPOTIFY_CLIENT_SECRET_OLD==>REDACTED_SPOTIFY_SECRET
postgres://postgres:oldpass@...==>postgres://postgres:REDACTED@...
```

1. Run BFG to replace the secrets:

```bash
java -jar bfg.jar --replace-text replacements.txt
```

1. Run git gc and cleanup refs:

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

1. Verify the repo no longer contains the secrets (use `git grep`):

```bash
git grep -n "SUPABASE_ANON_KEY_OLD" || echo "not found"
```

1. Force-push to the remote (replace `origin` and `main` as appropriate):

```bash
git push --force --all origin
git push --force --tags origin
```

Option B — git-filter-repo (more control, recommended for complex rewrites)

1. Install git-filter-repo (Python package or system package).
2. Mirror clone (same as step 1 above) and run commands like:

Replace a literal string everywhere:

```bash
git filter-repo --replace-text replacements.txt
```

Advanced: remove files matching paths or patterns:

```bash
git filter-repo --invert-paths --paths-glob 'secrets/*.env'
```

Post-rewrite: cleanup and push (same as BFG):

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all origin
git push --force --tags origin
```

Recovery instructions for collaborators

After you force-push rewritten history, every collaborator must either:

1. Re-clone the repository fresh; OR

1. If they must keep local branches, run:

```bash
git fetch origin --prune
git checkout main
git reset --hard origin/main
git clean -fdx
```

Safety notes

1. Rotate the secrets before or immediately after the rewrite. Rotation prevents the old keys from remaining useful during the window where some clones still exist.
1. Never put real secrets into `replacements.txt` inside a repo that will be pushed. Keep that file local and delete it when done.
1. Backup your repository before running these commands.

I can prepare the exact `replacements.txt` for your repository if you list the exact exposed values (or the variable names/patterns). I will not put real secrets into the repo — I will create an example file you can use locally.

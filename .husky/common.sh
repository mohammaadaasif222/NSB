# Shared husky helper.
#
# Gates every hook on the HUSKY_ENABLED flag:
#   HUSKY_ENABLED=true   -> hooks run (this is also the default when unset)
#   HUSKY_ENABLED=false  -> hooks are skipped
#
# Resolution order: process env first, then the repo's .env file.
# So a one-off `HUSKY_ENABLED=false git commit ...` works without editing .env.
#
# Usage at the top of a hook:
#   . "$(dirname -- "$0")/common.sh"
#   husky_enabled || exit 0

husky_enabled() {
  _hook_name=$(basename -- "$0")
  _env_file="$(dirname -- "$0")/../.env"
  _value=""

  if [ -f "$_env_file" ]; then
    _value=$(sed -n 's/^[[:space:]]*HUSKY_ENABLED[[:space:]]*=[[:space:]]*//p' "$_env_file" \
      | tail -n 1 | tr -d '"'"'"' \r\t')
  fi

  # An explicitly exported value overrides whatever .env says.
  if [ -n "$HUSKY_ENABLED" ]; then
    _value="$HUSKY_ENABLED"
  fi

  case "$(echo "$_value" | tr '[:upper:]' '[:lower:]')" in
    false | 0 | no | off)
      echo "⏭️  HUSKY_ENABLED=false — skipping $_hook_name hook"
      return 1
      ;;
    *)
      return 0
      ;;
  esac
}

# Runs a binary from node_modules/.bin without going through npm or npx.
#
# npm and npx ship as `#!/usr/bin/env bash` wrappers. Git GUIs on Windows
# (VS Code, GitHub Desktop, Fork, ...) run hooks with a bundled MinGit whose
# usr/bin has no bash.exe, so the lookup falls through to the WSL relay at
# C:\Windows\System32\bash.exe and the hook dies with:
#   WSL (...) ERROR: CreateProcessCommon:818: execvpe(/bin/bash) failed
#
# The .bin shims are plain `#!/bin/sh`, which MinGit does have, so calling
# them directly is portable. Hooks must not call npm/npx for this reason.
run_bin() {
  _bin=$1
  shift
  _bin_path="$(dirname -- "$0")/../node_modules/.bin/$_bin"

  if [ ! -x "$_bin_path" ]; then
    echo "❌ $_bin not found in node_modules/.bin — run 'npm install' first."
    return 1
  fi

  "$_bin_path" "$@"
}

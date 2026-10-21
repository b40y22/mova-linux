#!/usr/bin/env bash
# Build the .deb, tag, push the tag to every remote and publish a release with the .deb attached.
#
#   packaging/release.sh 0.2.0            # real run
#   packaging/release.sh 0.2.0 --dry-run  # show what would happen, change nothing
#
# Tokens come from the environment and are never printed:
#   GITHUB_TOKEN   fine-grained, Contents: write on b40y22/mova-linux
#   FORGEJO_TOKEN  Settings -> Applications, write:repository
# A platform whose token is unset is skipped.
set -euo pipefail

VERSION="${1:?usage: release.sh <version> [--dry-run]}"
DRY="${2:-}"
TAG="v$VERSION"
PKG="gnome-shell-extension-mova-linux"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEB="$ROOT/dist/${PKG}_${VERSION}_all.deb"

GITHUB_API="https://api.github.com/repos/b40y22/mova-linux"
GITHUB_UPLOAD="https://uploads.github.com/repos/b40y22/mova-linux"
FORGEJO_API="https://forgejo.b44.pp.ua/api/v1/repos/borshch/mova-linux"

run() {
    if [[ "$DRY" == "--dry-run" ]]; then echo "[dry-run] $*"; else "$@"; fi
}

cd "$ROOT"
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "version must be X.Y.Z" >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "working tree is not clean" >&2; exit 1; }
[[ "$(git branch --show-current)" == master ]] || { echo "release from master only" >&2; exit 1; }
! git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || { echo "tag $TAG already exists" >&2; exit 1; }

./packaging/build-deb.sh "$VERSION" >/dev/null
SUM="$(sha256sum "$DEB" | cut -d' ' -f1)"

NOTES="GNOME Shell 46 extension: shows the current keyboard layout (letters or a flag) next to the mouse pointer.

Install:
\`\`\`sh
sudo apt install ./$(basename "$DEB")
\`\`\`
Then restart the shell (\`Alt+F2\`, \`r\` on X11; re-login on Wayland) and enable the extension.

sha256: \`$SUM\`"

run git tag -a "$TAG" -m "$TAG"
for remote in $(git remote); do
    run git push "$remote" master "$TAG"
done

# The token goes through a header file in a pipe, so it never shows up in `ps`.
publish() { # name api-base upload-base auth-scheme token
    local name="$1" api="$2" token="$5" body id
    if [[ -z "$token" ]]; then echo "$name: token not set, skipped"; return; fi
    body="$(jq -n --arg t "$TAG" --arg n "$TAG" --arg b "$NOTES" \
        '{tag_name:$t, name:$n, body:$b, draft:false, prerelease:false}')"
    if [[ "$DRY" == "--dry-run" ]]; then echo "[dry-run] $name: create release $TAG + upload $(basename "$DEB")"; return; fi

    id="$(curl -fsS -X POST "$api/releases" -H @<(printf 'Authorization: %s %s\n' "$4" "$token") \
        -H 'Content-Type: application/json' -d "$body" | jq -r .id)"
    if [[ "$name" == github ]]; then
        curl -fsS -X POST "$3/releases/$id/assets?name=$(basename "$DEB")" \
            -H @<(printf 'Authorization: %s %s\n' "$4" "$token") \
            -H 'Content-Type: application/vnd.debian.binary-package' --data-binary @"$DEB" >/dev/null
    else
        curl -fsS -X POST "$api/releases/$id/assets?name=$(basename "$DEB")" \
            -H @<(printf 'Authorization: %s %s\n' "$4" "$token") \
            -F "attachment=@$DEB" >/dev/null
    fi
    echo "$name: release $TAG published"
}

publish github  "$GITHUB_API" "$GITHUB_UPLOAD" Bearer "${GITHUB_TOKEN:-}"
publish forgejo "$FORGEJO_API" ""              token  "${FORGEJO_TOKEN:-}"

echo "done: $TAG sha256=$SUM"

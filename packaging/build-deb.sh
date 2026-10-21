#!/usr/bin/env bash
# Build gnome-shell-extension-mova-linux_<version>_all.deb into dist/
set -euo pipefail

VERSION="${1:-0.1.0}"
UUID="mova-linux@borshch"
PKG="gnome-shell-extension-mova-linux"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

DEST="$STAGE/usr/share/gnome-shell/extensions/$UUID"
mkdir -p "$DEST" "$STAGE/DEBIAN"

# Recompile so the shipped binary always matches the XML
glib-compile-schemas "$ROOT/$UUID/schemas"
cp -r "$ROOT/$UUID/." "$DEST/"

cat > "$STAGE/DEBIAN/control" <<CTRL
Package: $PKG
Version: $VERSION
Section: gnome
Priority: optional
Architecture: all
Depends: gnome-shell (>= 46), gnome-shell (<< 47)
Maintainer: Borshch <b40y22@proton.me>
Description: Input language badge next to the mouse pointer
 GNOME Shell extension that shows the current keyboard layout (letters or a
 flag) next to the pointer, with a tray icon to switch the display mode.
CTRL

chmod 755 "$STAGE"
find "$STAGE/usr" -type d -exec chmod 755 {} +
find "$STAGE/usr" -type f -exec chmod 644 {} +

mkdir -p "$ROOT/dist"
dpkg-deb --build --root-owner-group "$STAGE" "$ROOT/dist/${PKG}_${VERSION}_all.deb"

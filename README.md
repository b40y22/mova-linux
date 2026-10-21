# mova-linux

GNOME Shell extension that shows the current keyboard layout in a small badge next to the mouse pointer, so you always see which language you are about to type in.

- Badge shows letters (`UA`, `EN`, …) or a flag (SVG) — switch in the tray icon menu
- Event-driven: no polling, no timers
- GNOME Shell 46, X11 and Wayland

## Install

From the `.deb`:

```sh
./packaging/build-deb.sh
sudo apt install ./dist/gnome-shell-extension-mova-linux_0.1.0_all.deb
```

Then restart the shell (`Alt+F2`, `r` on X11; re-login on Wayland) and enable the extension.

## Development

```sh
glib-compile-schemas mova-linux@borshch/schemas
ln -s "$PWD/mova-linux@borshch" ~/.local/share/gnome-shell/extensions/
```

To add a flag for another layout, drop `<layout-id>.svg` (3:2) into `mova-linux@borshch/flags/`. Layouts without a flag fall back to letters.

See `NOTES.md` for verified GNOME Shell 46 API details and pitfalls.

## Authors

- Borshch
- Claude (Anthropic) — AI pair programmer

## License

MIT

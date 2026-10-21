# NOTES

## Розвідка (2026-10-21, крок 0)

- Сесія: **X11** (не Wayland), GNOME Shell 46.0. Розширення працює в обох; сигнал `position-invalidated` на Wayland ще не перевірено.
- Input sources: `us`, `ua`, `ru` (mru: `ua`, `us`, `ru`).
- Стара версія: `~/.local/share/gnome-shell/extensions/mova@borshch.com/` порожня (лише `.idea`), журнал: `Missing metadata.json`. У `enabled-extensions` були ще `mova@example.com`, `mova-ultra@example.com`, `mova-ultra-alt@example.com` (не встановлені).
- `org.gnome.shell disable-user-extensions` було `true` — GNOME ігнорує всі користувацькі розширення з `~/.local`. Виставлено `false` для розробки. Бекап: `~/dconf-org-gnome-shell.bak-2026-10-21.ini`.
- Нема `lintian`, `eslint`.

## Звірені API (gnome-shell 46.0, gitlab тег 46.0, js/ui/status/keyboard.js)

- `getInputSourceManager()`, сигнал `current-source-changed`, getter `currentSource`
- `InputSource`: `.type`, `.id`, `.shortName` (дублікати shortName отримують підрядковий індекс)
- `Meta.CursorTracker` (перевірено через gjs): сигнали `cursor-changed`, `position-invalidated`, `visibility-changed`; методи `get_pointer`, `get_pointer_visible`
- JS gnome-shell на цій системі не витягується з бінарника — читати вихідники з gitlab тегу 46.0
- ⚠️ `global.backend.get_cursor_tracker()` у 46 **не існує** (TypeError). Правильно: `Meta.CursorTracker.get_for_display(global.display)` (так робить screenshot.js 46.0)
- ⚠️ `CursorTracker.get_pointer()` у 46 (gjs) повертає `[Graphene.Point, ModifierType]` (out-param → масив): `const [p] = get_pointer(); p.x, p.y`. Без розпаковки `p.x` = undefined → `set_position(NaN)` → `clutter_actor_allocate ... isnan` у журналі, а бейдж невидимий (підтверджено через Looking Glass 2026-10-21)

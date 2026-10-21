// Layer 4: tray icon with a menu that switches the badge between letters and a flag.
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const MODES = [
    ['text', 'Літери (UA, EN…)'],
    ['flag', 'Прапор'],
];

export class Indicator {
    constructor(uuid, settings) {
        this._uuid = uuid;
        this._settings = settings;
        this._button = null;
        this._items = new Map();
        this._changedId = 0;
    }

    enable() {
        this._button = new PanelMenu.Button(0.0, 'mova-linux', false);
        this._button.add_child(new St.Icon({
            icon_name: 'input-keyboard-symbolic',
            style_class: 'system-status-icon',
        }));
        for (const [mode, title] of MODES) {
            const item = new PopupMenu.PopupMenuItem(title);
            item.connect('activate', () => this._settings.set_string('display-mode', mode));
            this._button.menu.addMenuItem(item);
            this._items.set(mode, item);
        }
        this._changedId = this._settings.connect('changed::display-mode', () => this._sync());
        this._sync();
        Main.panel.addToStatusArea(this._uuid, this._button);
    }

    disable() {
        if (this._changedId)
            this._settings.disconnect(this._changedId);
        this._changedId = 0;
        this._button?.destroy();
        this._button = null;
        this._items.clear();
    }

    _sync() {
        const current = this._settings.get_string('display-mode');
        for (const [mode, item] of this._items)
            item.setOrnament(mode === current ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
    }
}

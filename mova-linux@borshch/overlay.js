// Layer 3: display. One click-through actor on top of the stage.
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const OFFSET_X = 16;
const OFFSET_Y = 20;
const FLAG_W = 24;
const FLAG_H = 16;

export class Overlay {
    constructor(flagsDir) {
        this._flagsDir = flagsDir;
        this._box = null;
        this._label = null;
        this._flag = null;
        this._source = null;
        this._mode = 'text';
    }

    enable() {
        this._box = new St.BoxLayout({reactive: false});
        this._label = new St.Label({
            text: '',
            style: 'background-color: rgba(0,0,0,0.75); color: white; font-weight: bold; padding: 1px 5px; border-radius: 4px;',
        });
        this._flag = new St.Widget({reactive: false, width: FLAG_W, height: FLAG_H});
        this._box.add_child(this._label);
        this._box.add_child(this._flag);
        Main.uiGroup.add_child(this._box);
        Main.uiGroup.set_child_above_sibling(this._box, null);
        this._render();
    }

    disable() {
        this._box?.destroy();
        this._box = this._label = this._flag = null;
    }

    setSource(source) {
        this._source = source;
        this._render();
    }

    setMode(mode) {
        this._mode = mode;
        this._render();
    }

    moveTo(x, y) {
        this._box?.set_position(x + OFFSET_X, y + OFFSET_Y);
    }

    _render() {
        if (!this._box || !this._source)
            return;
        const file = this._flagsDir.get_child(`${this._source.id}.svg`);
        // No flag for this layout: fall back to letters rather than show nothing
        const showFlag = this._mode === 'flag' && file.query_exists(null);
        this._label.visible = !showFlag;
        this._flag.visible = showFlag;
        this._label.text = this._source.shortName;
        if (showFlag) {
            this._flag.style = `background-image: url("${file.get_uri()}"); ` +
                `background-size: ${FLAG_W}px ${FLAG_H}px; border-radius: 2px;`;
        }
    }
}

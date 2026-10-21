// Layer 3: display. One click-through actor on top of the stage.
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const OFFSET_X = 16;
const OFFSET_Y = 20;

export class Overlay {
    constructor() {
        this._label = null;
    }

    enable() {
        this._label = new St.Label({
            text: '',
            reactive: false,
            style: 'background-color: rgba(0,0,0,0.75); color: white; font-weight: bold; padding: 1px 5px; border-radius: 4px;',
        });
        Main.uiGroup.add_child(this._label);
        Main.uiGroup.set_child_above_sibling(this._label, null);
    }

    disable() {
        this._label?.destroy();
        this._label = null;
    }

    setText(text) {
        if (this._label)
            this._label.text = text;
    }

    moveTo(x, y) {
        this._label?.set_position(x + OFFSET_X, y + OFFSET_Y);
    }
}

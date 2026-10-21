// Layer 1: current input language. No polling, only the shell's own signal.
import * as Keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';

export class Source {
    constructor(onChange) {
        this._onChange = onChange;
        this._manager = null;
        this._handlerId = 0;
    }

    enable() {
        this._manager = Keyboard.getInputSourceManager();
        this._handlerId = this._manager.connect('current-source-changed', () => this._emit());
        this._emit();
    }

    disable() {
        if (this._manager && this._handlerId)
            this._manager.disconnect(this._handlerId);
        this._handlerId = 0;
        this._manager = null;
    }

    _emit() {
        try {
            const s = this._manager.currentSource;
            if (s)
                this._onChange({id: s.id, shortName: s.shortName, type: s.type});
        } catch (e) {
            console.error(`[mova-linux] source: ${e}`);
        }
    }
}

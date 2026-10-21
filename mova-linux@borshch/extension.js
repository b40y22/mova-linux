import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Source} from './source.js';
import {Pointer} from './pointer.js';
import {Overlay} from './overlay.js';

export default class MovaLinux extends Extension {
    enable() {
        this._overlay = this._start('overlay', new Overlay());
        this._source = this._start('source', new Source(s => this._overlay?.setText(s.shortName)));
        this._pointer = this._start('pointer', new Pointer((x, y) => this._overlay?.moveTo(x, y)));
    }

    disable() {
        for (const layer of [this._pointer, this._source, this._overlay]) {
            try {
                layer?.disable();
            } catch (e) {
                console.error(`[mova-linux] disable: ${e}`);
            }
        }
        this._pointer = this._source = this._overlay = null;
    }

    _start(name, layer) {
        try {
            layer.enable();
            return layer;
        } catch (e) {
            console.error(`[mova-linux] layer '${name}' failed to start: ${e}`);
            return null;
        }
    }
}

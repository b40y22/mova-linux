import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Source} from './source.js';
import {Pointer} from './pointer.js';
import {Overlay} from './overlay.js';
import {Indicator} from './indicator.js';

export default class MovaLinux extends Extension {
    enable() {
        this._settings = this.getSettings();
        const applyMode = () => this._overlay?.setMode(this._settings.get_string('display-mode'));

        this._overlay = this._start('overlay', new Overlay(this.dir.get_child('flags')));
        applyMode();
        this._modeId = this._settings.connect('changed::display-mode', applyMode);
        this._source = this._start('source', new Source(s => this._overlay?.setSource(s)));
        this._pointer = this._start('pointer', new Pointer((x, y) => this._overlay?.moveTo(x, y)));
        this._indicator = this._start('indicator', new Indicator(this.uuid, this._settings));
    }

    disable() {
        for (const layer of [this._indicator, this._pointer, this._source, this._overlay]) {
            try {
                layer?.disable();
            } catch (e) {
                console.error(`[mova-linux] disable: ${e}`);
            }
        }
        if (this._modeId)
            this._settings?.disconnect(this._modeId);
        this._modeId = 0;
        this._indicator = this._pointer = this._source = this._overlay = this._settings = null;
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

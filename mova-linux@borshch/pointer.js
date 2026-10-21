// Layer 2: pointer position. Cursor tracker signal, no idle timers.
import Meta from 'gi://Meta';

export class Pointer {
    constructor(onMove) {
        this._onMove = onMove;
        this._tracker = null;
        this._handlerId = 0;
    }

    enable() {
        this._tracker = Meta.CursorTracker.get_for_display(global.display);
        this._handlerId = this._tracker.connect('position-invalidated', () => this._emit());
        this._emit();
    }

    disable() {
        if (this._tracker && this._handlerId)
            this._tracker.disconnect(this._handlerId);
        this._handlerId = 0;
        this._tracker = null;
    }

    _emit() {
        try {
            const [x, y] = this._tracker.get_pointer();
            this._onMove(x, y);
        } catch (e) {
            console.error(`[mova-linux] pointer: ${e}`);
        }
    }
}

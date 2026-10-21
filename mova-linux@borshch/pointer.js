// Layer 2: pointer position. Stage motion events (+ tracker invalidation for warps), no idle timers.
import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';

export class Pointer {
    constructor(onMove) {
        this._onMove = onMove;
        this._tracker = null;
        this._handlerId = 0;
        this._motionId = 0;
    }

    enable() {
        this._tracker = Meta.CursorTracker.get_for_display(global.display);
        this._handlerId = this._tracker.connect('position-invalidated', () => this._emit());
        // position-invalidated fires only on warps; real motion arrives as stage events
        this._motionId = global.stage.connect('captured-event', (_actor, event) => {
            if (event.type() === Clutter.EventType.MOTION)
                this._emit();
            return Clutter.EVENT_PROPAGATE;
        });
        this._emit();
    }

    disable() {
        if (this._tracker && this._handlerId)
            this._tracker.disconnect(this._handlerId);
        if (this._motionId)
            global.stage.disconnect(this._motionId);
        this._handlerId = 0;
        this._motionId = 0;
        this._tracker = null;
    }

    _emit() {
        try {
            // GJS turns the out-param into [Graphene.Point, ModifierType]
            const [p] = this._tracker.get_pointer();
            if (Number.isFinite(p?.x) && Number.isFinite(p?.y))
                this._onMove(p.x, p.y);
        } catch (e) {
            console.error(`[mova-linux] pointer: ${e}`);
        }
    }
}

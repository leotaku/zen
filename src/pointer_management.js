import Clutter from "gi://Clutter";
import Meta from "gi://Meta";

function absolute_to_relative(x, y, rect) {
    const rel_x = (x - rect.x) / rect.width;
    const rel_y = (y - rect.y) / rect.height;

    return [rel_x, rel_y];
}

function relative_to_absolute(x, y, rect) {
    const abs_x = x * rect.width + rect.x;
    const abs_y = y * rect.height + rect.y;

    return [abs_x, abs_y];
}

export function hasPointerActually(window) {
    const [x, y, _] = global.get_pointer();
    const pointer = new Meta.Rectangle({ x, y });
    const rect = window.get_frame_rect();

    return rect.contains_rect(pointer);
}

export class PointerManager {
    static singleton;

    constructor(name, pointer_coordinates) {
        this.name = name;
        this.pointer_coordinates = pointer_coordinates;
    }

    static new(name) {
        if (!this.singleton) this.singleton = new Map();
        const pointer_coordinates = this.singleton.get(name) || new Map();
        this.singleton.set(name, pointer_coordinates);

        return new PointerManager(name, pointer_coordinates);
    }

    static ephemeral(name) {
        const pointer_coordinates = this.singleton?.get?.(name) || new Map();
        return new PointerManager(name, pointer_coordinates);
    }

    destroy() {
        if (this.singleton) {
            this.singleton.delete(this.name);

            if (this.singleton.size == 0) {
                this.singleton = null;
            }
        }
    }

    storePosition(window, x, y) {
        const rect = window.get_buffer_rect();
        const [x_rel, y_rel] = absolute_to_relative(x, y, rect);

        this.pointer_coordinates.set(window.get_id(), [x_rel, y_rel]);
    }

    retrievePosition(window) {
        const rect = window.get_buffer_rect();
        const [x_rel, y_rel] = this.pointer_coordinates.get(
            window.get_id(),
        ) || [0.5, 0.5];

        return relative_to_absolute(x_rel, y_rel, rect);
    }

    storePointer(window) {
        const [x, y, _] = global.get_pointer();
        this.storePosition(window, x, y);
    }

    restorePointer(window) {
        const seat = Clutter.get_default_backend().get_default_seat();
        const [x, y] = this.retrievePosition(window);

        seat.warp_pointer(x, y);
    }
}

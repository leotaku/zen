const { Clutter, Meta } = imports.gi;

function absolute_to_relative(x, y, rect) {
    let rel_x = (x - rect.x) / rect.width;
    let rel_y = (y - rect.y) / rect.height;

    return [rel_x, rel_y];
}

function relative_to_absolute(x, y, rect) {
    let abs_x = x * rect.width + rect.x;
    let abs_y = y * rect.height + rect.y;

    return [abs_x, abs_y];
}

function hasPointerActually(window) {
    let [x, y, _] = global.get_pointer();
    let pointer = new Meta.Rectangle({ x, y });
    let rect = window.get_frame_rect();

    return rect.contains_rect(pointer);
}

var PointerManager = class PointerManager {
    static singleton;

    constructor(name, pointer_coordinates) {
        this.name = name;
        this.pointer_coordinates = pointer_coordinates;
    }

    static new(name) {
        if (!this.singleton) this.singleton = new Map();
        let pointer_coordinates = this.singleton.get(name) || new Map();
        this.singleton.set(name, pointer_coordinates);

        return new PointerManager(name, pointer_coordinates);
    }

    static ephemeral(name) {
        let pointer_coordinates = this.singleton?.get?.(name) || new Map();
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
        let rect = window.get_buffer_rect();
        let [x_rel, y_rel] = absolute_to_relative(x, y, rect);

        this.pointer_coordinates.set(window.get_id(), [x_rel, y_rel]);
    }

    retrievePosition(window) {
        let rect = window.get_buffer_rect();
        let [x_rel, y_rel] = this.pointer_coordinates.get(window.get_id()) || [
            0.5, 0.5,
        ];

        return relative_to_absolute(x_rel, y_rel, rect);
    }

    storePointer(window) {
        let [x, y, _] = global.get_pointer();
        this.storePosition(window, x, y);
    }

    restorePointer(window) {
        let seat = Clutter.get_default_backend().get_default_seat();
        let [x, y] = this.retrievePosition(window);

        seat.warp_pointer(x, y);
    }
};

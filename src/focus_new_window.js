const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;

function focus_window(window) {
    let rect = window.get_buffer_rect();
    let seat = Clutter.get_default_backend().get_default_seat();

    seat.warp_pointer(rect.x + rect.width / 2, rect.y + rect.height / 2);
}

var Extension = class Extension {
    constructor() {
        this.settings = ExtensionUtils.getSettings();
    }

    enable() {
        this.create_signal = global.display.connect('window-created', function (_, window) {
            const type = window.get_window_type();
            if (type !== Meta.WindowType.NORMAL) {
                return;
            }

            let fn = () => focus_window(window);
            setTimeout(fn, 200);
        });
    }

    disable() {
        global.display.disconnect(this.create_signal);
    }
}

function init() {
    return new Extension();
}
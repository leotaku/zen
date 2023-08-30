const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const DirectWindowSwitch = Me.imports.direct_window_switch;
const FocusNewWindow = Me.imports.focus_new_window;

class Extension {
    constructor() {
        this.direct_window_switch = new DirectWindowSwitch.Extension()
        this.focus_new_window = new FocusNewWindow.Extension()
    }

    enable() {
        this.direct_window_switch.enable();
        this.focus_new_window.enable();
    }

    disable() {
        this.direct_window_switch.disable();
        this.focus_new_window.disable();
    }
}

function init() {
    return new Extension();
}

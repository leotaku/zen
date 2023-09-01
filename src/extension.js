const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const DirectWindowSwitch = Me.imports.direct_window_switch;
const FocusNewWindow = Me.imports.focus_new_window;

function conditionallyEnable(settings, key, extension) {
    settings.get_boolean(key) ? extension.enable() : null;

    settings.connect(`changed::${key}`, (settings, key) => {
        settings.get_boolean(key) ? extension.enable() : extension.disable();
    });
}

class Extension {
    constructor() {}

    enable() {
        this.settings = ExtensionUtils.getSettings();
        this.direct_window_switch = new DirectWindowSwitch.Extension();
        this.focus_new_window = new FocusNewWindow.Extension();

        conditionallyEnable(
            this.settings,
            "enable-direct-window-switch",
            this.direct_window_switch,
        );
        conditionallyEnable(
            this.settings,
            "enable-focus-new-window",
            this.focus_new_window,
        );
    }

    disable() {
        this.direct_window_switch.disable();
        this.focus_new_window.disable();
    }
}

function init() {
    return new Extension();
}

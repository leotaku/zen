const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const DirectWindowSwitch = Me.imports.src.direct_window_switch;
const FocusNewWindow = Me.imports.src.focus_new_window;

function conditionallyEnable(settings, key, extension) {
    settings.get_boolean(key) ? extension.enable() : null;

    settings.connect(`changed::${key}`, (settings, key) => {
        settings.get_boolean(key) ? extension.enable() : extension.disable();
    });
}

class Extension {
    constructor() {}

    /**
     * This function is called when your extension is enabled, which could be
     * done in GNOME Extensions, when you log in or when the screen is unlocked.
     *
     * This is when you should setup any UI for your extension, change existing
     * widgets, connect signals or modify GNOME Shell's behavior.
     */
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

    /**
     * This function is called when your extension is uninstalled, disabled in
     * GNOME Extensions, when you log out or when the screen locks.
     *
     * Anything you created, modified or setup in enable() MUST be undone here.
     * Not doing so is the most common reason extensions are rejected in review!
     */
    disable() {
        this.direct_window_switch.disable();
        this.focus_new_window.disable();

        this.direct_window_switch = null;
        this.focus_new_window = null;
        this.settings = null;
    }
}

/**
 * This function is called once when your extension is loaded, not enabled. This
 * is a good time to setup translations or anything else you only do once.
 *
 * You MUST NOT make any changes to GNOME Shell, connect any signals or add any
 * MainLoop sources here.
 *
 * @typedef ExtensionMeta
 * @type {object}
 * @property {object} metadata - the metadata.json file, parsed as JSON
 * @property {string} uuid - the extension UUID
 * @property {number} type - the extension type; `1` for system, `2` for user
 * @property {Gio.File} dir - the extension directory
 * @property {string} path - the extension directory path
 * @property {string} error - an error message or an empty string if no error
 * @property {boolean} hasPrefs - whether the extension has a preferences dialog
 * @property {boolean} hasUpdate - whether the extension has a pending update
 * @property {boolean} canChange - whether the extension can be enabled/disabled
 * @property {string[]} sessionModes - a list of supported session modes
 *
 * @param {ExtensionMeta} meta - An extension meta object
 * @returns {object} an object with enable() and disable() methods
 */
function init() {
    return new Extension();
}

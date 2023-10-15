import { Extension as BaseExtension } from "resource:///org/gnome/shell/extensions/extension.js";

import DirectWindowSwitch from "./src/direct_window_switch.js";
import MouseFollowsFocus from "./src/mouse_follows_focus.js";
import DBusWindowFocus from "./src/dbus_window_focus.js";

function conditionallyEnable(settings, key, extension) {
    settings.get_boolean(key) ? extension.enable() : undefined;

    settings.connect(`changed::${key}`, (settings, key) => {
        settings.get_boolean(key) ? extension.enable() : extension.disable();
    });
}

export default class Extension extends BaseExtension {
    /**
     * This function is called when your extension is enabled, which could be
     * done in GNOME Extensions, when you log in or when the screen is unlocked.
     *
     * This is when you should setup any UI for your extension, change existing
     * widgets, connect signals or modify GNOME Shell's behavior.
     */
    enable() {
        this.settings = this.getSettings();

        this.direct_window_switch = new DirectWindowSwitch(this.metadata);
        this.mouse_follows_focus = new MouseFollowsFocus(this.metadata);
        this.dbus_window_focus = new DBusWindowFocus(this.metadata);

        conditionallyEnable(
            this.settings,
            "enable-direct-window-switch",
            this.direct_window_switch,
        );
        conditionallyEnable(
            this.settings,
            "enable-mouse-follows-focus",
            this.mouse_follows_focus,
        );
        conditionallyEnable(
            this.settings,
            "enable-dbus-window-focus",
            this.dbus_window_focus,
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
        this.mouse_follows_focus.disable();
        this.dbus_window_focus.disable();

        this.direct_window_switch = null;
        this.mouse_follows_focus = null;
        this.dbus_window_focus = null;

        this.settings = null;
    }
}

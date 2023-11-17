import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import DirectWindowSwitchExtension from "./src/direct_window_switch.js";
import MouseFollowsFocusExtension from "./src/mouse_follows_focus.js";
import DBusWindowFocusExtension from "./src/dbus_window_focus.js";

function conditionallyEnable(settings, key, extension) {
    settings.get_boolean(key) ? extension.enable() : undefined;

    settings.connect(`changed::${key}`, (settings, key) => {
        settings.get_boolean(key) ? extension.enable() : extension.disable();
    });
}

export default class ZenExtension extends Extension {
    /**
     * This class is constructed once when your extension is loaded, not
     * enabled. This is a good time to setup translations or anything else you
     * only do once.
     *
     * You MUST NOT make any changes to GNOME Shell, connect any signals or add
     * any event sources here.
     *
     * @param {ExtensionMeta} metadata - An extension meta object
     */
    constructor(metadata) {
        super(metadata);
    }

    /**
     * This function is called when your extension is enabled, which could be
     * done in GNOME Extensions, when you log in or when the screen is unlocked.
     *
     * This is when you should setup any UI for your extension, change existing
     * widgets, connect signals or modify GNOME Shell's behavior.
     */
    enable() {
        this.settings = this.getSettings();

        this.direct_window_switch = new DirectWindowSwitchExtension(
            this.settings,
        );
        this.mouse_follows_focus = new MouseFollowsFocusExtension(
            this.settings,
        );
        this.dbus_window_focus = new DBusWindowFocusExtension(this.settings);

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

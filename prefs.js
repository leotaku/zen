import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import {
    ExtensionPreferences as BaseExtensionPreferences,
    gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class ExtensionPreferences extends BaseExtensionPreferences {
    /**
     * This function is called when the preferences window is first created to fill
     * the `Adw.PreferencesWindow`.
     *
     * @param {Adw.PreferencesWindow} window - The preferences window
     */
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const prefsPage = new Adw.PreferencesPage({
            name: "general",
            title: _("General"),
        });
        window.add(prefsPage);

        const group = new Adw.PreferencesGroup({
            title: _("Components"),
            description: _("Select any components you want to have enabled"),
        });
        prefsPage.add(group);

        {
            const row = new Adw.ActionRow({
                title: _("Direct window switch"),
                subtitle: _(
                    "Enables Super-TAB and Super-Shift-TAB bindings for quick window switching",
                ),
            });
            group.add(row);

            const toggle = new Gtk.Switch({
                valign: Gtk.Align.CENTER,
            });
            row.add_suffix(toggle);
            row.set_activatable_widget(toggle);

            settings.bind(
                "enable-direct-window-switch",
                toggle,
                "active",
                Gio.SettingsBindFlags.DEFAULT,
            );
        }

        {
            const row = new Adw.ActionRow({
                title: _("Mouse follows focus"),
                subtitle: _(
                    "Enables automatic teleporting of cursor to newly focused windows",
                ),
            });
            group.add(row);

            const toggle = new Gtk.Switch({
                valign: Gtk.Align.CENTER,
            });
            row.add_suffix(toggle);
            row.set_activatable_widget(toggle);

            settings.bind(
                "enable-mouse-follows-focus",
                toggle,
                "active",
                Gio.SettingsBindFlags.DEFAULT,
            );
        }

        {
            const row = new Adw.ActionRow({
                title: _("D-Bus window focus"),
                subtitle: _(
                    "Enables a D-Bus interface to predictably focus windows",
                ),
            });
            group.add(row);

            const toggle = new Gtk.Switch({
                valign: Gtk.Align.CENTER,
            });
            row.add_suffix(toggle);
            row.set_activatable_widget(toggle);

            settings.bind(
                "enable-dbus-window-focus",
                toggle,
                "active",
                Gio.SettingsBindFlags.DEFAULT,
            );
        }
    }
}

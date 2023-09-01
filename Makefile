UUID = zen@le0.gs
VERSION = 1
BUILD = _build

ifeq ($(XDG_DATA_HOME),)
XDG_DATA_HOME = $(HOME)/.local/share
endif

ifeq ($(strip $(DESTDIR)),)
INSTALLBASE = $(XDG_DATA_HOME)/gnome-shell/extensions
PLUGIN_BASE = $(XDG_DATA_HOME)/pop-shell/launcher
SCRIPTS_BASE = $(XDG_DATA_HOME)/pop-shell/scripts
else
INSTALLBASE = $(DESTDIR)/usr/share/gnome-shell/extensions
PLUGIN_BASE = $(DESTDIR)/usr/lib/pop-shell/launcher
SCRIPTS_BASE = $(DESTDIR)/usr/lib/pop-shell/scripts
endif
KEYBINDINGS_BASE = /usr/share/gnome-control-center/keybindings
INSTALLNAME = $(UUID)

$(info UUID is "$(UUID)")

sources = src/** schemas metadata.json LICENSE README.md

.PHONY: clean compile debug enable disable listen local-install
.PHONY: install uninstall restart-shell zip-file

clean:
	rm -rf $(BUILD) target

compile: $(sources) clean
	mkdir -p $(BUILD)
	cp -r $(sources) $(BUILD)
	glib-compile-schemas $(BUILD)/schemas

debug: compile install enable restart-shell listen

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

listen:
	journalctl -o cat -n 0 -f "$$(which gnome-shell)" | grep -v warning

local-install: compile install restart-shell enable

install:
	rm -rf $(INSTALLBASE)/$(INSTALLNAME)
	mkdir -p $(INSTALLBASE)/$(INSTALLNAME) $(PLUGIN_BASE) $(SCRIPTS_BASE)
	cp -r $(BUILD)/* $(INSTALLBASE)/$(INSTALLNAME)/

install-keybindings:
	cp keybindings/10-zen-direct-window-switch.xml $(KEYBINDINGS_BASE)
	chmod 0644 $(KEYBINDINGS_BASE)/10-zen-direct-window-switch.xml

uninstall-keybindings:
	rm $(KEYBINDINGS_BASE)/10-zen-direct-window-switch.xml

uninstall:
	rm -rf $(INSTALLBASE)/$(INSTALLNAME)

restart-shell:
	echo "Restart shell!"
	if bash -c 'xprop -root &> /dev/null'; then \
		pkill -HUP gnome-shell; \
		sleep 3; \
	else \
		gnome-session-quit --logout; \
	fi

zip-file: all
	cd $(BUILD) && zip -qr "../$(UUID)_$(VERSION).zip" .

.NOTPARALLEL: debug local-install

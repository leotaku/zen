UUID = zen@le0.gs
PACKFILE = $(UUID).shell-extension.zip

other = metadata.json
js = extension.js prefs.js src/*
schemas = schemas/*
pot = po/*

$(PACKFILE): $(other) $(js) $(schemas) $(pot)
	gnome-extensions pack . --extra-source=src --force

po/$(UUID).pot: $(js) $(schemas)
	xgettext --from-code=UTF-8 --output=$@ $^

.PHONY: develop install uninstall enable disable listen restart-shell

develop: $(PACKFILE) install restart-shell enable

install:
	gnome-extensions install $(PACKFILE) --force

uninstall:
	gnome-extensions uninstall $(UUID)

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

restart-shell:
	echo "Restart shell!"
	if bash -c 'xprop -root &> /dev/null'; then \
		pkill -HUP gnome-shell; \
		sleep 3; \
	else \
		gnome-session-quit --logout; \
	fi

listen:
	journalctl -o cat -n 0 -f "$$(which gnome-shell)" | grep -v warning

KEYBINDINGS_BASE = /usr/share/gnome-control-center/keybindings

.PHONY: install-keybindings uninstall-keybindings

install-keybindings: keybindings/10-zen-*.xml
	install -m 0644 -o root -g root -t $(KEYBINDINGS_BASE) $^

uninstall-keybindings: $(KEYBINDINGS_BASE)/10-zen-*.xml
	rm $^

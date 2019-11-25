const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils;
const GObject = imports.gi.GObject;

var PopupExtensionItem  = GObject.registerClass(
class PopupExtensionItem extends PopupMenu.PopupBaseMenuItem {
    _init(uuid, params) {
        super._init(params)

        this._extension = Main.extensionManager.lookup(uuid)

        this.label = new St.Label({ text: this._extension.metadata.name, x_expand: true });
        this.label_actor = this.label;
        this.add_child(this.label);

        let hbox = new St.BoxLayout({ x_align: St.Align.END });

        if (this._extension.hasPrefs) {
            let settingsIcon = new St.Icon({
                icon_name: 'emblem-system-symbolic',
                style_class: 'popup-menu-icon popup-menu-icon-extensions-settings '
            });

            let settingsButton = new St.Button({ child: settingsIcon });
            settingsButton.connect('clicked', Lang.bind(this, function() {
                Util.spawn(["gnome-shell-extension-prefs", uuid]);
                this._getTopMenu().close()
            }));
            hbox.add_child(settingsButton);
        }

        this._switch = new PopupMenu.Switch(this._extension.state == ExtensionUtils.ExtensionState.ENABLED);
        hbox.add(this._switch)

        this.add_child(hbox);

        this.connect('activate', Lang.bind(this, function(event) {
            if (this._switch.mapped) {
                this._switch.toggle();

                if (this._extension.state == ExtensionUtils.ExtensionState.ENABLED)
                    Main.extensionManager.disableExtension(this._extension.uuid)
                else
                    Main.extensionManager.enableExtension(this._extension.uuid)
            }

            // if (event.type() == Clutter.EventType.KEY_PRESS &&
            //     event.get_key_symbol() == Clutter.KEY_space)
            //     return;

            // this.parent(event);
        }));
    }
});

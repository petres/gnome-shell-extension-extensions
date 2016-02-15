const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionSystem = imports.ui.extensionSystem;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const ScrollablePopupMenu = Me.imports.scrollablePopupMenu.ScrollablePopupMenu;
const PopupExtensionItem = Me.imports.popupExtensionItem.PopupExtensionItem;

const ExtensionsManager = new Lang.Class({
    Name: 'ExtensionsManager',
    Extends: PanelMenu.Button,

    _init: function(logger) {
        PanelMenu.Button.prototype._init.call(this, St.Align.START, 'extensionsManager', true);

        this.popupMenu = new ScrollablePopupMenu(this.actor, St.Align.START, St.Side.TOP);

        this.setMenu(this.popupMenu);

        let hbox = new St.BoxLayout({style_class: 'panel-status-menu-box' });
        let icon = new St.Icon({icon_name: 'goa-panel-symbolic', style_class: 'system-status-icon'});
        hbox.add_child(icon);

        this.actor.add_actor(hbox);
        this.actor.add_style_class_name('panel-status-button');

        this.actor.connect('button-press-event', Lang.bind(this, function() {
            this._refresh();
        }));
        
        Main.panel.addToStatusArea('extensions', this);

        this.menu.bottomSection.add((new PopupMenu.PopupSeparatorMenuItem()).actor);
        
        let item = new PopupMenu.PopupMenuItem(_("Add gnome shell extensions ..."));

        item.connect('activate', Lang.bind(this, function(object, event) {
            this.menu.close()
            Gio.AppInfo.launch_default_for_uri("https://extensions.gnome.org",
                global.create_app_launch_context(event.get_time(), 0));
        }));

        this.menu.bottomSection.add(item.actor);

        this._refresh();

    },
    _refresh: function() {
        this.menu.removeAll();
        let uuids = Object.keys(ExtensionUtils.extensions)
        uuids.forEach(Lang.bind(this, function(uuid) {
            let item = new PopupExtensionItem(uuid);
            this.menu.addMenuItem(item);
        }));
        return true;
    }
});

let extensionsManager;

function enable() {
    extensionsManager = new ExtensionsManager();
}

function disable() {
    extensionsManager.destroy();
    extensionsManager = null;
}
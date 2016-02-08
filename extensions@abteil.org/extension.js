const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;

const ExtensionSystem = imports.ui.extensionSystem;
const ExtensionUtils = imports.misc.extensionUtils;

function Extensions() {
	this.button = new PanelMenu.Button(0.0);
	
	let hbox = new St.BoxLayout({style_class: 'panel-status-menu-box' });
	let icon = new St.Icon({icon_name: 'goa-panel-symbolic', style_class: 'system-status-icon'});
	hbox.add_child(icon);

	this.button.actor.add_actor(hbox);
	this.button.actor.add_style_class_name('panel-status-button');

	this.button.actor.connect('button-press-event', Lang.bind(this, function() {
		this.refresh();
	}));
	
	Main.panel.addToStatusArea('extensions', this.button);

	this.refresh();
}

Extensions.prototype = {
	refresh: function() {
		this.button.menu.removeAll();

		let uuids = Object.keys(ExtensionUtils.extensions)
		uuids.forEach(Lang.bind(this, function(uuid) {
			let extension = ExtensionUtils.extensions[uuid];
			let active = (extension.state == ExtensionSystem.ExtensionState.ENABLED)
			let item = new PopupMenu.PopupSwitchMenuItem(extension.metadata.name, active);
			this.button.menu.addMenuItem(item);
			item.connect('toggled', function() {
				if(active)
					ExtensionSystem.disableExtension(uuid)
				else
					ExtensionSystem.enableExtension(uuid)
			});
		}));

		if(uuids.length > 0)
	        this.button.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let item = new PopupMenu.PopupMenuItem(_("Add gnome shell extensions ..."));
        item.connect('activate', Lang.bind(this, function(object, event) {
            Gio.AppInfo.launch_default_for_uri("https://extensions.gnome.org",
            	global.create_app_launch_context(event.get_time(), 0));
        }));
        this.button.menu.addMenuItem(item);
        return true;
	},

	destroy: function() {
		this.button.destroy();
	}
};

function init() {
}

var extensions;

function enable() {
	extensions = new Extensions();
}

function disable() {
	extensions.destroy();
}
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('extensions');
const _ = Gettext.gettext;

const ExtensionsSettings = new GObject.Class({
    Name: 'Extensions-Settings',
    Extends: Gtk.Grid,

    _settingsInfo: {
        'position': {
                'label': _('Position'),
                'items': [
                    { 
                        id: 0, 
                        name: _("Panel") 
                    },
                    {   
                        id: 1, 
                        name: _("Menu") 
                    }
                ]
            },
        'show-add': {
                'label': _("Show 'Add ...'")
            }
    },

    _init: function(params) {
        // Gtk Grid init
        this.parent(params);
        this.set_orientation(Gtk.Orientation.VERTICAL);
        this.set_row_spacing(10);
        this.margin = 20;


        // Open settings
        this._settings = Convenience.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._loadSettings));


        // Position
        let positionLabel = new Gtk.Label({
                label:      this._settingsInfo['position']['label'] + ": ",
                xalign:     0,
                hexpand:    true
            });

        let model = new Gtk.ListStore();
        model.set_column_types([GObject.TYPE_INT, GObject.TYPE_STRING]);

        this._positionCombo = new Gtk.ComboBox({model: model});
        this._positionCombo.get_style_context().add_class(Gtk.STYLE_CLASS_RAISED);
        
        let renderer = new Gtk.CellRendererText();
        this._positionCombo.pack_start(renderer, true);
        this._positionCombo.add_attribute(renderer, 'text', 1);

        for (let i = 0; i < this._settingsInfo['position']['items'].length; i++) {
            let item = this._settingsInfo['position']['items'][i];
            let iter = model.append();
            model.set(iter, [0, 1], [item.id, item.name]);
        }

        this._positionCombo.connect('changed', Lang.bind(this, function(entry) {
            let [success, iter] = this._positionCombo.get_active_iter()
            if (success)
                this._settings.set_enum('position', this._positionCombo.get_model().get_value(iter, 0));
        }));

        this.attach(positionLabel, 1, 1, 1, 1);
        this.attach_next_to(this._positionCombo, positionLabel, 1, 1, 1);



        // Show Add
        let showAddLabel = new Gtk.Label({
                label:      this._settingsInfo['show-add']['label'] + ": ",
                xalign:     0,
                hexpand:    true
            });

        this._showAddCheckbox = new Gtk.Switch();
        this._showAddCheckbox.connect('notify::active',  Lang.bind(this, function(button) {
            this._settings.set_boolean('show-add', button.active);
        }));

        this.attach(showAddLabel, 1, 2, 1, 1);
        this.attach_next_to(this._showAddCheckbox, showAddLabel, 1, 1, 1);

        this._loadSettings();

    },
    // _saveSettings: function() {
    //     let [success, iter] = this._positionCombo.get_active_iter()
    //     if (success)
    //         this._settings.set_enum('position', this._positionCombo.get_model().get_value(iter, 0));
    // },
    _loadSettings: function() {
        this._positionCombo.set_active(this._settings.get_enum('position'))
        this._showAddCheckbox.set_active(this._settings.get_boolean('show-add'))
    },
    _refresh: function() {
        // if (!this._changedPermitted)
        //     return;

        // this._store.clear();

        // let currentItems = this._settings.get_strv("systemd");
        // let validItems = [ ];

        // for (let i = 0; i < currentItems.length; i++) {
        //     let entry = JSON.parse(currentItems[i]);
        //     // REMOVE NOT EXISTING ENTRIES
        //     if (this._availableSystemdServices["all"].indexOf(entry["service"]) < 0)
        //         continue;

        //     // COMPABILITY
        //     if(!("type" in entry))
        //         entry["type"] = this._getTypeOfService(entry["service"])

        //     validItems.push(JSON.stringify(entry));

        //     let iter = this._store.append();
        //     this._store.set(iter,
        //                     [0, 1, 2],
        //                     [entry["name"], entry["service"], entry["type"]]);
        // }

        // this._changedPermitted = false
        // this._settings.set_strv("systemd", validItems);
        // this._changedPermitted = true
    }
});

function init() {
}

function buildPrefsWidget() {
    let widget = new ExtensionsSettings();
    widget.show_all();

    return widget;
}

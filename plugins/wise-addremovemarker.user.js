// ==UserScript==
// @id             iitc-plugin-add-remove-marker@hayeswise
// @name           IITC plugin: Add and Remove Marker
// @category       Layer
// @version        1.2017.02.05
// @namespace      https://github.com/hayeswise/ingress-intel-total-conversion
// @description    Adds an Add Marker and Remove Marker map control and toolbox controls.
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @author         Hayeswise
// @grant          none
// ==/UserScript==
// MIT License, Copyright (c) 2016 Brian Hayes ("Hayeswise")
// For more information, visit https://github.com/hayeswise/iitc-addremovemarker

@@INCLUDERAW:plugins/wise-helper-required-plugins.js@@
@@INCLUDERAW:plugins/wise-helper-toolbox-control-section.js@@

/**
 * Greasemonkey/Tampermonkey information about the plugin.
 * @typedef ScriptInfo
 * @type {Object}
 * @property {String} version This is set to GM_info.script.version.
 * @property {String} name This is set to GM_info.script.name.
 * @property {String} description This is set to GM_info.script.description.
 */
/**
 * Plugin information which includes the Greasemonkey/Tampermonkey information about the plugin.
 * @typedef PluginInfo
 * @type {Object}
 * @property {ScriptInfo} script Greasemonkey/Tampermonkey information about the plugin.
 */
/**
 * Add and Remove Marker IITC plugin.  The plugin and its members can be accessed via
 * `window.plugin.addRemoveMarker`.
 * @module {function} "window.plugin.addRemoveMarker"
*/
/**
 * An object containing information about the plugin. It is provided by the IITC
 * `portalDetailsUpdated` runhook.
 * @typedef ExtendedPortalData
 * @type {Object}
 * @property {String} guid The portal's globally unique identifier.
 * @property {PortalEditingAndOptions} portal
 * @property {Object} portalData
 * @property {Object} portalDetails
 */
/**
 * @typedef PortalEditingAndOptions
 * @type {Object}
 * @property {Object} editing
 * @property {Object} options This contains the data object which a superset of the PortalData object.
 */
/**
 * Closure function for Add and Remove Marker.
 * <p>
 * Standard IITC wrapper pattern used to create the plugin's closure when
 * "installed" using `document.createElement("script".appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));`
 * @param {PluginInfo} plugin_info Plugin information object provided the standard IITC PLUGINEND code.
 */
@@PLUGINSTART@@
// PLUGIN START ////////////////////////////////////////////////////////
    window.plugin.addRemoveMarker = function () {};
	/**
	 * Add and Remove Marker namespace.  `self` is set to `window.plugin.addRemoveMarker`.
	 * @alias "window.plugin.addRemoveMarker"
     * @variation 2
	 */
    var self = window.plugin.addRemoveMarker;
    self.spacename = "addRemoveMarker";

    /**
	 * An array of objects describing the required plugins.
     * @type {RequiredPluginMetaData[]} Array of required plugin meta-data.
	 */
    self.requiredPlugins = [{
        object: window.plugin.drawTools,
        name: "draw tools"
    }];

    // Plugin level properties
    /**
      * When the extended portal details are loaded into the portal details
      * section, the `checkPortalDetailsUpdated()` run hook will save the
      * extended portal details object here.
      *
      * @type {ExtendedPortalData}
      */
    self.portalDataInPortalDetails = null;

    /**
     * Adds a layer item (e.g., a marker) to the map.  Copied from plugin.drawTools.import.
     * @name window.plugin.addRemoveMarker.addItem
     * @param item An object contain data for the layer.
     * @returns A Leaflet layer object.
     */
    self.addItem = function(item) {
        var fname = self.spacename + ".addItem";
        var layer = null;
        var extraOpt = {};
        var extraMarkerOpt = {};
        if (item.color) {extraOpt.color = item.color;}

        switch(item.type) {
            case "polyline":
                layer = L.geodesicPolyline(item.latLngs, L.extend({},window.plugin.drawTools.lineOptions,extraOpt));
                break;
            case "polygon":
                layer = L.geodesicPolygon(item.latLngs, L.extend({},window.plugin.drawTools.polygonOptions,extraOpt));
                break;
            case "circle":
                layer = L.geodesicCircle(item.latLng, item.radius, L.extend({},window.plugin.drawTools.polygonOptions,extraOpt));
                break;
            case "marker":
                if (item.color) extraMarkerOpt.icon = window.plugin.drawTools.getMarkerIcon(item.color);
                layer = L.marker(item.latLng, L.extend({},window.plugin.drawTools.markerOptions,extraMarkerOpt));
                window.registerMarkerForOMS(layer);
                break;
            default:
                console.warn('unknown layer type "'+item.type+'" when loading draw tools layer');
                break;
        }
        if (layer) {
            window.plugin.drawTools.drawnItems.addLayer(layer);
            //runHooks('pluginDrawTools', {event: 'import'});
            window.runHooks('pluginDrawTools', {
                event: 'layerCreated',
                layer: layer
            }); // Per draw-tools line #665 the map.on('draw:created', ...) function
        }

        return layer;
    };

    /**
     * Adds a portal marker (map pin) if the selected portal is not already marked.
     * @returns a Leaflet layer object corresponding to the added portal marker
     */
    self.addMarker = function () {
        var fname = self.spacename + ".addMarker";
        var isMarked,
            item,
            layer = null,
            portalDetails,
            title;
        if (!self.portalDataInPortalDetails) {
            alert("Please select a portal and wait for the portal details to be displayed before attempting to add a marker.");
            return null;
        }
        isMarked = self.isMarked(self.portalDataInPortalDetails.portalDetails);
        title = (self.portalDataInPortalDetails && self.portalDataInPortalDetails.portalDetails.title) ? self.portalDataInPortalDetails.portalDetails.title : "[NO PORTAL DATA]";
        console.log(fname + ": guid:=" + self.portalDataInPortalDetails.guid + ", title:=" + title + ", have portal details=" + !!self.portalDataInPortalDetails + ", isMarked=" + isMarked);
        if (!isMarked) {
            portalDetails = self.portalDataInPortalDetails.portalDetails;
            item = {
                type: 'marker',
                latLng: {
                    lat: portalDetails.latE6 / 1E6,
                    lng: portalDetails.lngE6 / 1E6
                },
            };
            layer = self.addItem(item);  // calls runhooks
        }
        if (layer !== null) {
            console.log(fname + ": calling window.plugin.drawTools.save();");
            window.plugin.drawTools.save();
        }
        return layer;
    };

    /**
     * Save the portal details.
     *
     * @param data Object containing the guid, portal object, portalData object, and a portalDetails object.
     */
    self.checkPortalDetailsUpdated = function (data) {
        var fname = self.spacename + ".checkPortalDetailsUpdated";
        var title;
        self.portalDataInPortalDetails = data;
        title = data.portalData.title ? data.portalData.title : "[NO PORTAL DATA FOR portalDetailsUpdated RUNHOOK]";
        console.log(fname + "(data.guid:=" + data.guid + ", data.portalData.title:=" + title + ")");
    };

    /**
     * Returns true if the portal is already marked on the map; otherwise, returns false.
     */
    self.isMarked = function (portalDetails) {
        var fname = self.spacename + ".isMarked";
        var index,
            theLayers; // Leaflet Layer[]
        theLayers = window.plugin.drawTools.drawnItems.getLayers();
        index = theLayers.findIndex(function(layer, i, array) {
            var foundMarker = false,
                item = {};
            if (layer instanceof L.Marker) {
                item.latLng = layer.getLatLng();
                //				console.log (fname + ": layer.getLatLng()=" + JSON.stringify(item.latLng) + "portalDetails.latE6=" + portalDetails.latE6 + ", portalDetails.lngE6=" + portalDetails.lngE6);
                foundMarker = ((item.latLng.lat == portalDetails.latE6 / 1E6) &&
                               (item.latLng.lng == portalDetails.lngE6 / 1E6));
                //				console.log (fname + ": foundMarker=" + foundMarker + ", layer.getLatLng()=" + JSON.stringify(item.latLng) + "portalDetails.latE6=" + portalDetails.latE6 + ", portalDetails.lngE6=" + portalDetails.lngE6);
            }
            return foundMarker;
        });
        return (index != -1);
    };

    /**
     * Removes the marker (map pin) on the portal shown in the sidebar portal details.
	 * Only one marker is removed at a time.  If for some reason multiple markers have
	 * been put at the same location, multiple removes will need to be done.
     */
    self.removeMarker = function () {
        var fname = self.spacename + ".removeMarker";
        var marker = null, //Leaflet Layer()
            portalDetails,
            title;
        // 1. Get the marker data. In this case, the poiMarker.checkPortalDetailLoaded() hook
        //    will have saved it when it was loaded into the sidebar portal details area.
        if (!self.portalDataInPortalDetails) {
            alert("Please select a portal and wait for the portal details to be displayed before attempting to remove a marker.");
            return;
        }
        title = (self.portalDataInPortalDetails && self.portalDataInPortalDetails.portalDetails.title) ? self.portalDataInPortalDetails.portalDetails.title : "[NO PORTAL DATA]";
        console.log(fname + ": guid:=" + self.portalDataInPortalDetails.guid + ", title:=" + title + ", have portal details=" + !!self.portalDataInPortalDetails);
        portalDetails = self.portalDataInPortalDetails.portalDetails;
        // 2. Find the first marker with the same latitude and longitude.
        marker = window.plugin.drawTools.drawnItems.getLayers().find (function(layer) {
            var latLng;
            if (layer instanceof L.Marker) {
                latLng = layer.getLatLng();
                return (latLng.lat == portalDetails.latE6 / 1E6) &&
                    (latLng.lng == portalDetails.lngE6 / 1E6);
            } else {
                return false;
            }
        });
        // 3. If marker found, remove the marker, save, run draw hooks, and notify the ingress planner if it's being used.
        if (marker) { // if not undefined
            console.log(fname + ": Removing marker for portal " + title);
            window.plugin.drawTools.drawnItems.removeLayer(marker);
            window.runHooks('pluginDrawTools',{event:'layersDeleted'}); // Per draw-tools line #670 in the map.on('draw:deleted', ...) function
            console.log(fname + ": calling window.plugin.drawTools.save();");
            window.plugin.drawTools.save();
        } else {
            console.log(fname + ": Portal marker not found. Portal title: " + title);
        }
    };

    /**
	 * Returns the DOM elements containing the plugin controls to be appended to the IITC toolbox.
	 * <br>
	 * Controls from other plugins with class "wise-toolbox-control" will be grouped into one subsection (same div tag).
	 * @returns {Object} Object suitable for a jQuery `append()`.
	 */
    self.getToolboxControls = function () {
        var	pluginControl,
            controlsHtml;
        controlsHtml = '<span id="addRemoveMarker-controls" style="display:block;color:#03fe03;">' +
            '<a id="addRemoveMarker-addMarker" onclick="window.plugin.addRemoveMarker.addMarker();false;" title="Click to add a portal marker.">' +
            '<i class="material-icons" style="font-size:16px;color:#ffce00;">add_location</i> Add Marker</a>&nbsp; ' +
            '<a id="addRemoveMarker-removeMarker" onclick="window.plugin.addRemoveMarker.removeMarker();false;" title="Click to remove the portal marker.">' +
            '<i class="material-icons" style="font-size:16px;color:#ffce00;-webkit-transform: rotate(180deg);-moz-transform: rotate(180deg);-ms-transform: rotate(1805deg);-o-transform: rotate(180deg);transform: rotate(180deg);">format_color_reset</i>' +
            ' Remove Marker</a>' +
            '</span>';
        pluginControl = new window.helpers.ToolboxControlSection(controlsHtml, "wise-toolbox-control-section", "wise-toolbox-control");
        pluginControl.attr("id", self.spacename + "-controls");
        pluginControl = pluginControl.mergeWithFamily();
        window.helpers.ToolboxControlSection.setStyle();
        return pluginControl;
    };

    /**
     * Setup function to be called or handled by PLUGINEND code provided IITC build script.
     * The function will be called if IITC is already loaded and, if not, saved for later execution.
     */
    self.setup = function init() {
        var fname = self.spacename + ".setup";
		console.log (fname + ": Start, version " + (!!plugin_info ? plugin_info.script.version : "unknown"));

        /**************************************************************************************************************
         * L.Control.AddRemoveMarkerControl Class
         *************************************************************************************************************/
        /**
	     * Creates a new map control for adding and removing markers.
		 * <p>
		 * Example usage:
		 * ```
		 * L.Map.mergeOptions({
		 *    AddRemoveMarkerControl: true // <== allows plugins to disable/enable the control - see L.Control.Zoomslider.js for example
		 * });
		 * window.map.addControl(L.control.AddRemoveMarkerControl());
		 * ```
		 * <p>
		 * Based on L.Control.Zoom from leaflet-src.js.
		 * @class
		 * @param {Object} [options] Optional options to configure the control.
		 */
        L.Control.AddRemoveMarkerControl = L.Control.extend({
            options: {
                position: 'topleft',
                addMarkerHtml: '<i class="material-icons" style="font-size:18px;vertical-align:middle;">add_location</i>',
                addMarkerTitle: "Add marker",
                removeMarkerHtml: '<i class="material-icons" style="font-size:18px;vertical-align:middle;-webkit-transform: rotate(180deg);-moz-transform: rotate(180deg);-ms-transform: rotate(1805deg);-o-transform: rotate(180deg);transform: rotate(180deg);">format_color_reset</i>',
                removeMarkerTitle: "Remove marker"
            },

            onAdd: function (map) {
                var controlName = 'wise-addRemoveMarker-control',
                    container = L.DomUtil.create('div', controlName + ' leaflet-bar');
                container.setAttribute("id", controlName);

                this._map = map;

                this._addMarkerButton  = this._createButton(
                    this.options.addMarkerHtml, this.options.addMarkerTitle,
                    controlName + '-add',  container, this._addMarker,  this);
                this._removeMarkerButton = this._createButton(
                    this.options.removeMarkerHtml, this.options.removeMarkerTitle,
                    controlName + '-remove', container, this._removeMarker, this);

                this._updateDisabled();
                map.on('zoomend zoomlevelschange', this._updateDisabled, this);

                return container;
            },

            onRemove: function (map) {
                map.off('zoomend zoomlevelschange', this._updateDisabled, this);
                //@todo remove listeners
                L.DomEvent.off(this._addMarkerButton, 'click', this);
                L.DomEvent.off(this._removeMarkerButton, 'click', this);
            },

            _addMarker: function (e) {
                window.plugin.addRemoveMarker.addMarker();
            },

            _removeMarker: function (e) {
                window.plugin.addRemoveMarker.removeMarker();
            },

            _createButton: function (html, title, className, container, fn, context) {
                var link = L.DomUtil.create('a', className, container);
                link.innerHTML = html;
                link.href = '#';
                link.title = title;

                var stop = L.DomEvent.stopPropagation;

                L.DomEvent
                    .on(link, 'click', stop)
                    .on(link, 'mousedown', stop)
                    .on(link, 'dblclick', stop)
                    .on(link, 'click', L.DomEvent.preventDefault)
                    .on(link, 'click', fn, context)
                    .on(link, 'click', this._refocusOnMap, context);

                return link;
            },

            _updateDisabled: function () {
                var map = this._map,
                    className = 'leaflet-disabled';
                L.DomUtil.removeClass(this._addMarkerButton, className);
                L.DomUtil.removeClass(this._removeMarkerButton, className);
            }
        });

        /**
		 * Factory for creating L.Control.AddRemoveMarkerControl control objects.
		 * @param {Object} [options] Optional options to configure the control.
		 */
        L.control.AddRemoveMarkerControl = function (options) {
            return new L.Control.AddRemoveMarkerControl(options);
        };

        ///////////////////////////////////////////////////////////////////////
        // Start
        ///////////////////////////////////////////////////////////////////////
        if (!window.helpers.prerequisitePluginsInstalled(self.requiredPlugins, plugin_info.script.name)) {
            return;
        }
        // Link to Google Material icons.
        $("head").append('<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">');
        // Standard sytling for "wise" family of toolbox controls
        $("<style>")
            .prop("type", "text/css")
            .html("div.wise-toolbox-control-section {color:#00C5FF;text-align:center;width:fit-content;border-top: 1px solid #20A8B1;border-bottom: 1px solid #20A8B1;}")
            .appendTo("head");
        // Add toolbox controls.
        $("#toolbox").append(self.getToolboxControls());
        // Add map controls
        L.Map.mergeOptions({
            addRemoveMarkerControl: true // <== allows plugins to disable/enable the control - see L.Control.Zoomslider.js for example
        });
        window.map.addControl(L.control.AddRemoveMarkerControl());
        // Add hook for portal details updated.
        window.addHook('portalDetailsUpdated', self.checkPortalDetailsUpdated);
        console.log(fname + ": Done.");
        delete self.setup; // Delete setup to ensure init can't be run again.
    };
    /*
     * Set the required setup function that is called or handled by PLUGINEND code provided IITC build script.
     * The function will be called if IITC is already loaded and, if not, saved for later execution.
     */
    var setup = self.setup;
//PLUGIN END //////////////////////////////////////////////////////////
@@PLUGINEND@@

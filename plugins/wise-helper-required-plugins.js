/**
 * Required Plugins helper.
 * @module {function} "window.helper.requiredPlugins"
 */
 ;(function () {
  "use strict";
  /**
   * Information about a plugin.  The `pluginKey` is the property name of the
   * plugin in the `window.plugin` associative array.  The `name` value is used
   * in messaging about the plugins (e.g., if it is missing).
   * @typedef PluginMetaData
   * @type {Object}
   * @property {String} pluginKey The property name of the plugin in
   *  `window.plugin`.
   * @property {String} name A title or short name of the plugin.
   * @example
   * {
   *   pluginKey: "drawTools",
   *   name: "draw tools"
   * }
   */
  // Aggregate helpers in the window.helper object
  if (typeof window.helper !== "object") {
    window.helper = {};
  }
  window.helper.requiredPlugins = {};
  /**
   * Required Plugins namespace.
   * @alias "window.helper.requiredPlugins"
   * @variation 2
   */
  var self = window.helper.requiredPlugins;
  self.spacename = "helper.requiredPlugins";
  self.version = "0.1.0";

  /**
   * Returns true if all the prerequisite plugins are installed.
   * @param {PluginMetaData[]} prerequisites An array of
   * `RequiredPluginMetaData`.
   * @returns {boolean} Returns `true` if all the prerequisite plugins are
   *  installed; otherwise, returns `false`.
   * @example
   * window.plugin.myPlugin.requiredPlugins = [{
   *   pluginKey: window.plugin.drawTools,
   *   name: "draw tools"
   * }, {
   *   pluginKey: window.plugin.myotherplugin,
   *   name: "My Other Plugin"
   * }]
   * ...
   * if (window.helper.requiredPlugins.areMissing(window.plugin.myPlugin.requiredPlugins)) {
   *    return;
   * }
   */
  self.areMissing = function (prerequisites) {
    var areMissing;
    areMissing = prerequisites.some(function (metadata) {
      return (typeof window.plugin[metadata.pluginKey] === "undefined");
    });
    return areMissing;
  };

  /**
   * Checks if the prerequisite/required plugins are installed.
   * @param {PluginMetaData[]} requiredPlugins An array of plugin meta-data on
   * the required plugins.
   * @returns {PluginMetaData[]}
   * @example
   * window.plugin.myPlugin.requiredPlugins = [{
   *   pluginKey: window.plugin.drawTools,
   *   name: "draw tools"
   * }, {
   *   pluginKey: window.plugin.myotherplugin,
   *   name: "My Other Plugin"
   * }]
   * ...
   * var missing = window.helper.requiredPlugins.missingPluginNames(window.plugin.myPlugin.requiredPlugins);
   * if (missing.length > 0) {
   *   msg = 'IITC plugin "' + pluginName + '" requires IITC plugin' + ((missing.length === 1) ? ' ' : 's ') +
   *     ((missing.length === 1) ? missing[0] : (missing.slice(0,-1).join(", ") + " and " + missing[missing.length - 1])) + '.';
   *   console.warn(msg);
   *   alert(msg);
   * }
   */
  self.missingPluginNames = function (requiredPlugins) {
    var missing = [];
    requiredPlugins.forEach(function (metadata) {
      if (metadata.pluginKey === undefined) {
        missing.push('"' + metadata.name + '"');
      }
    });
    return missing;
  };

  /**
   * Checks if the pre-requisite plugins are installed.  If one or more requisites are not installed, an alert is
   * displayed.
   * @param {RequiredPluginMetaData[]} requiredPlugins An array of plugin meta-data on the required plugins.
   * @param {string} pluginName The name of the plugin requiring the required plugins.  Recommend using
   *    `plugin_info.script.name`.
   * @returns {boolean}
   * @example
   * window.plugin.myPlugin.requiredPlugins = [{
   *   pluginKey: window.plugin.drawTools,
   *   name: "draw tools"
   * }, {
   *   pluginKey: window.plugin.myotherplugin,
   *   name: "My Other Plugin"
   * }]
   * ...
   * if (!window.helper.requiredPlugins.alertIfNotInstalled(window.plugin.myPlugin.requiredPlugins, plugin_info.script.name) {
   *    return;
   * }
   */
  self.alertIfNotInstalled = function (requiredPlugins, pluginName) {
    var missing = [],
      msg;
    missing = self.missingPluginNames(requiredPlugins);
    if (missing.length > 0) {
      msg = 'IITC plugin "' + pluginName + '" requires IITC plugin' + ((missing.length === 1) ? ' ' : 's ') +
        ((missing.length === 1) ? missing[0] : (missing.slice(0, -1).join(", ") + " and " + missing[missing.length - 1])) + '.';
      window.console.warn(msg);
      alert(msg);
    }
    return (missing.length === 0);
  };
}());

## Modules

<dl>
<dt><a href="#module_window.helper.requiredPlugins">window.helper.requiredPlugins</a> : <code>function</code></dt>
<dd><p>Required Plugins helper.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#window.helper.requiredPlugins(2)">window.helper.requiredPlugins</a></dt>
<dd><p>Required Plugins namespace.</p>
</dd>
</dl>

<a name="module_window.helper.requiredPlugins"></a>

## window.helper.requiredPlugins : <code>function</code>
Required Plugins helper.

<a name="module_window.helper.requiredPlugins..PluginMetaData"></a>

### window.helper.requiredPlugins~PluginMetaData : <code>Object</code>
Information about a plugin.  The `pluginKey` is the property name of theplugin in the `window.plugin` associative array.  The `name` value is usedin messaging about the plugins (e.g., if it is missing).

**Kind**: inner typedef of <code>[window.helper.requiredPlugins](#module_window.helper.requiredPlugins)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| pluginKey | <code>String</code> | The property name of the plugin in  `window.plugin`. |
| name | <code>String</code> | A title or short name of the plugin. |

**Example**  
```js
{  pluginKey: "drawTools",  name: "draw tools"}
```
<a name="window.helper.requiredPlugins(2)"></a>

## window.helper.requiredPlugins
Required Plugins namespace.

**Kind**: global variable  

* [window.helper.requiredPlugins](#window.helper.requiredPlugins(2))
    * [.areMissing(prerequisites)](#window.helper.requiredPlugins(2).areMissing) ⇒ <code>boolean</code>
    * [.missingPluginNames(requiredPlugins)](#window.helper.requiredPlugins(2).missingPluginNames) ⇒ <code>Array.&lt;PluginMetaData&gt;</code>
    * [.alertIfNotInstalled(requiredPlugins, pluginName)](#window.helper.requiredPlugins(2).alertIfNotInstalled) ⇒ <code>boolean</code>

<a name="window.helper.requiredPlugins(2).areMissing"></a>

### window.helper.requiredPlugins.areMissing(prerequisites) ⇒ <code>boolean</code>
Returns true if all the prerequisite plugins are installed.

**Kind**: static method of <code>[window.helper.requiredPlugins](#window.helper.requiredPlugins(2))</code>  
**Returns**: <code>boolean</code> - Returns `true` if all the prerequisite plugins are installed; otherwise, returns `false`.  

| Param | Type | Description |
| --- | --- | --- |
| prerequisites | <code>Array.&lt;PluginMetaData&gt;</code> | An array of `RequiredPluginMetaData`. |

**Example**  
```js
window.plugin.myPlugin.requiredPlugins = [{  pluginKey: window.plugin.drawTools,  name: "draw tools"}, {  pluginKey: window.plugin.myotherplugin,  name: "My Other Plugin"}]...if (window.helper.requiredPlugins.areMissing(window.plugin.myPlugin.requiredPlugins)) {   return;}
```
<a name="window.helper.requiredPlugins(2).missingPluginNames"></a>

### window.helper.requiredPlugins.missingPluginNames(requiredPlugins) ⇒ <code>Array.&lt;PluginMetaData&gt;</code>
Checks if the prerequisite/required plugins are installed.

**Kind**: static method of <code>[window.helper.requiredPlugins](#window.helper.requiredPlugins(2))</code>  

| Param | Type | Description |
| --- | --- | --- |
| requiredPlugins | <code>Array.&lt;PluginMetaData&gt;</code> | An array of plugin meta-data on the required plugins. |

**Example**  
```js
window.plugin.myPlugin.requiredPlugins = [{  pluginKey: window.plugin.drawTools,  name: "draw tools"}, {  pluginKey: window.plugin.myotherplugin,  name: "My Other Plugin"}]...var missing = window.helper.requiredPlugins.missingPluginNames(window.plugin.myPlugin.requiredPlugins);if (missing.length > 0) {  msg = 'IITC plugin "' + pluginName + '" requires IITC plugin' + ((missing.length === 1) ? ' ' : 's ') +    ((missing.length === 1) ? missing[0] : (missing.slice(0,-1).join(", ") + " and " + missing[missing.length - 1])) + '.';  console.warn(msg);  alert(msg);}
```
<a name="window.helper.requiredPlugins(2).alertIfNotInstalled"></a>

### window.helper.requiredPlugins.alertIfNotInstalled(requiredPlugins, pluginName) ⇒ <code>boolean</code>
Checks if the pre-requisite plugins are installed.  If one or more requisites are not installed, an alert isdisplayed.

**Kind**: static method of <code>[window.helper.requiredPlugins](#window.helper.requiredPlugins(2))</code>  

| Param | Type | Description |
| --- | --- | --- |
| requiredPlugins | <code>Array.&lt;RequiredPluginMetaData&gt;</code> | An array of plugin meta-data on the required plugins. |
| pluginName | <code>string</code> | The name of the plugin requiring the required plugins.  Recommend using    `plugin_info.script.name`. |

**Example**  
```js
window.plugin.myPlugin.requiredPlugins = [{  pluginKey: window.plugin.drawTools,  name: "draw tools"}, {  pluginKey: window.plugin.myotherplugin,  name: "My Other Plugin"}]...if (!window.helper.requiredPlugins.alertIfNotInstalled(window.plugin.myPlugin.requiredPlugins, plugin_info.script.name) {   return;}
```

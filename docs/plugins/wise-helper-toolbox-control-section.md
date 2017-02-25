## Modules

<dl>
<dt><a href="#module_window.helper.ToolboxControlSection">window.helper.ToolboxControlSection</a> : <code>function</code></dt>
<dd><p>Toolbox Control Section helper.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#window.helper.ToolboxControlSection(2)">window.helper.ToolboxControlSection</a></dt>
<dd><p>Toolbox Control Section namespace.</p>
</dd>
</dl>

<a name="module_window.helper.ToolboxControlSection"></a>

## window.helper.ToolboxControlSection : <code>function</code>
Toolbox Control Section helper.

<a name="window.helper.ToolboxControlSection(2)"></a>

## window.helper.ToolboxControlSection
Toolbox Control Section namespace.

**Kind**: global variable  

* [window.helper.ToolboxControlSection](#window.helper.ToolboxControlSection(2))
    * [.ToolboxControlSection](#window.helper.ToolboxControlSection(2).ToolboxControlSection)
        * [new self.ToolboxControlSection(content, controlSectionClass, [controlClass])](#new_window.helper.ToolboxControlSection(2).ToolboxControlSection_new)
    * [.ToolboxControlSection#attr()](#window.helper.ToolboxControlSection(2).ToolboxControlSection+attr) ⇒ <code>String</code>
    * [.ToolboxControlSection#mergeWithFamily()](#window.helper.ToolboxControlSection(2).ToolboxControlSection+mergeWithFamily)
    * [.ToolboxControlSection#setStyle([styling])](#window.helper.ToolboxControlSection(2).ToolboxControlSection+setStyle)
    * [.ToolboxControlSection#valueOf()](#window.helper.ToolboxControlSection(2).ToolboxControlSection+valueOf) ⇒ <code>Object</code>

<a name="window.helper.ToolboxControlSection(2).ToolboxControlSection"></a>

### window.helper.ToolboxControlSection.ToolboxControlSection
**Kind**: static class of <code>[window.helper.ToolboxControlSection](#window.helper.ToolboxControlSection(2))</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaultStyle | <code>String</code> | Global CSS for the toolbox control section.  Set  using `setStyle()`. |
| style | <code>String</code> | Global CSS for the toolbox control section.  Set  using `setStyle()`. |

<a name="new_window.helper.ToolboxControlSection(2).ToolboxControlSection_new"></a>

#### new self.ToolboxControlSection(content, controlSectionClass, [controlClass])
Creates a new ToolboxControlSection.


| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> &#124; <code>Element</code> &#124; <code>Text</code> &#124; <code>Array</code> &#124; <code>jQuery</code> | A object suitable for passing to `jQuery.append()`: a 	DOM element, text node, array of elements and text nodes, HTML string, or jQuery object to insert at the end of 	each element in the set of matched elements. |
| controlSectionClass | <code>String</code> | The class name for a section of controls, typically in a `div` tag. |
| [controlClass] | <code>String</code> | An optional class name of a simple control or collection of controls. |

<a name="window.helper.ToolboxControlSection(2).ToolboxControlSection+attr"></a>

### window.helper.ToolboxControlSection.ToolboxControlSection#attr() ⇒ <code>String</code>
See jQuery `.attr()` function.

**Kind**: static method of <code>[window.helper.ToolboxControlSection](#window.helper.ToolboxControlSection(2))</code>  
**Todo**

- [ ] Consider removing this.

<a name="window.helper.ToolboxControlSection(2).ToolboxControlSection+mergeWithFamily"></a>

### window.helper.ToolboxControlSection.ToolboxControlSection#mergeWithFamily()
Appends toolbox controls with the same toolbox control section class and toolbox control class.<p>Merge```<div class="myControlFamily">   ...this control...</div>```with```<div class="myControlFamily">   ...other control...</div>```to get```<div class="myControlFamily">   ...this control...   ...other control...</div>```

**Kind**: static method of <code>[window.helper.ToolboxControlSection](#window.helper.ToolboxControlSection(2))</code>  
<a name="window.helper.ToolboxControlSection(2).ToolboxControlSection+setStyle"></a>

### window.helper.ToolboxControlSection.ToolboxControlSection#setStyle([styling])
Sets the documents's styling.  Will not add the style if previously used.

**Kind**: static method of <code>[window.helper.ToolboxControlSection](#window.helper.ToolboxControlSection(2))</code>  

| Param | Type | Description |
| --- | --- | --- |
| [styling] | <code>String</code> | CSS styles. |

<a name="window.helper.ToolboxControlSection(2).ToolboxControlSection+valueOf"></a>

### window.helper.ToolboxControlSection.ToolboxControlSection#valueOf() ⇒ <code>Object</code>
Override valueOf so that we get the desired behavior of getting the jQuery object when we access an objectdirectly.

**Kind**: static method of <code>[window.helper.ToolboxControlSection](#window.helper.ToolboxControlSection(2))</code>  
**Returns**: <code>Object</code> - jQuery object.  
**Example**  
```js
$("#toolbox").append(new ToolboxControlSection(html, "myfamily-control-section", "myfamily-control").mergeWithFamily();
```

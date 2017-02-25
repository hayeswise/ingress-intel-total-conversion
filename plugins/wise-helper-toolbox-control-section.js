/**
 * Toolbox Control Section helper.
 * @module {function} "window.helper.ToolboxControlSection"
 */
;(function () {
  "use strict";
  // Aggregate helpers in the window.helper object
  if (typeof window.helper !== "function") {
    window.helper = function () {};
  }
  /**
   * Toolbox Control Section namespace.
   * @alias "window.helper.ToolboxControlSection"
   * @variation 2
   */
  var self = window.helper.ToolboxControlSection;
  self.version = "0.1.0";

  /**
   * ToolboxControlSection Class.  Provides a standardized way of adding toolbox controls and grouping controls in
   * the same "family".
   */
  /**
   * Creates a new ToolboxControlSection.
   *
   * @class
   * @param {String|Element|Text|Array|jQuery} content A object suitable for passing to `jQuery.append()`: a
   * 	DOM element, text node, array of elements and text nodes, HTML string, or jQuery object to insert at the end of
   *	each element in the set of matched elements.
   * @param {String} controlSectionClass The class name for a section of controls, typically in a `div` tag.
   * @param {String} [controlClass] An optional class name of a simple control or collection of controls.
   * @property {String} defaultStyle Global CSS for the toolbox control section.  Set
   *  using `setStyle()`.
   * @property {String} style Global CSS for the toolbox control section.  Set
   *  using `setStyle()`.
   */
  self.ToolboxControlSection = function (content, controlSectionClass, controlClass) {
    this.controlSectionClass = controlSectionClass;
    this.controlClass = controlClass;
    this.merged = false;
    this.jQueryObj = jQuery('<div>').append(content).addClass(controlSectionClass);
  };

  // Default style
  self.ToolboxControlSection.defaultStyle = "div.wise-toolbox-control-section {color:#00C5FF;text-align:center;width:fit-content;border-top: 1px solid #20A8B1;border-bottom: 1px solid #20A8B1;}";
  self.ToolboxControlSection.style = undefined;
  /**
   * See jQuery `.attr()` function.
   *
   * @returns {String}
   * @todo Consider removing this.
   */
  self.ToolboxControlSection.prototype.attr = function (attributeNameOrAttributes, valueOrFunction) {
    if (typeof valueOrFunction === 'undefined') {
      return this.jQueryObj.attr(attributeNameOrAttributes);
    } else {
      return this.jQueryObj.attr(attributeNameOrAttributes, valueOrFunction);
    }
  };

  /**
   * Appends toolbox controls with the same toolbox control section class and toolbox control class.
   * <p>
   * Merge
   * ```
   * <div class="myControlFamily">
   *    ...this control...
   * </div>
   * ```
   * with
   * ```
   * <div class="myControlFamily">
   *    ...other control...
   * </div>
   * ```
   * to get
   * ```
   * <div class="myControlFamily">
   *    ...this control...
   *    ...other control...
   * </div>
   * ```
   */
  self.ToolboxControlSection.prototype.mergeWithFamily = function () {
    var controlFamily,
      that;
    if (!this.merged) {
      that = this;
      controlFamily = jQuery('.' + this.controlSectionClass);
      if (controlFamily.length > 0) {
        controlFamily.each(function () {
          var jQobj = jQuery(this);
          jQobj.css("border-style", "none");
          that.jQueryObj.append(jQobj.removeClass(that.controlSectionClass).addClass(that.controlSectionClass + "-moved")); // remove oringal section so any subsequent merges have a single control section to deal with
        });
        this.merged = true;
      }
      if (typeof this.controlClass !== 'undefined') {
        controlFamily = jQuery(':not(.' + this.controlSectionClass + ') .' + this.controlClass);
        if (controlFamily.length > 0) {
          controlFamily.each(function () {
            that.jQueryObj.append(jQuery(this));
          });
          this.merged = true;
        }
      }
    }
    return this.jQueryObj;
  };

  /**
   * Sets the documents's styling.  Will not add the style if previously used.
   * @param {String} [styling] CSS styles.
   */
  self.ToolboxControlSection.prototype.setStyle = function (styling) {
    if (typeof styling === "undefined") {
      styling = helpers.ToolboxControlSection.defaultStyle;
    }
    if (typeof helpers.ToolboxControlSection.style === 'undefined' || (helpers.ToolboxControlSection.style !== styling)) {
      helpers.ToolboxControlSection.style = styling;
      jQuery("<style>")
        .prop("type", "text/css")
        .html(styling)
        .appendTo("head");
    }
  };

  /**
   * Override valueOf so that we get the desired behavior of getting the jQuery object when we access an object
   * directly.
   * @returns {Object} jQuery object.
   * @example
   * $("#toolbox").append(new ToolboxControlSection(html, "myfamily-control-section", "myfamily-control").mergeWithFamily();
   */
  self.ToolboxControlSection.prototype.valueOf = function () {
    return this.jQueryObj;
  };
}());

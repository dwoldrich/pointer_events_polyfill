/*!
 * Pointer Events Polyfill: Adds support for the style attribute "pointer-events: none" to browsers without this feature (namely, IE).
 * (c) 2013, Kent Mewhort, licensed under BSD. See LICENSE.txt for details.
 *
 * Modifications for clicks on LABEL tags associated with radios or checkboxes where simulated event triggers do not 
 * bubble to their corresponding input fields when the events are $.delegate'd on IE9
 */

(function($) {
  "use strict";

  // constructor
  var PointerEventsPolyfill = function(options) {
    // set defaults
    this.options = {
      selector: "*",
      mouseEvents: ["click","dblclick","mousedown","mouseup"],
      usePolyfillIf: function() {
        if(navigator.appName === "Microsoft Internet Explorer") {
          var agent = navigator.userAgent;
          if (agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/)) {
            var version = parseFloat( RegExp.$1 );
            if(version < 11) {
              return true;
            }
          }
        }
        return false;
      }
    };

    if(options) {
      var self = this;
      $.each(options, function(k, v) {
        self.options[k] = v;
      });
    }

    if(this.options.usePolyfillIf()) {
      this.register_mouse_events();
    }
  };

  // singleton initializer
  PointerEventsPolyfill.initialize = function(options){
    if(!PointerEventsPolyfill.singleton) {
      PointerEventsPolyfill.singleton = new PointerEventsPolyfill(options);
    }
    return PointerEventsPolyfill.singleton;
  };

  // handle mouse events w/ support for pointer-events: none
  PointerEventsPolyfill.prototype.register_mouse_events = function() {
    // register on all elements (and all future elements) matching the selector
    $(document).on(this.options.mouseEvents.join(" "), this.options.selector, function(e) {
      var origDisplayAttribute,
        underneathElem,
        $target,
        $nestedInput,
        idAttr;

      if($(this).css("pointer-events") === "none") {
        // peek at the element below
        origDisplayAttribute = $(this).css("display");
        $(this).css("display","none");

        underneathElem = document.elementFromPoint(e.clientX, e.clientY);

        // restore the previous css display attribute of the event target element
        if(origDisplayAttribute) {
          $(this).css("display", origDisplayAttribute);
        } else {
          $(this).css("display","");
        }

        // Assume the intended target was the underneathElem
        $target = $(underneathElem);

        // clicks on labels are special, resolve the INPUT tag it relates to if possible and make that the target
        if($target.prop("tagName") === "LABEL") {
          if((idAttr = $target.attr("id"))) {
            $target = $("#" + idAttr);
          } else {
            $nestedInput = $target.find("input");
            if($nestedInput.length > 0) {
              $target = $nestedInput.first();
            }
          }
        }

        // trigger a synthesized mouse event on the element below
        var newEvent = $.extend(new $.Event(e.type), {
          which: (typeof e.which !== "undefined") ? e.which : 1,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY
        });

        $target.trigger(newEvent);

        return false;
      }
      return true;
    });
  };

  // global exports
  window.PointerEventsPolyfill = PointerEventsPolyfill;

})(window.jQuery);

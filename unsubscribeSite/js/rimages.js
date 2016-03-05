(function($) {

  $.rimages = {
    $els: $('[data-rimage]'),
    breakpoints: {},

    init: function() {
      $.rimages.$body = $('body');
      $.rimages.scrollbarWidth = $.rimages.getScrollbarWidth();

      if (!$.rimages.$els[0]) {
        return;
      }
      $.rimages.pixelRatio = window.devicePixelRatio;
      $.rimages.$els.each(function() {
        var elData = $(this).data();
        for (var key in elData) {
          var isSrc = /^src/.test(key);
          var is2x = /at2x$/.test(key);
          var baseKey = key.replace('at2x', '');
          var has2x = $(this).data(key + 'at2x');
          var width = /\d+/.exec(baseKey);
          width = width ? parseInt(width[0]) : null;
          var shouldAdd = false;
          var add2x = false;
          var isNotApplicable = !isSrc || ($.rimages.pixelRatio !== 2 && is2x) || ($.rimages.pixelRatio === 2 && !is2x && has2x);

          if (!isNotApplicable) {
            $.rimages.addToBreakpoint(baseKey, width, elData[key], this);
          }
        }
      });

      $(window).on('resize', $.rimages.setPerWindowWidth);
      $.rimages.setPerWindowWidth();
    },

    getScrollbarWidth: function() {
      $.rimages.$body = $('body');
      var overflow = $.rimages.$body.css('overflow');
      $.rimages.$body.css({
        'overflow': 'hidden'
      });
      var widthWithoutScrollbar = $.rimages.$body.outerWidth();
      $.rimages.$body.css({
        'overflow': 'scroll',
        'height': '10000px'
      });
      var widthWithScrollbar = $.rimages.$body.outerWidth();
      $.rimages.$body.removeAttr('style');
      return widthWithoutScrollbar - widthWithScrollbar;
    },

    addToBreakpoint: function(breakpointId, width, src, el) {
      if (!$.rimages.breakpoints[breakpointId]) {
        $.rimages.breakpoints[breakpointId] = {
          max: /^srcmax/.test(breakpointId),
          width: width,
          els: []
        };
      }
      $.rimages.breakpoints[breakpointId].els.push({$el: $(el), src: src});
    },

    set: function(breakpointId) {
      var images = $.rimages.breakpoints[breakpointId]['els'];
      for (var i = 0; i < images.length; i++) {
        var image = images[i];
        var $image = images[i].$el;
        if ($image.data('currentBreakpointId') !== breakpointId) {
          $image.attr('src', image['src']);
        }
        $image.data('currentBreakpointId', breakpointId);
      }
    },

    setPerWindowWidth: function() {
      var windowWidth = $(window).width();
      var windowHeight = $(window).height();
      var bodyHeight = $.rimages.$body.height();
      var breakpointsToApply = [];
      var maxBreakpointToApply;
      var minBreakpointToApply;
      var maxBreakpointWidth = Infinity;
      var minBreakpointWidth = -Infinity;

      if (bodyHeight > windowHeight) {
        windowWidth += $.rimages.scrollbarWidth;
      }

      for (var breakpointId in $.rimages.breakpoints) {
        var breakpoint = $.rimages.breakpoints[breakpointId];

        // check max
        if (breakpoint['max'] && breakpoint['width'] >= windowWidth && breakpoint['width'] < maxBreakpointWidth) {
          maxBreakpointToApply = breakpointId;
          maxBreakpointWidth = breakpoint['width'];
        }

        // check min
        if (!breakpoint['max'] && breakpoint['width'] >= windowWidth && breakpoint['width'] < minBreakpointWidth) {
          minBreakpointToApply = breakpointId;
          minBreakpointWidth = breakpoint['width'];
        }
      }

      if (!maxBreakpointToApply && !minBreakpointToApply) {
        $.rimages.set('src');
      }

      if (maxBreakpointToApply) {
        $.rimages.set(maxBreakpointToApply);
      }

      if (minBreakpointToApply) {
        $.rimages.set(minBreakpointToApply);
      }
    }
  };

  $.rimages.init();

})(jQuery);
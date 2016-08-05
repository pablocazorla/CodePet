// Basic
S = {};
Pandora = {
	init: function(context, callback) {
		var ctx = (typeof context === 'string') ? context + ' ' : '';
		// Store
		S.$window = Pandora.$window = $(window);
		S.$body = $('body');

		// Utils
		var getPrefix = (function() {
			var dummyStyles = document.createElement('div').style,
				cache = {};
			return function(str) {
				if (cache[str] !== undefined) {
					return cache[str];
				} else {
					var STR = str.substring(0, 1).toUpperCase() + str.substring(1),
						prefixes = 'Webkit Moz O Ms webkit moz o ms'.split(' '),
						l = prefixes.length,
						t;

					for (var i = 0; i < l; i++) {
						if (dummyStyles[prefixes[i] + STR] !== undefined) {
							t = prefixes[i] + STR;
						}
					}
					if (dummyStyles[str] !== undefined) {
						t = str;
					}
					cache[str] = t;
					return t;
				}
			}
		})();
		var css3 = function(prop, $elements, p) {
			var t = getPrefix(prop),
				prop = p || '';
			$elements.each(function() {
				this.style[t] = prop;
			});
		};

		Pandora.cssTransition = function($elements, p) {
			css3('transition',$elements, p);
			return Pandora;
		};
		Pandora.cssTransform = function($elements, p) {
			css3('transform',$elements, p);
			return Pandora;
		};

		// Init
		for (var a in Pandora) {
			if (typeof Pandora[a].init === 'function') {
				Pandora[a].init(ctx);
			}
		}
		if (typeof callback === 'function') {
			callback();
		}
	}
};
// Validations
Pandora.dropdown = {
	init: function(ctx) {		
		// for selects
		$(ctx + 'select.dropdown').each(function() {
			var $select = $(this).removeClass('dropdown').hide(),
				$options = $select.find('option'),
				triangleHtml = ' <span class="triangle"></span>',
				$dropdown = $('<span class="dropdown extended"></span>'),
				$toggle = $('<a class="btn btn-primary dropdown-toggle" href="javascript:void(0);"></a>').html($options.filter(':selected').text() + triangleHtml).appendTo($dropdown),

				$menu = $('<span class="dropdown-menu"></span>').appendTo($dropdown),
				arrayLinks = [];

			for (var i = 0; i < $options.length; i++) {
				$('<span><a href="">' + $options.eq(i).text() + '</a></span>').appendTo($menu);
			};
			$select.after($dropdown);

			$menu.find('a').each(function(index) {
				var $a = $(this),
					$o = $options.eq(index);
				$a.click(function(e) {
					e.preventDefault();
					$o.prop('selected', true);
					$toggle.html($a.text() + triangleHtml).blur();
				});
			});
		});
		//dropdowns
		$(ctx + '.dropdown').not('.disabled').each(function() {
			var $this = $(this),
				$toggle = $this.find('> .dropdown-toggle'),
				$menu = $this.find('> .dropdown-menu'),
				active = false,
				clickInside = false,
				fading = false,
				duration = 100;
			$toggle.click(function() {
				if (!active && !fading) {
					$menu.fadeIn(duration, function() {
						active = true;
						fading = false;
						clickInside = false;
					});
				}
				clickInside = true;
			})
			.click(function(e) {
				e.preventDefault();
			});
			$this.find('.disabled').click(function(e) {
				e.preventDefault();				
			}).mousedown(function() {
				clickInside = true;
			});
			S.$window.mousedown(function() {
				if (active && !clickInside && !fading) {
					fading = true;
					$menu.fadeOut(duration, function() {
						active = false;
						fading = false;
					});
				}
				clickInside = false;
			});
		});
	}
};
Pandora.tabs = {
	init: function(ctx) {
		$(ctx + '.tabs').each(function() {
			var $list = $(this).find('.tab-list > li'),
				$content = $(this).find('.tab-content > li');

			$list.eq(0).addClass('active');
			$content.eq(0).addClass('active');

			$list.each(function(index) {
				var $this = $(this);
				$this.click(function() {
					if (!$this.hasClass('active')) {
						$list.removeClass('active');
						$this.addClass('active');
						$content.removeClass('active').eq(index).addClass('active');
					}
				});
			});
		});
	}
};

// jQuery('document').ready(Pandora.init);
/* Float
 * @author: Pablo Cazorla
 * @e-mail: pablo.david.cazorla@gmail.com
 * @date: 29/07/2016
 */
(function($) {
	$.fn.tooltip = function(options) {

		//Settings
		var setting = $.extend({
			offsetLeft: 0,
			offsetTop: 0,
			parent: ''
		}, options);

		return this.each(function() {

			// Store
			var self = this,
				$self = $(this).addClass('ready'),
				rect, left, top,
				sett = $.extend({
					offsetLeft: 0,
					offsetTop: 0,
					parent: ''
				}, setting);


			var data = $self.attr('data-tooltip');
			if (data !== undefined) {
				var dataSet = {};
				var dataArray = data.split(','),
					dataArrayLength = dataArray.length;
				for (var i = 0; i < dataArrayLength; i++) {
					var arr = dataArray[i].split(':'),
						prop = $.trim(arr[0]),
						val = $.trim(arr[1]),
						valNum = parseFloat(val);
					if (!isNaN(valNum)) {
						val = valNum;
					}
					dataSet[prop] = val;
				}
				sett = $.extend(sett, dataSet);
			};

			// Title
			var title = $self.attr('title');
			$self.attr('title', '');
			if (typeof title == 'undefined' || title == '') {
				title = 'Put some "title".';
			}

			// Class Position
			var classPosition = '',
				toBottom = false;
			if ($self.hasClass('to-bottom')) {
				classPosition = ' to-bottom';
				toBottom = true;
			}
			if ($self.hasClass('to-left')) {
				classPosition += ' to-left';
			}
			if ($self.hasClass('to-right')) {
				classPosition += ' to-right';
			}
			// Class Color
			var classColor = '';
			if ($self.hasClass('to-light')) {
				classColor = ' to-light';
			}

			// HTML Content
			var htmlTooltip = '<div class="float' + classPosition + classColor + '">';
			htmlTooltip += '<div class="ttip">' + title;
			htmlTooltip += '<span class="triang"></span>';
			htmlTooltip += '</div>';
			htmlTooltip += '</div>';
			var $tootltip = $(htmlTooltip).appendTo('body');

			// Show and Hide
			var show = function() {
					rect = self.getBoundingClientRect();
					left = Math.round(rect.left + (0.5 * $self.outerWidth()) + sett.offsetLeft);
					top = Math.round(rect.top + sett.offsetTop);
					if (toBottom) {
						top += $self.outerHeight();
					}
					$tootltip.css({
						'left': left + 'px',
						'top': top + 'px'
					}).addClass('show');
				},
				hide = function() {
					$tootltip.removeClass('show');
				};

			// Execute
			if (sett.parent !== '') {
				$self.parents(sett.parent).hover(show, hide).click(hide);
			} else {
				$self.hover(show, hide).click(hide);
			}
		});
	};

	$.fn.popup = function(options) {
		//Settings
		var setting = $.extend({
			offsetLeft: 0,
			offsetTop: 0,
			id: '',
			classClose: '',
			hideOnClickOver: true
		}, options);

		return this.each(function() {

			// Store
			var self = this,
				$self = $(this).addClass('ready-popup'),
				rect, left, top,
				sett = $.extend({
					offsetLeft: 0,
					offsetTop: 0,
					id: '',
					classClose: '',
					hideOnClickOver: true
				}, setting);

			var data = $self.attr('data-popup');
			if (data !== undefined) {
				var dataSet = {};
				var dataArray = data.split(','),
					dataArrayLength = dataArray.length;
				for (var i = 0; i < dataArrayLength; i++) {
					var arr = dataArray[i].split(':'),
						prop = $.trim(arr[0]),
						val = $.trim(arr[1]),
						valNum = parseFloat(val);
					if (!isNaN(valNum)) {
						val = valNum;
					}
					if (val === 'true') {
						val = true;
					}
					if (val === 'false') {
						val = false;
					}
					dataSet[prop] = val;
				}
				sett = $.extend(sett, dataSet);
			};

			// HTML Content
			var $popup = $('#' + sett.id);

			// Class Position
			var classPosition = '',
				toBottom = false;
			if ($self.hasClass('to-bottom-popup')) {
				$popup.addClass('to-bottom');
				toBottom = true;
			}
			if ($self.hasClass('to-left-popup')) {
				$popup.addClass('to-left');
			}
			if ($self.hasClass('to-right-popup')) {
				$popup.addClass('to-right');
			}


			// Show and Hide
			var show = function() {
					rect = self.getBoundingClientRect();
					left = Math.round(rect.left + (0.5 * $self.outerWidth()) + sett.offsetLeft);
					top = Math.round(rect.top + sett.offsetTop);

					if (toBottom) {
						top += $self.outerHeight();
					}
					$popup.css({
						'left': left + 'px',
						'top': top + 'px'
					}).addClass('show');
				},
				hide = function() {
					$popup.removeClass('show');
				};

			var clickOverSelf = false,
				shown = false;
			$self.click(function(e) {
				e.preventDefault();
				if (!shown) {
					show();
					shown = true;
				} else {
					hide();
					shown = false;
				}
				clickOverSelf = true;
			});

			if (!sett.hideOnClickOver) {
				$popup.click(function() {
					clickOverSelf = true;
				});
			}

			if (sett.classClose !== '') {
				$('.' + sett.classClose).click(function() {
					if (shown) {
						hide();
						shown = false;
						clickOverSelf = false;
					}
				});
			}

			$(window).click(function() {
				if (!clickOverSelf && shown) {
					hide();
					shown = false;
				}
				clickOverSelf = false;
			});

		});
	};



})(jQuery);
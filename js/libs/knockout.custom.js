;(function() {
	"use strict";
	// Custom knockoutjs bindings
	ko.bindingHandlers.keyEnterPressed = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var callback = valueAccessor();
			$(element).keypress(function(event) {
				var keyCode = (event.which ? event.which : event.keyCode);
				if (keyCode === 13) {
					callback.call(viewModel);
					return false;
				}
				return true;
			});
		}
	};
	ko.bindingHandlers.slideVisible = {
		init: function(element, valueAccessor) {
			jQuery(element).hide();
		},
		update: function(element, valueAccessor) {
			var shouldDisplay = ko.unwrap(valueAccessor());
			shouldDisplay ? jQuery(element).slideDown(250) : jQuery(element).slideUp(200);
		}
	};
	ko.bindingHandlers.fadeVisible = {
		init: function(element, valueAccessor) {
			jQuery(element).hide();
		},
		update: function(element, valueAccessor) {
			var shouldDisplay = ko.unwrap(valueAccessor());
			shouldDisplay ? jQuery(element).fadeIn() : jQuery(element).fadeOut(150);
		}
	};
})();
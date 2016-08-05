jQuery('document').ready(function() {
	"use strict";
	if (window.SnippetApp) {
		// Apply Bindings
		for (var a in SnippetApp) {
			//ko.applyBindings(SnippetApp[a], document.getElementById(SnippetApp[a].DOMbindingId));
			if (SnippetApp[a].init) {
				SnippetApp[a].init();
			}
		}
		window.SnippetApp.updateScroll();

		var timeToStart = setInterval(function() {
			if (
				SnippetApp.preferencesVM.onReady() > 0 &&
				SnippetApp.tbs.onReady() > 0 &&
				SnippetApp.allSnippetsListVM.onReady() > 0 &&
				SnippetApp.snippetListVM.onReady() > 0 &&
				SnippetApp.tagListVM.onReady() > 0 &&
				SnippetApp.snippetVM.onReady() > 0
			) {
				clearInterval(timeToStart);
				timeToStart = null;
				jQuery('#loading-start').fadeOut(400,function(){
					jQuery('#loading-dimmer').fadeOut(500);
				});
			}
		}, 600);

		jQuery('#preferences-link').click(function(){
			window.SnippetApp.preferencesVM.show();			
		});
		jQuery('#logout-link').click(function(){
			jQuery('#loading-dimmer').fadeIn(400,function(){
				window.SnippetApp.logout();
			});			
		});
	};


});
jQuery('document').ready(function() {
	"use strict";

		// Apply Bindings
		for (var a in CodePet) {
			if (CodePet[a].init) {
				CodePet[a].init();
			}
		}



});
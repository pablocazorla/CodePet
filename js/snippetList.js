(function() {
	"use strict";

	/* PRIVATE VIEWMODELS ***********************************************/

	/**
	 * Individual snippet Viewmodel
	 * @constructor
	 * @return {object} snippetVM
	 */
	var snippetVM = function(data) {

		/* VM TO RETURN ***********************************************/
		var vm = {
			_id: data._id,
			order:data.order,
			title: ko.observable(data.title),
			description: ko.observable(data.description),
			current: ko.observable(false),
			shown: ko.observable(true)
		};

		/* COMPUTED VARIABLES ***********************************************/

		/**
		 * TShort text for title
		 * @function
		 * @return string
		 */
		vm.titleFormatted = ko.computed(function() {
			var length = vm.title().length,
				max = 32;
			if (length > max) {
				return vm.title().substring(0, (max - 3)) + '...';
			} else {
				if (length == 0) {
					return 'Untitled';
				} else {
					return vm.title();
				}
			}
		});
		/**
		 * TShort text for description
		 * @function
		 * @return string
		 */
		vm.descriptionFormatted = ko.computed(function() {
			var length = vm.description().length,
				max = 40;
			if (length > max) {
				return vm.description().substring(0, (max - 3)) + '...';
			} else {
				if (length === 0) {
					return 'Not described yet';
				} else {
					return vm.description();
				}
			}
		});

		/* METHODS ***********************************************/

		/**
		 * Set current Snippet
		 * @function
		 */
		vm.setCurrent = function() {
			if (!vm.current()) {
				CodePet.snippetListVM.current(vm._id);
				// Load Snippet
				CodePet.snippetVM.update(vm);				
			}
		};

		vm.title.subscribe(function() {
			CodePet.snippetListVM.updateDictionary();
		});
		vm.description.subscribe(function() {
			CodePet.snippetListVM.updateDictionary();
		});

		/* RETURN VM ***************************************************/

		return vm;
	};

	/* PUBLIC VIEWMODELS ***********************************************/

	/**
	 * Snippet list Viewmodel
	 * @constructor
	 * @return {object} snippetListVM
	 */
	CodePet.snippetListVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			list: ko.observableArray(),
			current: ko.observable(0),
			shownMenu: ko.observable(false),
			searchFocus: ko.observable(false),

			searchString: ko.observable(''),
			onUpdate: ko.observable(0)
		};

		vm.empty = ko.computed(function() {
			return vm.list().length <= 0;
		});

		var updateCount = 0; // Ready counter for execute onUpdate

		/* PRIVATE METHODS *************************************************/

		var dictionary;

		vm.updateDictionary = function() {
			dictionary = [];
			vm.each(function(sVM) {
				var txt = sVM.title() + ' ' + sVM.description();
				var o = {
					_id: sVM._id,
					text: txt.toLowerCase()
				};
				dictionary.push(o);
			});
		};

		/**
		 * Sort list tag by number of snippets, from max to min
		 * @function
		 * @param {array} Opcional: list of collections in JSON format
		 */
		var sortOptions = {
			last: function(a, b) {
				if (parseInt(a.order) < parseInt(b.order)) return 1;
				if (parseInt(a.order) > parseInt(b.order)) return -1;
				return 0;
			},
			atoz: function(a, b) {
				if (a.title().toLowerCase() > b.title().toLowerCase()) return 1;
				if (a.title().toLowerCase() < b.title().toLowerCase()) return -1;
				return 0;
			},
			ztoa: function(a, b) {
				if (a.title().toLowerCase() < b.title().toLowerCase()) return 1;
				if (a.title().toLowerCase() > b.title().toLowerCase()) return -1;
				return 0;
			}
		};

		var criteria = 'last';
		var sort = function(li) {
			var list = li || vm.list();
			vm.list(list.sort(sortOptions[criteria]));
		};

		/* METHODS *************************************************/

		/**
		 * Update snippet list from server
		 * @function
		 */

		var fillList = function(data) {
			var length = data.length,
				newList = [];

			for (var i = 0; i < length; i++) {
				// Create a new snippet VM and push to list
				var newSnippetVM = snippetVM(data[i]);
				newList.push(newSnippetVM);
			}
			sort(newList);
			if (length > 0) {
				newList[0].setCurrent();
				newList[0].current(true);
			}
			
			dictionary = [];
			vm.searchString('');
			vm.updateDictionary();

			updateCount++;
			vm.onUpdate(updateCount);
		};


		vm.update = function() {

			var tagID = CodePet.tagListVM.current();
			var listIDs = CodePet.tbs.getSnippets(tagID);
					

			if (listIDs === 'all') {
				CodePet.data.getAll('snippets', fillList);
			} else {
				var listIDsLength = listIDs.length;
				if (listIDsLength == 0) {

					vm.list([]);
					updateCount++;
					vm.onUpdate(updateCount);
				} else {
					var parameters = {
						$or: []
					};
					for (var i = 0; i < listIDsLength; i++) {
						var o = listIDs[i];
						parameters.$or.push({
							_id: o
						});
					}
					CodePet.data.getBy('snippets', parameters, fillList);
				}
			}
		};

		vm.showMenu = function() {
			vm.shownMenu(true);
		};
		vm.hideMenu = function() {
			vm.shownMenu(false);
		};
		vm.orderBy = function(str) {
			if (vm.shownMenu()) {
				vm.shownMenu(false);
				criteria = str;
				sort();
			}
		};

		/**
		 * Iterate in the snippet list
		 * @function
		 * @param {function} Method to execute, receiving a snippet VM as parameter
		 */
		vm.each = function(callback) {
			var list = vm.list(),
				length = list.length;
			for (var i = 0; i < length; i++) {
				callback.apply(null, [list[i], i]);
			}
		};

		vm.getById = function(id) {
			var snippetToReturn = false;
			vm.each(function(sVM) {
				if (sVM._id == id) {
					snippetToReturn = sVM;
				}
			});
			return snippetToReturn;
		};


		vm.addSnippet = function() {
			vm.hideMenu();
			var t = new Date().getTime();
			CodePet.data.add('snippets', {
				'order': t,
				'title': '',
				'description': ''
			}, function(dataObj) {



				var newSnippetVM = snippetVM({
					'_id': dataObj._id,
					'title': '',
					'description': ''
				});

				vm.list.splice(0, 0, newSnippetVM);
				newSnippetVM.setCurrent();

				updateCount++;
				vm.onUpdate(updateCount);

				var tagID = CodePet.tagListVM.current();
	
				if (tagID !== 'all') {
					CodePet.snippetVM.addTagToSnippet(tagID);
				}
				CodePet.snippetVM.editTitle();
			});
		};

		vm.deleteSnippet = function(id) {
			CodePet.data.delete('snippets',id,function(){
				vm.update();
				CodePet.allSnippetsListVM.update();
				CodePet.data.deleteBy('tagBySnippet',{snippet_id:id},function(){
					CodePet.tbs.update();
				});
			});
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('snippetListVM'));
		};

		/* SUBSCRIPTIONS ***************************************************/

		/**
		 * When is current changes, set current the snippet collection VM
		 * @subscription
		 */
		vm.current.subscribe(function(v) {
			vm.each(function(sVM) {
				if (sVM._id == v) {
					sVM.current(true);
				} else {
					sVM.current(false);
				}
			});
		});
		vm.empty.subscribe(function(v) {
			if (v) {
				//CodePet.snippetVM.update(null);
			}
		});
		vm.searchString.subscribe(function(v) {
			// if (dictionary.length > 0) {
			// 	if (v.length > 2) {
			// 		var t = v.toLowerCase();
			// 		// Search in dictionary
			// 		var length = dictionary.length;
			// 		for (var i = 0; i < length; i++) {
			// 			var sVM = vm.getById(dictionary[i]._id);
			// 			if (dictionary[i].text.indexOf(t) >= 0) {
			// 				sVM.shown(true);
			// 			} else {
			// 				sVM.shown(false);
			// 			}
			// 		}
			// 	} else {
			// 		vm.each(function(sVM) {
			// 			sVM.shown(true);
			// 		});
			// 	}
			// }
		});

		/**
		 * When CodePet.tbs updates, update tag list of the snippet
		 * @subscription
		 */
		// CodePet.tbs.onUpdate.subscribe(function() {
		// 	vm.update();
		// });


		/* RETURN VM ***************************************************/

		return vm;
	})();
})();
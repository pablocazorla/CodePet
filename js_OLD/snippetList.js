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
			id: data.id,
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
				SnippetApp.snippetListVM.current(vm.id);
				SnippetApp.snippetVM.update(vm);
				// Load info
			}
		};

		vm.title.subscribe(function() {
			SnippetApp.snippetListVM.updateDictionary();
		});
		vm.description.subscribe(function() {
			SnippetApp.snippetListVM.updateDictionary();
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
	SnippetApp.snippetListVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			list: ko.observableArray(),
			current: ko.observable(0),
			shownMenu: ko.observable(false),
			searchFocus: ko.observable(false),
			loading: ko.observable(false),
			searchString: ko.observable(''),
			onReady: ko.observable(0)
		};

		vm.empty = ko.computed(function() {
			return vm.list().length <= 0;
		});

		var readyCount = 0; // Ready counter for execute onReady

		/* PRIVATE METHODS *************************************************/

		var dictionary;

		vm.updateDictionary = function() {
			dictionary = [];
			vm.each(function(sVM) {
				var txt = sVM.title() + ' ' + sVM.description();
				var o = {
					id: sVM.id,
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
				if (parseInt(a.id) < parseInt(b.id)) return 1;
				if (parseInt(a.id) > parseInt(b.id)) return -1;
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
		vm.update = function() {
			var tagID = SnippetApp.tagListVM.current();
			var listIDs = SnippetApp.tbs.getSnippets(tagID);
			if (listIDs.length > 0) {
				if (listIDs === 'all') {
					var parameters = {
						'all': true
					};
				} else {
					var parameters = {
						'list': true,
						'listIds': listIDs
					};
				}
				vm.loading(true);
				SnippetApp.ajax('classes/snippet/get.php', parameters, function(data) {
					var length = data.length,
						newList = [];

					for (var i = 0; i < length; i++) {
						// Create a new snippet VM and push to list
						var newSnippetVM = snippetVM(data[i]);
						newList.push(newSnippetVM);
					}
					if (length > 0) {
						newList[length - 1].setCurrent(true);
						newList[length - 1].current(true);
					}
					sort(newList);
					dictionary = [];
					vm.searchString('');
					vm.updateDictionary();
					readyCount++;
					vm.onReady(readyCount);
					vm.loading(false);
				});
			} else {
				vm.list([]);
				readyCount++;
				vm.onReady(readyCount);
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
				if (sVM.id == id) {
					snippetToReturn = sVM;
				}
			});
			return snippetToReturn;
		};


		vm.addSnippet = function() {
			SnippetApp.ajax('classes/snippet/post.php', {
				'addSnippet': true,
				'title': '',
				'description': ''
			}, function(id_snippet) {
				var idSnippet = parseInt(id_snippet);
				var newSnippetVM = snippetVM({
					'id': idSnippet,
					'title': '',
					'description': ''
				});
				vm.list.splice(0, 0, newSnippetVM);
				newSnippetVM.setCurrent();

				var tagID = SnippetApp.tagListVM.current();
				if (tagID > 0) {
					SnippetApp.snippetVM.addTagToSnippet(tagID);
				}
				SnippetApp.snippetVM.editTitle();
			});
		};

		vm.deleteSnippet = function(id) {
			SnippetApp.ajax('classes/snippet/post.php', {
				'deleteSnippet': true,
				'id': id
			}, function() {
				vm.update();
				SnippetApp.tbs.update();
				SnippetApp.allSnippetsListVM.update();
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
				if (sVM.id == v) {
					sVM.current(true);
				} else {
					sVM.current(false);
				}
			});
		});
		vm.empty.subscribe(function(v) {
			if (v) {
				SnippetApp.snippetVM.update(null);
			}
		});
		vm.searchString.subscribe(function(v) {
			if (dictionary.length > 0) {
				if (v.length > 2) {
					var t = v.toLowerCase();
					// Search in dictionary
					var length = dictionary.length;
					for (var i = 0; i < length; i++) {
						var sVM = vm.getById(dictionary[i].id);
						if (dictionary[i].text.indexOf(t) >= 0) {
							sVM.shown(true);
						} else {
							sVM.shown(false);
						}
					}
				} else {
					vm.each(function(sVM) {
						sVM.shown(true);
					});
				}
			}
		});


		/* RETURN VM ***************************************************/

		return vm;
	})();
})();
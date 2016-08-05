(function() {
	"use strict";

	/* PRIVATE VARIABLES ***********************************************/

	/**
	 * List of availables colors for tags
	 * @array
	 */
	var colorsAvaliables = ['#CD6CFF', '#FF6CBC', '#C17DA2', '#FF5454', '#C18F7D', '#FF8B52', '#FFA200', '#0AD200', '#CDB972', '#A0B300', '#B0A75D', '#97B379', '#79B3AB', '#2CC2C7', '#39A4FF', '#AEB2C5', '#7D9BC1', '#9587ED'],
		colorRandom = function() {
			var i = Math.floor(Math.random() * colorsAvaliables.length);
			return colorsAvaliables[i];
		};

	/* PRIVATE VIEWMODELS ***********************************************/

	/**
	 * Individual tag Viewmodel
	 * @constructor
	 * @return {object} tagVM
	 */
	var tagVM = function(data) {

		/* VM TO RETURN ***********************************************/
		var vm = {
			id: parseInt(data.id),
			title: ko.observable(data.title),
			color: ko.observable(data.color),
			current: ko.observable(false),
			showEditor: ko.observable(false),
			editMode: ko.observable(false),
			inputFocus: ko.observable(false)
		};

		/* PRIVATE VARIABLES ***********************************************/

		// Cache for title when edit
		var titleCache = '',
			// Cache for title when edit
			colorCache = '';

		/* VARIABLES ***********************************************/

		/**
		 * List of Color VMs used to change and apply tag color
		 * @array
		 */
		vm.colorList = (function() {
			var newlist = [],
				colorVM = function(col) {
					var vmColor = {
						col: col,
						setColor: function() {
							vm.color(col);
						}
					};
					vmColor.current = ko.computed(function() {
						return vmColor.col === vm.color();
					});
					return vmColor;
				}
			for (var i = 0; i < colorsAvaliables.length; i++) {
				newlist.push(colorVM(colorsAvaliables[i]));
			}
			return newlist;
		})();

		/* COMPUTED VARIABLES ***********************************************/

		/**
		 * Num of snippets for this tag
		 * @function
		 * @return number
		 */
		vm.num = ko.computed(function() {
			if (SnippetApp.tbs.onReady() > 0) {
				return SnippetApp.tbs.getSnippets(vm.id).length;
			} else {
				return 0;
			}
		});

		/* METHODS ***********************************************/

		/**
		 * Edit the title of the tag
		 * @function
		 */
		vm.editTag = function() {
			titleCache = vm.title();
			colorCache = vm.color();
			SnippetApp.tagListVM.showEditor(vm.id);
			vm.inputFocus(true);
		};
		vm.cancelEditTag = function() {
			vm.title(titleCache);
			vm.color(colorCache);
			SnippetApp.tagListVM.showEditor(-1);
		};

		/**
		 * Save the new title of the tag
		 * @function
		 */
		vm.saveEdit = function() {
			var newTitle = jQuery.trim(vm.title());
			if (newTitle !== '' && newTitle !== titleCache) {
				// update Title
				SnippetApp.ajax('classes/tag/post.php', {
					'updateTitle': true,
					'id': vm.id,
					'title': newTitle
				});
			} else {
				vm.title(titleCache);
			}
			if (vm.color() !== colorCache) {
				// update Color
				SnippetApp.ajax('classes/tag/post.php', {
					'updateColor': true,
					'id': vm.id,
					'color': vm.color()
				});
			}
			SnippetApp.tagListVM.showEditor(-1);
		};

		/**
		 * Change the 'delete' mode to true
		 * @function
		 */
		vm.deleteTag = function() {
			vm.editMode(false);
		};

		vm.cancelDeleteTag = function() {
			SnippetApp.tagListVM.showEditor(-1);
		};

		/**
		 * Delete tag
		 * @function
		 */
		vm.deleteTagYes = function() {
			// delete Tag
			SnippetApp.ajax('classes/tag/post.php', {
				'deleteTag': true,
				'id': vm.id
			}, function() {
				SnippetApp.tagListVM.quitFromList(vm.id);
			});
			SnippetApp.tagListVM.showEditor(-1);
		};

		/**
		 * Set current tag
		 * @function
		 */
		vm.setCurrent = function() {
			if (!vm.current() && !vm.showEditor()) {
				SnippetApp.allSnippetsListVM.current(false);
				// Set current by id tag
				SnippetApp.tagListVM.current(vm.id);
				SnippetApp.snippetListVM.update();
			}
		};



		/* RETURN VM ***************************************************/

		return vm;
	};

	/* PUBLIC VIEWMODELS ***********************************************/

	/**
	 * 'All Snippets' link Viewmodel
	 * @constructor
	 * @return {object} allSnippetsListVM
	 */
	SnippetApp.allSnippetsListVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			num: ko.observable(0),
			current: ko.observable(false),
			onReady: ko.observable(0)
		};
		var readyCount = 0; // Ready counter for execute onReady

		/* METHODS ***********************************************/

		/**
		 * Update total number of snippets from server
		 * @function
		 */
		vm.update = function() {
			SnippetApp.ajax('classes/snippet/get.php', {
				'numTotal': true
			}, function(data) {
				vm.num(data[0]['num']);
				readyCount++;
				vm.onReady(readyCount);
			});
		};

		/**
		 * Set current this link, and set not-current all tag links
		 * @function
		 */
		vm.setCurrent = function() {
			if (!vm.current()) {
				vm.current(true);
				// Set NOT current tag links
				SnippetApp.tagListVM.current(-1);

				// Load snippet list with all snippets
				SnippetApp.snippetListVM.update();
			}
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('allSnippetsListVM'));
			vm.update();
			vm.setCurrent();
		};

		


		/* RETURN VM ***************************************************/

		return vm;
	})();

	/**
	 * Tag list Viewmodel
	 * @constructor
	 * @return {object} tagListVM
	 */
	SnippetApp.tagListVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			list: ko.observableArray([]),
			current: ko.observable(-1),
			showEditor: ko.observable(-1),
			onReady: ko.observable(0),
			loading: ko.observable(false),
			shownMenu: ko.observable(false)

		};

		/* PRIVATE VARIABLES ***********************************************/

		var readyCount = 0; // Ready counter for execute onReady

		/* PRIVATE METHODS *************************************************/

		/**
		 * Sort list tag by number of snippets, from max to min
		 * @function
		 * @param {array} Opcional: list of collections in JSON format
		 */
		var sortOptions = {
			count: function(a, b) {
				if (a.num() < b.num()) return 1;
				if (a.num() > b.num()) return -1;
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

		var criteria = 'count';
		var sort = function(li) {
			var list = li || vm.list();
			vm.list(list.sort(sortOptions[criteria]));
		};

		vm.empty = ko.computed(function() {
			return vm.list().length <= 0;
		});

		/* METHODS *************************************************/

		/**
		 * Update tag list from server
		 * @function
		 */
		vm.update = function() {
			vm.loading(true);
			SnippetApp.ajax('classes/tag/get.php', {
				'all': true
			}, function(data) {
				var length = data.length,
					newList = [];

				for (var i = 0; i < length; i++) {
					// Create a new tag VM and push to list
					var newTagVM = tagVM(data[i]);
					newList.push(newTagVM);
				}
				sort(newList);
				readyCount++;
				vm.onReady(readyCount);
				vm.loading(false);
			});
		};

		/**
		 * Add new tag
		 * @function
		 */
		vm.add = function() {
			vm.shownMenu(false);
			// save New Tag
			var newColor = colorRandom();
			SnippetApp.ajax('classes/tag/post.php', {
				'addNewTag': true,
				'title': 'New tag',
				'color': newColor
			}, function(numId) {
				var newTagVM = tagVM({
					id: parseInt(numId),
					'title': 'New tag',
					'color': newColor
				});
				vm.list.splice(0, 0, newTagVM);
				newTagVM.editTag();
				//SnippetApp.tbs.update();
			});
		};

		vm.showMenu = function() {
			vm.shownMenu(true);
		};
		vm.hideMenu = function() {
			vm.shownMenu(false);
		};

		vm.orderBy = function(str) {
			if(vm.shownMenu()){
				vm.shownMenu(false);
				criteria = str;
				sort();
			}			
		};

		/**
		 * Iterate in the tag list
		 * @function
		 * @param {function} Method to execute, receiving a tag VM as parameter
		 */
		vm.each = function(callback) {
			var list = vm.list(),
				length = list.length;
			for (var i = 0; i < length; i++) {
				callback.apply(null, [list[i], i]);
			}
		};

		/**
		 * Get a tag VM by id
		 * @function
		 * @param {number} The id of the tag VM
		 * @return {object} The tag VM
		 */
		vm.getById = function(id) {
			var tagToReturn = false;
			vm.each(function(tVM) {
				if (tVM.id == id) {
					tagToReturn = tVM;
				}
			});
			return tagToReturn;
		};

		/**
		 * Quit a tag from list, after delete tag
		 * @function
		 * @param {number} The id of the tag VM
		 */
		vm.quitFromList = function(id) {
			var indextoQuit = -1;
			vm.each(function(tVM, index) {
				if (tVM.id == id) {
					indextoQuit = index;
				}
			});
			if (indextoQuit >= 0) {
				vm.list.splice(indextoQuit, 1);
				SnippetApp.tbs.update();
			}
		}

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('tagListVM'));
			vm.update();
		};

		/* SUBSCRIPTIONS ***************************************************/

		/**
		 * When current changes, set current the right tag VM
		 * @subscription
		 */
		vm.current.subscribe(function(v) {
			vm.each(function(tVM) {
				if (tVM.id == v) {
					tVM.current(true);
				} else {
					tVM.current(false);
				}
			});
		});

		vm.showEditor.subscribe(function(v) {
			vm.each(function(tVM) {
				if (tVM.id == v) {					
					tVM.editMode(true);
					tVM.showEditor(true);
				} else {
					tVM.showEditor(false);
				}
			});
		});

		/**
		 * When list changes, set onReady
		 * @subscription
		 */
		vm.list.subscribe(function() {
			readyCount++;
			vm.onReady(readyCount);
		});

		/**
		 * When tbs changes, sort the tag list
		 * @subscription
		 */
		SnippetApp.tbs.onReady.subscribe(function() {
			setTimeout(function() {
				sort();
			}, 100);
		});

		/* RETURN VM ***************************************************/

		return vm;
	})();
})();
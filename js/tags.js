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
			_id: data._id,
			title: ko.observable(data.title),
			color: ko.observable(data.color),
			current: ko.observable(false),
			showEditor: ko.observable(false),
			editMode: ko.observable(false),
			inputFocus: ko.observable(false),
			num:ko.observable(0)
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
		

		CodePet.tbs.onUpdate.subscribe(function(){
			var n = CodePet.tbs.getSnippets(vm._id).length;
			vm.num(n);
		});

		/* METHODS ***********************************************/

		/**
		 * Edit the title of the tag
		 * @function
		 */
		vm.editTag = function() {
			titleCache = vm.title();
			colorCache = vm.color();
			CodePet.tagListVM.showEditor(vm._id);
			vm.inputFocus(true);
		};
		vm.cancelEditTag = function() {
			vm.title(titleCache);
			vm.color(colorCache);
			CodePet.tagListVM.showEditor(-1);
		};

		/**
		 * Save the new title of the tag
		 * @function
		 */
		vm.saveEdit = function() {
			var newTitle = jQuery.trim(vm.title());
			if (newTitle !== '' && newTitle !== titleCache) {
				// update Title
				CodePet.data.update('tags', vm._id, {
					'title': newTitle
				});
			} else {
				vm.title(titleCache);
			}
			if (vm.color() !== colorCache) {
				// update Color			
				CodePet.data.update('tags', vm._id, {
					'color': vm.color()
				});
			}
			CodePet.tagListVM.showEditor(-1);
		};

		/**
		 * Change the 'delete' mode to true
		 * @function
		 */
		vm.deleteTag = function() {
			vm.editMode(false);
		};

		vm.cancelDeleteTag = function() {
			CodePet.tagListVM.showEditor(-1);
		};

		/**
		 * Delete tag
		 * @function
		 */
		vm.deleteTagYes = function() {
			// delete Tag
			CodePet.data.delete('tags', vm._id,function(){
				CodePet.data.deleteBy('tagBySnippet', {tag_id:vm._id});
			});
			CodePet.tagListVM.quitFromList(vm._id);
			CodePet.tagListVM.showEditor(-1);
		};

		/**
		 * Set current tag
		 * @function
		 */
		vm.setCurrent = function() {
			if (!vm.current() && !vm.showEditor()) {
				CodePet.allSnippetsListVM.current(false);
				// Set current by id tag
				CodePet.tagListVM.current(vm._id);
				CodePet.snippetListVM.update();
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
	CodePet.allSnippetsListVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			num: ko.observable(0),
			current: ko.observable(false)
		};

		/* METHODS ***********************************************/

		/**
		 * Update total number of snippets from server
		 * @function
		 */
		vm.update = function() {
			CodePet.data.count('snippets',function(n){
				vm.num(n);
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
				CodePet.tagListVM.current('all');

				// Load snippet list with all snippets
				CodePet.snippetListVM.update();
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

			CodePet.snippetListVM.onUpdate.subscribe(function() {
				vm.update();
			});
		};





		/* RETURN VM ***************************************************/

		return vm;
	})();

	/**
	 * Tag list Viewmodel
	 * @constructor
	 * @return {object} tagListVM
	 */
	CodePet.tagListVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			list: ko.observableArray([]),
			current: ko.observable('all'),
			showEditor: ko.observable(-1),
			shownMenu: ko.observable(false),
			onUpdate: ko.observable(0)
		};

		/* PRIVATE VARIABLES ***********************************************/

		var updateCount = 0; // Update counter for execute onUpdate

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
			CodePet.data.getAll('tags', function(dataTags) {
				var length = dataTags.length,
					newList = [];

				for (var i = 0; i < length; i++) {
					// Create a new tag VM and push to list

					var newTagVM = tagVM(dataTags[i]);
					newList.push(newTagVM);
				}
				sort(newList);
				updateCount++;
				vm.onUpdate(updateCount);
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



			CodePet.data.add('tags', {
				'title': 'New tag',
				'color': newColor
			}, function(dataObject) {
				var newTagVM = tagVM({
					'_id': dataObject._id,
					'title': 'New tag',
					'color': newColor
				});
				vm.list.splice(0, 0, newTagVM);
				newTagVM.editTag();
			});



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
				if (tVM._id == id) {
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
				if (tVM._id == id) {
					indextoQuit = index;
				}
			});
			if (indextoQuit >= 0) {
				vm.list.splice(indextoQuit, 1);
				CodePet.tbs.update();
			}
		}

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('tagListVM'));
			vm.update();
			CodePet.tbs.update();
		};

		/* SUBSCRIPTIONS ***************************************************/

		/**
		 * When current changes, set current the right tag VM
		 * @subscription
		 */
		vm.current.subscribe(function(v) {
			vm.each(function(tVM) {
				if (tVM._id == v) {
					tVM.current(true);
				} else {
					tVM.current(false);
				}
			});
		});

		vm.showEditor.subscribe(function(v) {
			vm.each(function(tVM) {
				if (tVM._id == v) {
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
			updateCount++;
			vm.onUpdate(updateCount);
		});

		/**
		 * When tbs changes, sort the tag list
		 * @subscription
		 */
		CodePet.tbs.onUpdate.subscribe(function() {
			setTimeout(function() {
				sort();
			}, 100);
		});


		/* RETURN VM ***************************************************/

		return vm;
	})();
})();
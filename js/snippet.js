(function() {
	"use strict";



	/* PRIVATE VIEWMODELS ***********************************************/

	/**
	 * Code Viewmodel
	 * @constructor
	 * @return {object} snippetVM
	 */
	var codeVM = function(data) {
		var vm = {
			_id: data._id,
			order: data.order,
			content: ko.observable(data.content.replace(/&quot;/g, '"')),
			language: ko.observable(data.language),
			languageTitle: ko.observable(''),
			show: ko.observable(true),
			editing: ko.observable(false),
			canMoveUp: ko.observable(false),
			canMoveDown: ko.observable(false)
		};

		var editor = null;

		var contentCache = '';

		vm.setACEeditor = function() {
			editor = ace.edit('editor-' + vm._id);
			editor.session.setUseWrapMode(true);
			editor.$blockScrolling = Infinity;
			editor.setShowPrintMargin(false);
			editor.setReadOnly(true);
			editor.setOptions({
				maxLines: Infinity
			});

			editor.session.setMode('ace/mode/' + vm.language());
			editor.setValue(vm.content(), -1);
		};
		vm.edit = function() {
			contentCache = editor.getValue();
			vm.editing(true);
			editor.focus();
			var session = editor.getSession();
			//Get the number of lines
			var count = session.getLength();
			//Go to end of the last line
			editor.gotoLine(count, session.getLine(count - 1).length);
		};
		vm.saveEdit = function() {
			vm.editing(false);
			//Save
			var v = editor.getValue();
			if (v != contentCache) {
				vm.content(v);
				var vFormatted = v.replace(/"/g, '&quot;');

				// to db
				CodePet.data.update('codes', vm._id, {
					'content': vFormatted
				});
				CodePet.notifications.fire('Saved Code.');
			}
		};
		vm.cancelEdit = function() {
			vm.editing(false);
			editor.setValue(vm.content(), -1);
		};

		vm.updateLanguageSelector = function() {
			CodePet.popupCodeLanguageSelector.update(vm);
		};

		vm.deleteCode = function() {
			CodePet.modalDeleteCode.update(vm._id);
		};



		vm.moveDown = function() {
			CodePet.snippetVM.moveDown(vm._id);
		};

		vm.moveUp = function() {
			CodePet.snippetVM.moveUp(vm._id);
		};

		vm.copy = function(){
			CodePet.setClipboard(vm.content());
			CodePet.notifications.fire('Copied to clipboard.');
		};


		vm.languageTitle((function() {
			var le = CodePet.languagesAvailables.length,
				val = vm.language(),
				title = '';

			for (var i = 0; i < le; i++) {
				if (CodePet.languagesAvailables[i].val === val) {
					title = CodePet.languagesAvailables[i].title;
				}
			}
			return title;
		})());

		vm.language.subscribe(function(v) {
			editor.session.setMode('ace/mode/' + v);

			// to db
			CodePet.data.update('codes', vm._id, {
				'language': v
			});
		});

		vm.editing.subscribe(function(v) {
			editor.setReadOnly(!v);
		});


		return vm;
	};

	/* PUBLIC VIEWMODELS ***********************************************/

	/**
	 * Snippet Viewmodel
	 * @constructor
	 * @return {object} snippetVM
	 */
	CodePet.snippetVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			_id: -1,
			title: ko.observable(),
			description: ko.observable(),
			tags: ko.observableArray(),
			couldAddTag: ko.observable(true),
			editingTitle: ko.observable(false),
			editingDescription: ko.observable(false),
			codes: ko.observableArray(),
			empty: ko.observable(true),
			onUpdate: ko.observable(0)
		};

		/* PRIVATE VARIABLES ***********************************************/

		// The current snippetVM from snippetListVM
		var currentFromList = false,
			// Cache for title when edit
			titleCache = '',
			// Cache for description when edit
			descriptionCache = '';

		var updateSortButtons = function() {
			
				var length = vm.codes().length;
				vm.codeEach(function(cVM, index) {
					if (index == 0) {
						cVM.canMoveUp(false);
					} else {
						cVM.canMoveUp(true);
					}

					if (index == (length - 1)) {
						cVM.canMoveDown(false);
					} else {
						cVM.canMoveDown(true);
					}
				});
			
		};

		/* COMPUTED VARIABLES ***********************************************/

		/**
		 * TShort text for title
		 * @function
		 * @return string
		 */
		vm.titleFormatted = ko.computed(function() {
			var t = vm.title();
			if (t == '') {
				return 'Untitled';
			} else {
				return t;
			}
		});
		/**
		 * TShort text for description
		 * @function
		 * @return string
		 */
		vm.descriptionFormatted = ko.computed(function() {
			var t = vm.description();
			if (t == '') {
				return 'Not described yet';
			} else {
				return t;
			}
		});
		vm.emptyCode = ko.computed(function() {
			return vm.codes().length <= 0;
		});

		var updateCount = 0; // Ready counter for execute onUpdate

		var sortCriteria = function(a, b) {
			if (parseInt(a.order) < parseInt(b.order)) return 1;
			if (parseInt(a.order) > parseInt(b.order)) return -1;
			return 0;
		};

		/* METHODS ***********************************************/

		/**
		 * Update snippet from snippetListVM and tbsVM
		 * @function
		 */
		vm.update = function(snippetVMFromList) {
			if (snippetVMFromList !== null) {
				vm.empty(false);
				currentFromList = snippetVMFromList;
				vm._id = currentFromList._id;
				vm.title(currentFromList.title());
				vm.description(currentFromList.description());
				vm.updateTags();

				// update code list
				CodePet.data.getBy('codes', {
					snippet_id: vm._id
				}, function(data) {
					var length = data.length;

					var listcodes = [];
					for (var i = 0; i < length; i++) {
						// Create a new snippet VM and push to list
						var newCodeVM = codeVM(data[i]);

						listcodes.push(newCodeVM);

					}

					listcodes.sort(sortCriteria);
					vm.codes(listcodes);

					for (var i = 0; i < length; i++) {
						listcodes[i].setACEeditor();
					}


					updateCount++;
					vm.onUpdate(updateCount);
				});
			} else {				
				vm.empty(true);
				updateCount++;
				vm.onUpdate(updateCount);
			}

		};

		vm.addSnippet = function() {
			CodePet.snippetListVM.addSnippet();
		};


		vm.deleteSnippet = function() {
			CodePet.modalDeleteSnippet.update(vm._id);
		};

		/**
		 * Edit the title of the snippet
		 * @function
		 */
		vm.editTitle = function() {
			titleCache = vm.title();
			vm.editingTitle(true);
		};

		/**
		 * Save the new title of the snippet in server
		 * @function
		 */
		vm.saveTitle = function() {
			vm.editingTitle(false);
			var newTitle = vm.title();
			if (newTitle === '') {
				newTitle = titleCache;
				vm.title(titleCache);
			}
			if (newTitle !== titleCache) {
				CodePet.data.update('snippets', vm._id, {
					title: newTitle
				});
				CodePet.notifications.fire('Updated Title Snippet.');
			}
		};

		/**
		 * Edit the description of the snippet
		 * @function
		 */
		vm.editDescription = function() {
			descriptionCache = vm.description();
			vm.editingDescription(true);
		};

		/**
		 * Save the new description of the snippet in server
		 * @function
		 */
		vm.saveDescription = function() {
			vm.editingDescription(false);
			var newDescription = vm.description();
			if (newDescription === '') {
				newDescription = descriptionCache;
				vm.title(descriptionCache);
			}
			if (newDescription !== descriptionCache) {
				CodePet.data.update('snippets', vm._id, {
					description: newDescription
				});
				CodePet.notifications.fire('Updated Description Snippet.');
			}
		};

		/**
		 * Update the tag list of the snippet with the CodePet.tbs data
		 * @function
		 */
		vm.updateTags = function() {
			var tagsList = [],
				tagsLeftList = [],
				listTagIDs = CodePet.tbs.getTags(vm._id);
			CodePet.tagListVM.each(function(tVM) {
				if (listTagIDs.indexOf(tVM._id) >= 0) {
					tagsList.push(tVM);
				} else {
					tagsLeftList.push(tVM);
				}
			});
			vm.tags(tagsList);
			CodePet.popupAddTag.tagsLeft(tagsLeftList);
			vm.couldAddTag(tagsLeftList.length > 0);
		};



		/**
		 * Add tag to snippet
		 * @function
		 */
		vm.addTagToSnippet = function(tid) {
			var tagID = (typeof tid === 'string') ? tid : tid._id;
			CodePet.tbs.addTag(vm._id, tagID);
		};

		/**
		 * Remove tag from snippet
		 * @function
		 */
		vm.removeFromSnippet = function() {
			var tagID = this._id;
			CodePet.tbs.removeTag(vm._id, tagID);
		};

		vm.addCode = function() {
			var t = new Date().getTime();
			var defaultLanguage = CodePet.languagesAvailables[0].val;
			CodePet.data.add('codes', {
				'snippet_id': vm._id,
				'order': t,
				'content': '',
				'language': defaultLanguage
			}, function(data) {
				var newCodeVM = codeVM({
					'_id': data._id,
					'order': t,
					'content': '',
					'language': defaultLanguage
				});
				//
				vm.codes.splice(0, 0, newCodeVM);
				//vm.codes.push(newCodeVM);
				newCodeVM.setACEeditor();
				newCodeVM.edit();
			});
		};

		vm.codeEach = function(callback) {
			var list = vm.codes(),
				length = list.length;
			for (var i = 0; i < length; i++) {
				callback.apply(null, [list[i], i]);
			}
		};

		vm.quitCodeFromList = function(id) {
			var indextoQuit = -1;
			vm.codeEach(function(cVM, index) {
				if (cVM._id == id) {
					indextoQuit = index;
				}
			});
			if (indextoQuit >= 0) {
				vm.codes()[indextoQuit].show(false);
				setTimeout(function() {
					vm.codes.splice(indextoQuit, 1);
				}, 400);
			}
		};


		vm.moveDown = function(id) {
			var indextoMove = 9999,
				list = vm.codes(),
				length = list.length;
			vm.codeEach(function(cVM, index) {
				if (cVM._id == id) {
					indextoMove = index;
				}
			});
			++indextoMove;
			if (indextoMove < length) {
				var order1 = list[indextoMove - 1].order,
					order2 = list[indextoMove].order,
					id1 = list[indextoMove - 1]._id,
					id2 = list[indextoMove]._id;

				list[indextoMove - 1].order = order2;
				list[indextoMove].order = order1;

				vm.codes.sort(sortCriteria);
				// to db
				CodePet.data.update('codes', id1, {
					'order': order2
				});
				CodePet.data.update('codes', id2, {
					'order': order1
				});
			}
		};

		vm.moveUp = function(id) {
			var indextoMove = -1,
				list = vm.codes();
			vm.codeEach(function(cVM, index) {
				if (cVM._id == id) {
					indextoMove = index;
				}
			});
			--indextoMove;
			if (indextoMove >= 0) {
				var order1 = list[indextoMove + 1].order,
					order2 = list[indextoMove].order,
					id1 = list[indextoMove + 1]._id,
					id2 = list[indextoMove]._id;

				list[indextoMove + 1].order = order2;
				list[indextoMove].order = order1;

				vm.codes.sort(sortCriteria);
				// to db
				CodePet.data.update('codes', id1, {
					'order': order2
				});
				CodePet.data.update('codes', id2, {
					'order': order1
				});
			}			
		};



		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('snippetVM'));
		};

		/* SUBSCRIPTIONS ***************************************************/

		/**
		 * When update title, update also snippet list title
		 * @subscription
		 */
		vm.title.subscribe(function(v) {
			if (currentFromList) {
				currentFromList.title(v);
			}
		});

		/**
		 * When update description, update also snippet list description
		 * @subscription
		 */
		vm.description.subscribe(function(v) {
			if (currentFromList) {
				currentFromList.description(v);
			}
		});

		vm.codes.subscribe(function() {
			CodePet.floats.update();
			updateSortButtons();
		});

		/**
		 * When CodePet.tbs updates, update tag list of the snippet
		 * @subscription
		 */
		CodePet.tbs.onUpdate.subscribe(function() {
			vm.updateTags();
		});
		/**
		 * When CodePet.tagListVM updates, update tag list of the snippet
		 * @subscription
		 */
		CodePet.tagListVM.onUpdate.subscribe(function() {
			vm.updateTags();
		});

		/* RETURN VM ***************************************************/

		return vm;
	})();
})();
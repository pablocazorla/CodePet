(function() {
	"use strict";

	// Popups
	CodePet.popupOrderTag = (function() {
		var vm = {};

		vm.orderByCount = function() {
			CodePet.tagListVM.orderBy('count');
		};
		vm.orderAtoZ = function() {
			CodePet.tagListVM.orderBy('atoz');
		};
		vm.orderZtoA = function() {
			CodePet.tagListVM.orderBy('ztoa');
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('order-tag-popup'));
		};

		return vm;
	})();

	CodePet.popupOrderList = (function() {
		var vm = {};

		vm.orderByCount = function() {
			CodePet.snippetListVM.orderBy('last');
		};
		vm.orderAtoZ = function() {
			CodePet.snippetListVM.orderBy('atoz');
		};
		vm.orderZtoA = function() {
			CodePet.snippetListVM.orderBy('ztoa');
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('order-list-popup'));
		};

		return vm;
	})();

	CodePet.popupAddTag = (function() {
		var vm = {
			tagsLeft: ko.observableArray()
		};

		vm.addTagToSnippet = function(tid) {
			CodePet.snippetVM.addTagToSnippet(tid);
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('add-tag-popup'));
		};

		return vm;
	})();

	CodePet.popupTagEdit = (function() {

		/**
		 * List of availables colors for tags
		 * @array
		 */
		var colorsAvaliables = ['#CD6CFF', '#FF6CBC', '#C17DA2', '#FF5454', '#C18F7D', '#FF8B52', '#FFA200', '#0AD200', '#CDB972', '#A0B300', '#B0A75D', '#97B379', '#79B3AB', '#2CC2C7', '#39A4FF', '#AEB2C5', '#7D9BC1', '#9587ED'];



		var vm = {
			title: ko.observable(''),
			color: ko.observable(''),
			inputFocus: ko.observable(false),
			colorRandom: function() {
				var i = Math.floor(Math.random() * colorsAvaliables.length);
				return colorsAvaliables[i];
			}
		};

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

		var currentTag = null,
			titleCache = '',
			colorCache = '';

		vm.update = function(tag) {
			currentTag = tag;
			titleCache = tag.title();
			colorCache = tag.color();
			vm.title(titleCache);
			vm.color(colorCache);
			vm.inputFocus(true);
		};

		/**
		 * Save the new title and color of the tag
		 * @function
		 */

		vm.save = function() {
			var newTitle = jQuery.trim(vm.title());

			if (newTitle !== '' && newTitle !== titleCache) {
				// update Title
				currentTag.title(newTitle);
				CodePet.data.update('tags', currentTag._id, {
					'title': newTitle
				});
			} else {
				currentTag.title(titleCache);
			}
			var newColor = vm.color();
			if (newColor !== colorCache) {
				// update Color
				currentTag.color(newColor);
				CodePet.data.update('tags', currentTag._id, {
					'color': newColor
				});
			}
			CodePet.notifications.fire('Saved Tag.');
		};

		vm.deleteTag = function() {
			CodePet.modalDeleteTag.update(currentTag._id);
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('tag-edit-popup'));
		};

		return vm;
	})();

	CodePet.popupCodeLanguageSelector = (function() {

		var currentCode = null;

		var languageVM = function(data) {
			var vm = {
				title: data.title,
				val: data.val
			};

			vm.setLanguage = function() {
				currentCode.language(vm.val);
				currentCode.languageTitle(vm.title);
			}

			return vm;
		};



		var vm = {
			list: ko.observableArray()
		};

		var le = CodePet.languagesAvailables.length,
			list = [];
		for (var i = 0; i < le; i++) {
			var newLang = languageVM(CodePet.languagesAvailables[i]);
			list.push(newLang);
		}
		vm.list(list);

		vm.update = function(code){
			console.log
			currentCode = code;
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('code-language-selector'));
		};

		return vm;
	})();

	// MODALS *************************************************/

	var modal = (function() {
		var cache = {};
		return {
			show: function(idNode) {
				if (typeof cache[idNode] == 'undefined') {
					cache[idNode] = $('#' + idNode);
				}
				cache[idNode].addClass('render show');
			},
			hide: function(idNode) {
				if (typeof cache[idNode] == 'undefined') {
					cache[idNode] = $('#' + idNode);
				}
				cache[idNode].removeClass('show');
				setTimeout(function() {
					cache[idNode].removeClass('render');
				}, 300);
			}
		};
	})();


	CodePet.modalDeleteTag = (function() {

		var idNode = 'modal-delete-tag',
			currentTagId = null;

		var vm = {
			focus:ko.observable(false)
		};

		vm.update = function(tagID) {
			currentTagId = tagID;
			vm.focus(true);
			modal.show(idNode);
		};

		vm.hide = function() {
			modal.hide(idNode);
		};

		/**
		 * Delete tag
		 * @function
		 */
		vm.deleteTag = function() {
			// delete Tag
			CodePet.data.delete('tags', currentTagId, function() {
				CodePet.data.deleteBy('tagBySnippet', {
					tag_id: currentTagId
				});
			});
			CodePet.tagListVM.quitFromList(currentTagId);
			modal.hide(idNode);
			CodePet.notifications.fire('Deleted Tag.');
			CodePet.allSnippetsListVM.setCurrent();
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById(idNode));
		};

		return vm;
	})();

	CodePet.modalDeleteSnippet = (function() {

		var idNode = 'modal-delete-snippet',
			currentSnippetId = null;

		var vm = {
			focus:ko.observable(false)
		};

		vm.update = function(snippetID) {
			currentSnippetId = snippetID;
			vm.focus(true);
			modal.show(idNode);
		};

		vm.hide = function() {
			modal.hide(idNode);
		};

		/**
		 * Delete snippet
		 * @function
		 */
		vm.deleteSnippet = function() {
			CodePet.snippetListVM.deleteSnippet(currentSnippetId);
			modal.hide(idNode);
			CodePet.notifications.fire('Deleted Snippet.');
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById(idNode));
		};

		return vm;
	})();

	CodePet.modalDeleteCode = (function() {

		var idNode = 'modal-delete-code',
			currentCodeId = null;

		var vm = {
			focus:ko.observable(false)
		};

		vm.update = function(codeID) {
			currentCodeId = codeID;
			vm.focus(true);
			modal.show(idNode);
		};

		vm.hide = function() {
			modal.hide(idNode);
		};

		/**
		 * Delete code
		 * @function
		 */
		vm.deleteCode = function() {
			CodePet.data.delete('codes', currentCodeId, function() {
				CodePet.snippetVM.quitCodeFromList(currentCodeId);
			});

			modal.hide(idNode);
			CodePet.notifications.fire('Deleted Code.');
		};

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById(idNode));
		};

		return vm;
	})();

	CodePet.modalPreferences = (function() {

		var idNode = 'modal-preferences';

		var vm = {};

		vm.show = function() {
			modal.show(idNode);
		};

		vm.hide = function() {
			modal.hide(idNode);
		};		

		/**
		 * Init and bind VM
		 * @function
		 */
		vm.init = function() {
			ko.applyBindings(vm, document.getElementById(idNode));
		};

		return vm;
	})();
})();
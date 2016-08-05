(function() {
	"use strict";

	/* PUBLIC VIEWMODELS ***********************************************/

	/**
	 * TagBySnippet Viewmodel
	 * @constructor
	 * @return {object} tbs
	 */
	CodePet.tbs = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			onUpdate: ko.observable(0)
		};

		/* PRIVATE VARIABLES ***********************************************/

		var snippet = {}, // Map of snippet -> tag list
			tag = {},
			updateCount = 0; // Map of tag -> snippet list

		/* METHODS ***********************************************/

		/**
		 * Get and map 'tag by snippet' from server
		 * @function
		 */
		//
		vm.update = function() {
			CodePet.data.getAll('tagBySnippet', function(list) {
				var length = list.length;
				snippet = {};
				tag = {};
				for (var i = 0; i < length; i++) {
					var snippetId = list[i]['snippet_id'],
						tagId = list[i]['tag_id'];

					//
					if (typeof snippet[snippetId] == 'undefined') {
						snippet[snippetId] = [];
					}
					snippet[snippetId].push(tagId);
					//
					if (typeof tag[tagId] == 'undefined') {
						tag[tagId] = [];
					}
					tag[tagId].push(snippetId);
				};
				updateCount++;
				vm.onUpdate(updateCount);
			});
		};



		/**
		 * Get tag list for a snippet
		 * @function
		 * @param {number} The id of the snippet
		 * @return {array} The list of tags for this snippet
		 */
		vm.getTags = function(snippetId) {
			var listToReturn;
			if (typeof snippet[snippetId] == 'undefined') {
				listToReturn = [];
			} else {
				listToReturn = snippet[snippetId];
			}

			return listToReturn;
		};

		/**
		 * Get snippet list for a tag
		 * @function
		 * @param {number} The id of the tag
		 * @return {array} The list of snippet for this tag
		 */
		vm.getSnippets = function(tagId) {
			var listToReturn;
			if (tagId !== 'all') {
				if (typeof tag[tagId] == 'undefined') {

					listToReturn = [];
				} else {
					listToReturn = tag[tagId];
				}
			} else {
				listToReturn = 'all';
			}

			return listToReturn;
		};

		/**
		 * Add a tag to a snippet
		 * @function
		 * @param {number} The id of the snippet
		 * @param {number} The id of the tag
		 */

		vm.addTag = function(snippetId, tagId) {			
			if (typeof snippet[snippetId] == 'undefined') {
				snippet[snippetId] = [];
			}
			if (snippet[snippetId].indexOf(tagId) < 0) {
				// fake update
				snippet[snippetId].push(tagId);
				updateCount++;
				vm.onUpdate(updateCount);
				// to db then
				CodePet.data.add('tagBySnippet', {
					'snippet_id': snippetId,
					'tag_id': tagId
				}, function() {
					vm.update();
				});
			}
		};

		/**
		 * Remove a tag from a snippet
		 * @function
		 * @param {number} The id of the snippet
		 * @param {number} The id of the tag
		 */
		vm.removeTag = function(snippetId, tagId) {
			var index = snippet[snippetId].indexOf(tagId);
			if (index >= 0) {
				// fake update
				snippet[snippetId].splice(index, 1);
				updateCount++;
				vm.onUpdate(updateCount);
				// to db then
				CodePet.data.deleteBy('tagBySnippet', {
					'snippet_id': snippetId,
					'tag_id': tagId
				}, function() {
					vm.update();
				});
			}
		};

		/**
		 * Init VM
		 * @function
		 */
		vm.init = function() {
			// without bindings
			vm.update();
		};

		/* RETURN VM ***************************************************/
		return vm;
	})();
})();
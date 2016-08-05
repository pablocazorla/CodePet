(function() {
	"use strict";

	/* PUBLIC VIEWMODELS ***********************************************/

	/**
	 * TagBySnippet Viewmodel
	 * @constructor
	 * @return {object} tbs
	 */
	SnippetApp.tbs = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			onReady: ko.observable(0)
		};

		/* PRIVATE VARIABLES ***********************************************/

		var snippet = {}, // Map of snippet -> tag list
			tag = {}, // Map of tag -> snippet list
			readyCount = 0; // Ready counter for execute onReady

		/* METHODS ***********************************************/

		/**
		 * Get and map 'tag by snippet' from server
		 * @function
		 */
		vm.update = function() {
			SnippetApp.ajax('classes/tag/get.php', {
				'tbs': true
			}, function(data) {
				var length = data.length;
				snippet = {};
				tag = {};

				for (var i = 0; i < length; i++) {
					var snippetId = data[i]['snippet_id'],
						tagId = data[i]['tag_id'];
					//
					if (typeof snippet['id' + snippetId] == 'undefined') {
						snippet['id' + snippetId] = [];
					}
					snippet['id' + snippetId].push(parseInt(tagId));
					//
					if (typeof tag['id' + tagId] == 'undefined') {
						tag['id' + tagId] = [];
					}
					tag['id' + tagId].push(parseInt(snippetId));
				};
				readyCount++;
				vm.onReady(readyCount);
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
			if (typeof snippet['id' + snippetId] == 'undefined') {
				listToReturn = [];
			} else {
				listToReturn = snippet['id' + snippetId];
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
			if (tagId >= 0) {
				if (typeof tag['id' + tagId] == 'undefined') {
					listToReturn = [];
				} else {
					listToReturn = tag['id' + tagId];
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
			var tagId = parseInt(tagId)
			if (typeof snippet['id' + snippetId] == 'undefined') {
				snippet['id' + snippetId] = [];
			}
			if (snippet['id' + snippetId].indexOf(tagId) < 0) {
				// fake update
				snippet['id' + snippetId].push(tagId);
				readyCount++;
				vm.onReady(readyCount);
				// to server then
				SnippetApp.ajax('classes/tag/post.php', {
					'addTagToSnippet': true,
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
			var tagId = parseInt(tagId)
			var index = snippet['id' + snippetId].indexOf(tagId);
			if (index >= 0) {
				// fake update
				snippet['id' + snippetId].splice(index, 1);
				readyCount++;
				vm.onReady(readyCount);
				// to server then
				SnippetApp.ajax('classes/tag/post.php', {
					'removeTagFromSnippet': true,
					'snippet_id': snippetId,
					'tag_id': tagId
				}, function(d) {
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
// Snippets
for (var i = 0; i < 10; i++) {
	var snippet = {
		title: 'Snippet-' + i,
		description: 'Mi snippet nº ' + i,
		order: i,
		_id: 'sn'+i
	};
	CodePet.data.snippets.insert(snippet);
}
// Tags
for (var i = 0; i < 10; i++) {
	var tag = {
		_id: 'tg'+i,

		title: 'Tag-' + i,
		color: '#D00'
	};
	CodePet.data.tags.insert(tag);
}
// Tag By Snippet
for (var i = 0; i < 10; i++) {
	var tbs = {
		_id: 'tbs'+i,
		snippet_id: 'sn'+i,
		tag_id: (i<5)? 'tg1':'tg3'
	};
	CodePet.data.tagBySnippet.insert(tbs);
}
// Codes
for (var i = 0; i < 10; i++) {
	var code = {
		_id: 'cd'+i,
		order: i,
		snippet_id: (i<3)? 'sn0': ((i<7)? 'sn1':'sn2'),
		content: 'text content ' + i,
		language: 'css'
	};
	CodePet.data.codes.insert(code);
}
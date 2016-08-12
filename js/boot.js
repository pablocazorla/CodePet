CodePet = (function() {
	"use strict";

	var Datastore = require('nedb'),
		os = require('os'),
		path = require('path');

	// CodePet object
	var cp = {
		data: {}
	};

	// Load Data
	var dataNames = ['snippets', 'tags', 'tagBySnippet', 'codes'];
	for (var i = 0; i < dataNames.length; i++) {
		var dataName = dataNames[i];
		cp.data[dataName] = new Datastore({
			filename: path.join(__dirname, 'data/' + dataName),
			autoload: true
		});
	}

	cp.data.update = function(dataName, id, dataObject) {
		cp.data[dataName].update({
			_id: id
		}, {
			$set: dataObject
		}, {});
	};
	cp.data.delete = function(dataName, id,callback) {
		cp.data[dataName].remove({
			_id: id
		}, {}, function(err, dataObjects) {

			if (callback) {
				callback.apply(null, [dataObjects]);
			}
		});
	};
	cp.data.deleteBy = function(dataName, parameters, callback) {
		cp.data[dataName].remove(parameters, {
			multi: true
		}, function(err, dataObjects) {
			if (callback) {
				callback.apply(null, [dataObjects]);
			}
		});
	};
	cp.data.add = function(dataName, dataObject, callback) {
		cp.data[dataName].insert(dataObject, function(err, dataObjects) {
			callback.apply(null, [dataObjects]);
		});
	};
	cp.data.getAll = function(dataName, callback) {
		cp.data[dataName].find({}, function(err, dataObjects) {
			callback.apply(null, [dataObjects]);
		});
	};
	cp.data.getBy = function(dataName, parameters, callback) {
		cp.data[dataName].find(parameters, function(err, dataObjects) {
			callback.apply(null, [dataObjects]);
		});
	};
	cp.data.count = function(dataName, callback) {
		cp.data[dataName].count({}, function(err, count) {
			callback.apply(null, [count]);
		});
	};

	cp.floats = {
		update: function() {
			setTimeout(function(){
				$('.tooltip:not(.ready)').tooltip();
				$('.popup:not(.ready-popup)').popup();
			},100);			
		}
	};

		/**
	 * List of availables languages for codes
	 * @array
	 */
	cp.languagesAvailables = [{
		title: 'Plain Text',
		val: 'plain_text'
	}, {
		title: 'Abap',
		val: 'abap'
	}, {
		title: 'Abc',
		val: 'abc'
	}, {
		title: 'Actionscript',
		val: 'actionscript'
	}, {
		title: 'Ada',
		val: 'ada'
	}, {
		title: 'Apache conf',
		val: 'apache_conf'
	}, {
		title: 'Applescript',
		val: 'applescript'
	}, {
		title: 'Ascii',
		val: 'asciidoc'
	}, {
		title: 'Assembly x86',
		val: 'assembly_x86'
	}, {
		title: 'Autohotkey',
		val: 'autohotkey'
	}, {
		title: 'Batch file',
		val: 'batchfile'
	}, {
		title: 'Cirru',
		val: 'cirru'
	}, {
		title: 'Clojure',
		val: 'clojure'
	}, {
		title: 'COBOL',
		val: 'cobol'
	}, {
		title: 'Coffeescript',
		val: 'coffee'
	}, {
		title: 'Coldfusion',
		val: 'coldfusion'
	}, {
		title: 'C#',
		val: 'csharp'
	}, {
		title: 'CSS',
		val: 'css'
	}, {
		title: 'Curly',
		val: 'curly'
	}, {
		title: 'C cpp',
		val: 'c_cpp'
	}, {
		title: 'D',
		val: 'd'
	}, {
		title: 'Dart',
		val: 'dart'
	}, {
		title: 'Diff',
		val: 'diff'
	}, {
		title: 'Django',
		val: 'django'
	}, {
		title: 'Docker file',
		val: 'dockerfile'
	}, {
		title: 'Dot',
		val: 'dot'
	}, {
		title: 'Eiffel',
		val: 'eiffel'
	}, {
		title: 'EJS',
		val: 'ejs'
	}, {
		title: 'Elixir',
		val: 'elixir'
	}, {
		title: 'ELM',
		val: 'elm'
	}, {
		title: 'Erlang',
		val: 'erlang'
	}, {
		title: 'Forth',
		val: 'forth'
	}, {
		title: 'FTL',
		val: 'ftl'
	}, {
		title: 'G code',
		val: 'gcode'
	}, {
		title: 'Gherkin',
		val: 'gherkin'
	}, {
		title: 'Git Ignore',
		val: 'gitignore'
	}, {
		title: 'GLSL',
		val: 'glsl'
	}, {
		title: 'Gobstones',
		val: 'gobstones'
	}, {
		title: 'Golang',
		val: 'golang'
	}, {
		title: 'Groovy',
		val: 'groovy'
	}, {
		title: 'HAML',
		val: 'haml'
	}, {
		title: 'Handlebars',
		val: 'handlebars'
	}, {
		title: 'Haskell',
		val: 'haskell'
	}, {
		title: 'Haxe',
		val: 'haxe'
	}, {
		title: 'HTML',
		val: 'html'
	}, {
		title: 'Java',
		val: 'java'
	}, {
		title: 'Javascript',
		val: 'javascript'
	}, {
		title: 'JSON',
		val: 'json'
	}, {
		title: 'JSP',
		val: 'jsp'
	}, {
		title: 'Lean',
		val: 'lean'
	}, {
		title: 'Less CSS',
		val: 'less'
	}, {
		title: 'Liquid',
		val: 'liquid'
	}, {
		title: 'Lisp',
		val: 'lisp'
	}, {
		title: 'Livescript',
		val: 'livescript'
	}, {
		title: 'Lua',
		val: 'lua'
	}, {
		title: 'Makefile',
		val: 'makefile'
	}, {
		title: 'Markdown',
		val: 'markdown'
	}, {
		title: 'Matlab',
		val: 'matlab'
	}, {
		title: 'MySQL',
		val: 'mysql'
	}, {
		title: 'Objective C',
		val: 'objectivec'
	}, {
		title: 'Ocaml',
		val: 'ocaml'
	}, {
		title: 'Pascal',
		val: 'pascal'
	}, {
		title: 'Perl',
		val: 'perl'
	}, {
		title: 'PHP',
		val: 'php'
	}, {
		title: 'Powershell',
		val: 'powershell'
	}, {
		title: 'Prolog',
		val: 'prolog'
	}, {
		title: 'Python',
		val: 'python'
	}, {
		title: 'Razor',
		val: 'razor'
	}, {
		title: 'Ruby',
		val: 'ruby'
	}, {
		title: 'SASS CSS',
		val: 'sass'
	}, {
		title: 'Scheme',
		val: 'scheme'
	}, {
		title: 'SCSS',
		val: 'scss'
	}, {
		title: 'SH',
		val: 'sh'
	}, {
		title: 'SJS',
		val: 'sjs'
	}, {
		title: 'SQL',
		val: 'sql'
	}, {
		title: 'SQL Server',
		val: 'sqlserver'
	}, {
		title: 'SVG',
		val: 'svg'
	}, {
		title: 'Typescript',
		val: 'typescript'
	}, {
		title: 'Vala',
		val: 'vala'
	}, {
		title: 'VB script',
		val: 'vbscript'
	}, {
		title: 'XML',
		val: 'xml'
	}];

	return cp;
})();
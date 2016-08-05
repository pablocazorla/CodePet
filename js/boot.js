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
		}, {},function(err, dataObjects) {

			if(callback){
				callback.apply(null, [dataObjects]);
			}			
		});
	};
	cp.data.deleteBy = function(dataName, parameters,callback) {
		cp.data[dataName].remove(parameters, {multi: true },function(err, dataObjects) {
			if(callback){
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

	

	return cp;
})();
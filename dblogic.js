//"use strict";
const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;
const url = process.env.MONGOLAB_URI;
console.log('url mongo: ' + url);

let collection;

function connectAndDo(callback) {
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    console.log('Connection established');
	    collection = db.collection('url-shortener');

	    callback(collection, () => db.close());
	  }
	});
}

const api = {};

api.initDb = () => {
	connectAndDo((collection, done) => {

		collection.insert({
			'_id': 'urlToPos',
			value: {}
		});

		collection.insert({
			'_id': 'posToUrl',
			value: []
		});

		console.log('ADDED OK');

		done();
	});
};

api.addPair = (url, position) => {
	connectAndDo((collection, done) => {
		console.log('-> addPair');

		let content = collection.find({});
		content = content.toArray((err, docs) => {
			console.log(docs);
		});

		done();
	});
};

/*
api.addUrl = (url, callback) => {
	console.log('adding url: ' + url);
	connectAndDo((collection, done) => {
		// first checks if the url already exists
		let isStored = false;
		collection
				.find({_id: 'posToUrl'})
				.toArray((err, docs) => {
					let urlObj = docs[0].value;
					if (urlObj.hasOwnProperty(url)) {
						console.log('Url was alreday stored at position ' + pos);
						isStored = true;
						callback(pos);
					} else {
						console.log('It was not stored');

						let pos;
						let promises = [];
						collection.find({_id: 'posToUrl'})
								.toArray((err, docs) => {
									let posArr = docs[0].value;
									pos = posArr.length;

									collection.update({_id: 'posToUrl'},{
										$push: {value: url}
									});


									let setModifier = {$set: {}};
									setModifier.$set['value.' + url] = pos;
									console.log('Este es el set modifier');
									console.log(setModifier);

									// TODO el update no está funcionando
									collection.update({_id: 'urlToPos'}, 
									{
										setModifier
									},
									{
										upsert: true
									}, done);

									callback(pos);

								});
								}


				});
		
	});
};
*/
api.addUrl = (url, callback) => {
	connectAndDo((collection, done) => {
		let pos = 1;

		let setModifier = {$set: {}};
		setModifier.$set['value.' + url] = pos;

		collection.update({_id: 'urlToPos'}, setModifier, {upsert: true}, () => {
			callback(pos);
			done();
		});
	});
}

api.getUrl = (position) => {
	connectAndDo((collection, done) => {
		console.log('getUrl');

		let content = collection.find();
		console.log(content);

		done();
	});
};

api.getNextPosition = (callback) => {
	connectAndDo((collection, done) => {
		collection.find({_id: 'posToUrl'}).
				toArray((err, docs) => {
					console.log('llama desde getNextPosition');
					let data = docs[0].value;
					console.log(data);

					callback(data.length);

					done();
				})
	});
};

module.exports = api;
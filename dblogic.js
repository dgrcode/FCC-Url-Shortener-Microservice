//"use strict";
const mongodb = require("mongodb");
const encoder = require("custom-encoder")();
encoder.setBase('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

const MongoClient = mongodb.MongoClient;
const url = process.env.MONGOLAB_URI;
//console.log('url mongo: ' + url);

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

api.addPair = (url, position) => {
	connectAndDo((collection, closeDbConnection) => {
		console.log('-> addPair');

		let content = collection.find({});
		content = content.toArray((err, docs) => {
			console.log(docs);
		});

		closeDbConnection();
	});
};

/**
 * This function updates the current key, and return a promise
 * with the updated value.
 */
const getNewKey = () => new Promise((resolve, reject) => {
	connectAndDo((collection, closeDbConnection) => {
		let newKey;
		collection.find({_id: 'currentKey'}).toArray()
		.then(docs => {
			console.log('currentKey.toArray(): ');
			console.log(docs);
			newKey = docs[0].value;
			newKey++;

			console.log('va a actualizar el currentKey');
			collection.updateOne({_id: 'currentKey'}, {$set: {value: newKey}})
			.then(() => {
				console.log('currentKey gets updated: ' + newKey);
				resolve(newKey);
			}
			,reason => {
				console.log('There was an error updating currentKey: ');
				console.log(reason);
				reject(reason);
			});
			
		},
		err => {
			console.log('There was an error trying to read the current key: ');
			console.log(err);
			reject(err);
		});
	});
});

api.addUrl = (url, callback) => {
	connectAndDo((collection, closeDbConnection) => {
		let urlCursor = collection.find({url: url});
		console.log('urlCursor: ' + urlCursor);
		console.log('url: ' + url);

		urlCursor.count()
		.then(count => {
			console.log('cursor.count = ' + count);
			if (count !== 0) {
				// The url was already stored
				console.log('the url was already stored');
				urlCursor.toArray()
				.then((err, docs) => {
					closeDbConnection(); // close the database connection
					callback(docs[0].key);
				})
				.catch(reason => {
					console.log('cursor.toArray was rejected. Reason: ' + reason);
				});

			} else {
				// The url must be stored
				getNewKey()
				.then(newKey => {
					console.log('gets the new key: ' + newKey);

					// TODO tiene que archivarla para poder recuperarla.
					// El encoder no ha funcionado.
					console.log('codificada: ' + encoder.encode(newKey));
					callback(newKey);
				})
				.catch(reason => {
					console.log('getNewKey was rejected. Reason: ' + reason);
				});
			}
		})
		.catch(reason => {
			console.log('Cursor.count() was rejected. Reason: ' + reason);
		});
	});
}

api.getUrl = (position) => {
	connectAndDo((collection, closeDbConnection) => {
		console.log('getUrl');

		let content = collection.find();
		console.log(content);

		closeDbConnection();
	});
};

api.getNextPosition = (callback) => {
	connectAndDo((collection, closeDbConnection) => {
		collection.find({_id: 'posToUrl'}).
				toArray((err, docs) => {
					console.log('llama desde getNextPosition');
					let data = docs[0].value;
					console.log(data);

					callback(data.length);

					closeDbConnection();
				})
	});
};

module.exports = api;
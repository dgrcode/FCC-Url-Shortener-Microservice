//"use strict";
const mongodb = require("mongodb");
const encoder = require("custom-encoder")();
encoder.setBase('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._~:/?#[]@!$&\'()*+,;=%');

const MongoClient = mongodb.MongoClient;
const url = process.env.MONGOLAB_URI;

let collection;

/**
 * This function connects to the database and run the callback
 *
 * @param {function} callback. Is the callback passed to the function to be
 *   executed after the connection to the database has been established. The
 *   callback function is send two params:
 *     (database collection, database closing function)
 */
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

/**
 * This function updates the current key, and return a promise with the updated
 * value, so it can be used to store a new url.
 *
 * @returns {Promise}. This promise is resolved with the value of the updated
 *   numeric key, or rejected if there was an error during the read/update
 *   process.
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

/**
 * This function stores the url given as param in the database and call the
 * callback giving it the alphanumeric key used to store it.
 *
 * @param {string} url. The url to be stored in the database.
 * @param {function} callback. The function to be called passing the
 *   alphanumeric key used to store the url.
 */
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

/**
 * This function receives the alphanumeric key used to store the url and decode
 * it with custom-decoder to get the numeric key. Then uses that key to
 * retrieve the url from the database and call the callback passing the url as
 * parameter
 *
 * @param {string} key. Is the alphanumeric key given to the user when the url
 *   was stored.
 * @param {function} callback. The function to be called passing the url.
 */
api.getUrl = (key, callback) => {
	connectAndDo((collection, closeDbConnection) => {
		console.log('getUrl');

		// TODO pending to write the function

		let content = collection.find();
		console.log(content);

		closeDbConnection();
	});
};

module.exports = api;
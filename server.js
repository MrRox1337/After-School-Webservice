// Import dependencies modules:
const express = require("express");
const app = express();
const ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
// cost bodyParser = require('body-parser')

// Create an Express.js instance:
function config(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
	);

	next();
}

// Config express
app.use(express.json());
app.set("port", 3000);
app.use(config);

// Connect to MongoDB
let db;
MongoClient.connect("mongodb+srv://root:toor@cluster0.nkykp1g.mongodb.net/", (err, client) => {
	db = client.db("remedialSelect");
});

function root(req, res, next) {
	res.send("Select a collection, e.g., /collection/messages");
}

function setCollectionName(req, res, next, collectionName) {
	req.collection = db.collection(collectionName);
	return next();
}

function retrieveObjects(req, res, next) {
	req.collection.find({}).toArray((e, results) => {
		if (e) return next(e);
		res.send(results);
	});
}

function addObject(req, res, next) {
	req.collection.insert(req.body, (e, results) => {
		if (e) return next(e);
		res.send(results.ops);
	});
}

function getOneObject(req, res, next) {
	req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
		if (e) return next(e);
		res.send(result);
	});
}

function updateObject(req, res, next) {
	req.collection.update(
		{ _id: new ObjectID(req.params.id) },
		{ $set: req.body },
		// "safe" is used to wait for the process to complete before executing mongodb code
		// "multi" false is to ensure only one document is updated.
		{ safe: true, multi: false },
		// When 1 document is updated, return success, else error
		(e, result) => {
			if (e) return next(e);
			res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
		}
	);
}

function deleteObject(req, res, next) {
	req.collection.deleteOne({ _id: ObjectID(req.params.id) }, (e, result) => {
		if (e) return next(e);
		res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
	});
}

// Display a message for root path to show that API is working
app.get("/", root);

// Get the collection name
app.param("collectionName", setCollectionName);

// Retrieve all the objects from a collection
app.get("/collection/:collectionName", retrieveObjects);

// Insert an object into collection
app.post("/collection/:collectionName", addObject);

// Get one document from collection
app.get("/collection/:collectionName/:id", getOneObject);

// Update existing document inside a collection
app.put("/collection/:collectionName/:id", updateObject);

// Delete a document from the collection
app.delete("/collection/:collectionName/:id", deleteObject);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("Express.js server running at localhost:" + port);
});

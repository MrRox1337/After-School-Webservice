// Import dependencies modules:
const express = require("express");
// cost bodyParser = require('body-parser')

// Create an Express.js instance:
const app = express();

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
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect("mongodb+srv://root:root@cluster0.nkykp1g.mongodb.net/", (err, client) => {
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

// Display a message for root path to show that API is working
app.get("/", root);

// Get the collection name
app.param("collectionName", setCollectionName);

// Retrieve all the objects from a collection
app.get("/collection/:collectionName", retrieveObjects);

// Insert document into collection
app.post("/collection/:collectionName", addObject);

app.listen(3000, () => {
	console.log("Express.js server running at localhost:3000");
});

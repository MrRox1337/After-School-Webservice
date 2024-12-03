// ----------- Import dependencies modules: -----------
const express = require("express");
const app = express();
const ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const path = require("path");

// ----------- API Middleware -----------

// Create an Express.js instance:
function config(req, res, next) {
	/**
	 * Middleware function to set CORS headers for the response.
	 * Ensures the server can handle requests from any origin.
	 */
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
	);

	next();
}
// Logger Middleware:
function logger(req, res, next) {
	/**
	 * Middleware function to print the time, url, and method
	 * of the called route from the front-end.
	 */
	const method = req.method;
	const url = req.url;
	const timestamp = new Date();

	console.log(`[${timestamp}] ${method} request to ${url}`);

	next();
}

// Config express
app.use(express.json()); // Middleware to parse incoming JSON requests.
app.set("port", 3000); // Sets the default port for the application.
app.use(config); // Applies the CORS middleware globally.
app.use(logger); // Use the logger middleware

// Connect to MongoDB
let db;
/**
 * Establishes a connection to the MongoDB database.
 * Uses environment variables for connection string and database name.
 */
MongoClient.connect(process.env.CONNECTION_STRING, (err, client) => {
	if (err) throw err; // Throws an error if the connection fails.
	db = client.db(process.env.DATABASE);
});

// ----------- Route actions -----------

// Absolute path for serving static content
var imagePath = path.resolve(__dirname, "static");
/**
 * `imagePath` holds the resolved absolute path to the "static" directory.
 * This is used to serve lesson images via Express.js.
 */

function root(req, res, next) {
	/**
	 * Root route handler.
	 *
	 * @param req - HTTP request object.
	 * @param res - HTTP response object. Sends a simple message.
	 * @param next - Function to proceed to the next middleware (not used here).
	 */
	console.log("Accessed root endpoint");
	res.send("Select a collection, e.g., /collection/messages");
}

function setCollectionName(req, res, next, collectionName) {
	/**
	 * Middleware to dynamically set the collection name for a request.
	 *
	 * @param req - HTTP request object. The `collection` property is set to the desired MongoDB collection.
	 * @param res - HTTP response object.
	 * @param next - Function to proceed to the next middleware or route.
	 * @param collectionName - The name of the MongoDB collection to interact with.
	 */
	console.log(`Collection set to: ${collectionName}`);
	req.collection = db.collection(collectionName);
	return next();
}

function retrieveObjects(req, res, next) {
	/**
	 * Retrieves all documents from the specified MongoDB collection.
	 *
	 * @param req - HTTP request object. Contains the target collection in `req.collection`.
	 * @param res - HTTP response object. Sends back all documents in the collection as an array.
	 * @param next - Function to handle errors if they occur.
	 */
	console.log(`Retrieving objects from collection: ${req.params.collectionName}`);
	req.collection.find({}).toArray((e, results) => {
		if (e) return next(e); // Handles database errors.
		res.send(results); // Sends back the array of documents.
	});
}

function addObject(req, res, next) {
	/**
	 * Inserts a new document into the specified MongoDB collection.
	 *
	 * @param req - HTTP request object. Contains the data to insert in `req.body`.
	 * @param res - HTTP response object. Sends back the newly inserted document(s).
	 * @param next - Function to handle errors if they occur.
	 */
	console.log(`Adding an object to collection: ${req.params.collectionName}`);
	req.collection.insert(req.body, (e, results) => {
		if (e) return next(e); // Handles database errors.
		console.log("Object added:", results.ops); // Logs the inserted document(s).
		res.send(results.ops); // Sends back the inserted document(s).
	});
}

function updateObject(req, res, next) {
	/**
	 * Updates an existing document by its ID in the specified MongoDB collection.
	 *
	 * @param req - HTTP request object. Contains the document ID in `req.params.id` and update data in `req.body`.
	 * @param res - HTTP response object. Sends a success or error message.
	 * @param next - Function to handle errors if they occur.
	 */
	console.log(
		`Updating object in collection: ${req.params.collectionName} with ID: ${req.params.id}`
	);
	req.collection.update(
		{ _id: new ObjectID(req.params.id) }, // Filter by document ID.
		{ $set: req.body }, // Fields to update.
		{ safe: true, multi: false }, // Ensures only one document is updated safely.
		(e, result) => {
			if (e) return next(e); // Handles database errors.
			console.log(
				result.result.n === 1 ? "Object updated successfully" : "Object update failed"
			);
			res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
		}
	);
}

function searchObject(req, res, next) {
	/**
	 * Searches documents in the specified MongoDB collection using a query string.
	 *
	 * @param req - HTTP request object. Contains the search query in `req.query.query`.
	 * @param res - HTTP response object. Sends back matching documents.
	 * @param next - Function to handle errors if they occur.
	 */
	const searchQuery = req.query.query || "";
	console.log(`Searching in collection: ${req.params.collectionName} with query: ${searchQuery}`);
	const searchRegex = new RegExp(searchQuery, "i"); // Case-insensitive regex for search.

	// Search in multiple fields: subject, spaces, location, and price
	req.collection
		.find({
			$or: [
				{ subject: searchRegex },
				{ location: searchRegex },
				{ price: { $regex: searchRegex } },
				{ spaces: { $regex: searchRegex } },
			],
		})
		.toArray((e, results) => {
			if (e) return next(e); // Handles database errors.
			console.log(`Search results: ${results.length} documents found`);
			res.send(results); // Sends back the search results.
		});
}

// ----------- API Routes -----------

app.get("/", root); // Handles the root route.

app.param("collectionName", setCollectionName); // Middleware to set the collection name dynamically.

app.get("/collection/:collectionName", retrieveObjects); // Retrieves all documents from a collection.

app.post("/collection/:collectionName", addObject); // Adds a new document to a collection.

app.put("/collection/:collectionName/:id", updateObject); // Updates a document by ID.

app.get("/search/:collectionName", searchObject); // Searches a collection based on a query string.

app.use("/static", express.static(imagePath)); // Serves static files from the "static" directory.

// ----------- Start the server -----------

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("Express.js server running at localhost:" + port);
});

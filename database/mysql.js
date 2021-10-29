require("dotenv").config()

const mysql = require("mysql2/promise")
const PRODUCT_TABLE = "products"
const MVP_REVIEWS_TABLE = "reviews_mvp"
const V2_REVIEWS_TABLE = "reviews_v2"

let pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: process.env.MYSQL_DB_NAME
})

/**
 * A shortcut to re-initialize the entire database during testing.
 * Will not be exposed to the final API.
 */
async function initialize() {
	// Drop the tables
	await dropTable(MVP_REVIEWS_TABLE)
	// await dropTable(V2_REVIEWS_TABLE) // Uncomment when ready to work on V2.
	await dropTable(PRODUCT_TABLE)

	// Initialize the product table with its default entry.
	const PRODUCT_COLUMNS = "(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))"
	const DEFAULT_PRODUCT_COLUMNS = "(name)"
	const DEFAULT_PRODUCT_VALUES = [["The Minimalist Entrepreneur"]]
	await initializeTable(
		PRODUCT_TABLE,
		PRODUCT_COLUMNS,
		DEFAULT_PRODUCT_COLUMNS,
		DEFAULT_PRODUCT_VALUES
	)

	// Initialize the reviews tables.
	await initializeReviewsTable(MVP_REVIEWS_TABLE)
	// await initializeReviewsTable(V2_REVIEWS_TABLE)
	// Uncomment the v2 table when ready to work on the v2 integration.
}

async function dropTable(table) {
	try {
		const connection = await pool.getConnection()
		await connection.execute(`DROP TABLE IF EXISTS ${table}`)
		connection.release()
	} catch (e) {
		let message = "Failed to drop one of the tables."
		console.error(message)
		console.error(e)
		throw new Error(message)
	}
}

/**
 * Initialize the given reviews table. Used for both the MVP table and the V2 table.
 * @param {string} table The name of the table to initialize.
 */
// This function needs to be updated with a foreign key
// that references the products table.
async function initializeReviewsTable(table) {
	let columns = `(id INT AUTO_INCREMENT PRIMARY KEY, productId INT, rating INT, review VARCHAR(255), FOREIGN KEY (productId) REFERENCES ${PRODUCT_TABLE}(id) ON DELETE CASCADE)`
	let defaultColumns = "(productId, rating, review)"
	let products = await getProducts()
	let productId = products[0].id // Grab the Id for 'The Minimalist Entrepreneur'
	let defaultValues = [
		[productId, 4, "book was full of fluff"],
		[productId, 3, "book was fluff"],
		[productId, 4, "book was amazing"]
	]
	await initializeTable(table, columns, defaultColumns, defaultValues)
}

/**
 * An abstraction meant to pull the common MySQL code out from the table
 * initialization functions in order to apply the DRY principle.
 * @param {string} table The name of the table to initialize.
 * @param {string} columns The list of columns that should be in the table, given as a string.
 * @param {string} defaultColumns The list of columns to use to insert the default values into the table, given as a string.
 * @param {Array} defaultValues The list of default values.
 */
async function initializeTable(
	table,
	columns,
	defaultColumns = null,
	defaultValues = null
) {
	try {
		const connection = await pool.getConnection()

		// Create the table
		await connection.execute(`CREATE TABLE ${table} ${columns}`)

		// Insert the default values (values that should be pre-populated)
		if (defaultColumns !== null && defaultValues !== null) {
			await connection.query(`INSERT INTO ${table} ${defaultColumns} VALUES ?`, [
				defaultValues
			])
		}

		connection.release()
	} catch (e) {
		let message = `Unable to initialize the ${table} table.`
		console.error(message)
		console.error(e)
		throw new Error(message)
	}
}

async function getProducts() {
	try {
		const connection = await pool.getConnection()
		let sql = `SELECT * FROM ${PRODUCT_TABLE}`
		let results = await connection.execute(sql)
		connection.release()
		return results[0]
	} catch (e) {
		let message = "Unable to retrieve the products."
		console.error(message)
		console.error(e)
		throw new Error(message)
	}
}

async function addReview(table, productId, rating, review) {
	try {
		const connection = await pool.getConnection()
		await connection.execute(
			`INSERT INTO ${table} (productId, rating, review) VALUES (${productId}, ${rating}, "${review}")`
		)
		connection.release()
	} catch (e) {
		let message = `Unable to add review to ${table}.`
		console.error(message)
		console.error(e)
		throw new Error(message)
	}
}

async function getReviews(table, productId = null) {
	try {
		const connection = await pool.getConnection()
		let sql = `SELECT rating, review FROM ${table}${
			productId === null ? "" : ` WHERE productId = ${productId}`
		}`
		let results = await connection.execute(sql)
		connection.release()
		return results[0]
	} catch (e) {
		let message = `Unable to get reviews from ${table}`
		console.error(message)
		console.error(e)
		throw new Error(message)
	}
}

async function getAverageRating(table, productId = null) {
	try {
		const connection = await pool.getConnection()
		let sql = `SELECT ROUND(AVG(rating), 1) AS averageRating FROM ${table}${
			productId === null ? "" : ` WHERE productId = ${productId}`
		}`
		let results = await connection.execute(sql)
		connection.release()
		return results[0][0].averageRating
	} catch (e) {
		let message = `Unable to calculate average rating for ${table}.`
		console.error(message)
		console.error(e)
		throw new Error(message)
	}
}

exports.MVP_REVIEWS_TABLE = MVP_REVIEWS_TABLE
exports.V2_REVIEWS_TABLE = V2_REVIEWS_TABLE
exports.initialize = initialize
exports.initializeReviewsTable = initializeReviewsTable
exports.getProducts = getProducts
exports.addReview = addReview
exports.getReviews = getReviews
exports.getAverageRating = getAverageRating

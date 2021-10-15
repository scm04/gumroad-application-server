require("dotenv").config()

const mysql = require("mysql2/promise")

let pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: process.env.MYSQL_DB_NAME
})

async function initialize(table) {
	try {
		const connection = await pool.getConnection()
		// Drop and create the table
		await connection.execute(`DROP TABLE IF EXISTS ${table}`)
		await connection.execute(
			`CREATE TABLE ${table} (id INT AUTO_INCREMENT PRIMARY KEY, rating INT, review VARCHAR(255))`
		)
		// Insert the reviews that should already be populated.
		let sql = `INSERT INTO ${table} (rating, review) VALUES ?`
		let values = [
			[4, "book was full of fluff"],
			[3, "book was fluff"],
			[4, "book was amazing"]
		]
		await connection.query(sql, [values])
		connection.release()
	} catch (e) {
		console.error(`Unable to initialize the ${table} table.`)
		console.error(e)
	}
}

async function addReview(table, rating, review) {
	try {
		const connection = await pool.getConnection()
		let sql = `INSERT INTO ${table} (rating, review) VALUES (${rating}, "${review}")`
		await connection.execute(sql)
		connection.release()
	} catch (e) {
		console.error(`Unable to add review to ${table}.`)
		console.error(e)
	}
}

async function getReviews(table) {
	try {
		const connection = await pool.getConnection()
		let sql = `SELECT rating, review FROM ${table}`
		let results = await connection.execute(sql)
		// console.log(results[0])
		connection.release()
		return results[0]
	} catch (e) {
		console.error(`Unable to get reviews from ${table}`)
		console.error(e)
	}
}

async function getAverageRating(table) {
	try {
		const connection = await pool.getConnection()
		let sql = `SELECT ROUND(AVG(rating), 1) AS averageRating FROM ${table}`
		let results = await connection.execute(sql)
		// console.log(results[0][0].averageRating)
		connection.release()
		return results[0][0].averageRating
	} catch (e) {
		console.error(`Unable to calculate average rating for ${table}.`)
		console.error(e)
	}
}

exports.initialize = initialize
exports.addReview = addReview
exports.getReviews = getReviews
exports.getAverageRating = getAverageRating

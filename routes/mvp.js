const express = require("express")
const router = express.Router()

const {
	MVP_REVIEWS_TABLE,
	initializeReviewsTable,
	addReview,
	getReviews,
	getAverageRating
} = require("../database/mysql")

router.get("/reviews", async (req, res) => {
	console.log("retrieving MVP reviews")
	// retrieve all reviews from the MVP reviews table
	// and calculate the average rating
	try {
		let results = await getReviewsAndAverageRating()
		res.status(200).json(results)
	} catch (e) {
		let message = "Error retrieving MVP reviews!"
		console.error(message)
		console.error(e)
		res.status(500).send(message)
	}
})

router.post("/reviews/add", async (req, res) => {
	// take body and add review to MVP reviews table
	console.log("adding MVP review")
	try {
		await addReview(
			MVP_REVIEWS_TABLE,
			req.body.productId,
			req.body.rating,
			req.body.review
		)
		let results = await getReviewsAndAverageRating()
		res.status(200).json(results)
	} catch (e) {
		let message = "Error adding review!"
		console.error(message)
		console.error(e)
		res.status(500).send(message)
	}
})

router.get("/reviews/:productId", async (req, res) => {
	console.log(`retrieving MVP reviews for product ID ${req.params.productId}`)
	// retrieve all reviews from the MVP reviews table
	// and calculate the average rating
	try {
		let results = await getReviewsAndAverageRating(req.params.productId)
		res.status(200).json(results)
	} catch (e) {
		let message = "Error retrieving MVP reviews!"
		console.error(message)
		console.error(e)
		res.status(500).send(message)
	}
})

async function getReviewsAndAverageRating(productId = null) {
	let results = await Promise.all([
		getAverageRating(MVP_REVIEWS_TABLE, productId),
		getReviews(MVP_REVIEWS_TABLE, productId)
	])
	return {
		averageRating: results[0],
		reviews: results[1]
	}
}

router.get("/reset", async (req, res) => {
	// re-initialize the database tables
	console.log("resetting the MVP reviews table")
	try {
		await initializeReviewsTable(MVP_REVIEWS_TABLE)
		res.status(200).send("reset complete")
	} catch (e) {
		let message = "Error executing MVP reset!"
		console.error(message)
		console.error(e)
		res.status(500).send(message)
	}
})

module.exports = router

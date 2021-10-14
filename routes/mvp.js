const express = require("express")
const router = express.Router()

const {
	initialize,
	addReview,
	getReviews,
	getAverageRating
} = require("../database/mysql")
const TABLE = "reviews_mvp"

router.get("/", async (req, res) => {
	console.log("retrieving MVP reviews")
	// retrieve all reviews from the MVP reviews table
	// and calculate the average rating
	let results = await getReviewsAndAverageRating()
	res.json(results)
})

router.post("/addReview", async (req, res) => {
	// take body and add review to MVP reviews table
	console.log("adding MVP review")
	await addReview(TABLE, req.body.rating, req.body.review)
	let results = await getReviewsAndAverageRating()
	res.json(results)
})

async function getReviewsAndAverageRating() {
	let results = await Promise.all([getAverageRating(TABLE), getReviews(TABLE)])
	return {
		averageRating: results[0],
		reviews: results[1]
	}
}

router.get("/reset", async (req, res) => {
	// re-initialize the database tables
	console.log("resetting the MVP reviews table")
	await initialize(TABLE)
	res.status(200).send("reset complete")
})

module.exports = router

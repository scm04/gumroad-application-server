const express = require("express")
const router = express.Router()

let reviews = [
	{ rating: 4, review: "book was full of fluff" },
	{ rating: 3, review: "book was fluff" },
	{ rating: 4, review: "book was amazing" }
]

router.get("/", (req, res) => {
	console.log("retrieving MVP reviews")
	// retrieve all reviews from the MVP reviews table
	// and calculate the average rating
	res.json({
		averageRating: calculateAverageRating(),
		reviews
	})
})

router.post("/addReview", (req, res) => {
	// take body and add review to MVP reviews table
	console.log("adding MVP review")
	reviews.push(req.body)
	res.json({
		averageRating: calculateAverageRating(),
		reviews
	})
})

function calculateAverageRating() {
	const averageRating =
		reviews.reduce((total, current) => {
			return total + current.rating
		}, 0) / reviews.length
	return Math.round(averageRating * 10) / 10
}

module.exports = router

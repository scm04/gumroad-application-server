const express = require("express")
const router = express.Router()

let reviews = [
	{ rating: 4, review: "book was full of fluff" },
	{ rating: 3, review: "book was fluff" },
	{ rating: 4, review: "book was amazing" }
]

router.get("/", (req, res) => {
	console.log("retrieving v2 reviews")
	// retrieve all reviews from the V2 reviews table
	// and calculate the average rating
	const averageRating =
		reviews.reduce((total, current) => {
			return total + current.rating
		}, 0) / reviews.length
	res.json({
		averageRating: Math.round(averageRating * 10) / 10,
		reviews
	})
})

router.post("/addReview", (req, res) => {
	// take body and add review to V2 reviews table
	console.log("adding V2 review")
	console.log(req.body)
	// reviews.push(req.body)
})

module.exports = router

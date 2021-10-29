const express = require("express")
const server = express()
server.use(express.json())

const cors = require("cors")
server.use(cors({ origin: "*" }))

const { initialize, getProducts } = require("./database/mysql")

server.get("/products", async (req, res) => {
	console.log("Retrieving products list.")
	try {
		let results = await getProducts()
		console.log(results)
		res.status(200).json(results)
	} catch (e) {
		console.error(e)
		res.status(500).send("Server error retrieving products.")
	}
})

server.get("/reset", async (req, res) => {
	// reset the tables and populate them with the default data
	// this route is only for testing and demonstration purposes
	// and will likely be removed in the final API
	try {
		await initialize()
		res.status(200).send("Database reset successful!")
	} catch (e) {
		console.error(e)
		res.status(500).send("Server error resetting database.")
	}
})

const mvpRouter = require("./routes/mvp")
server.use("/mvp", mvpRouter)

const v2Router = require("./routes/v2")
server.use("/v2", v2Router)

server.listen(3000)

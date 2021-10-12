const express = require("express")
const server = express()
server.use(express.json())

const cors = require("cors")
server.use(cors({ origin: "*" }))

server.get("/reset", (req, res) => {
	// reset the tables and populate them with the default data
	// this route is only for testing and demonstration purposes
})

const mvpRouter = require("./routes/mvp")
server.use("/mvp", mvpRouter)

const v2Router = require("./routes/v2")
server.use("/v2", v2Router)

server.listen(3000)

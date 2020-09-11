const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const indexRouter = require('./routers/index')
const path = require('path')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(bodyParser.json())

app.use('/', indexRouter)

const port = parseInt(process.env.httpPort) || 3000
http.createServer(app).listen(port)

app.use(function(err, req, res, next) {
	res.status(err.status || 500)
})

const main = async () => {
  const http = require('http')
  const express = require('express')
  const bodyParser = require('body-parser')
  const app = express()
  const indexRouter = require('./routers/index')
  const textParser = require('./textParser')
  await textParser.dataReady()

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(bodyParser.json())
  app.set('textPaser', textParser)
  app.use('/', indexRouter)

  const port = parseInt(process.env.httpPort) || 3000
  http.createServer(app).listen(port)
  console.log('server listening on', port)
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
  })
}
main()

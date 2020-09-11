const express = require('express')
const router = express.Router()



router.get('/names', async (req, res) => {
	const textParser = req.app.get('textPaser');
	res.send(textParser.getNameCount())
})

router.get('/name-count', async (req, res) => {
	const textParser = req.app.get('textPaser');
	const key = Object.keys(req.query)[0]
	const count = textParser.getNameCount()[key]
	res.send({[key]: count})
})


module.exports = router

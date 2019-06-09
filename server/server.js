const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const {parseFile} = require('../src')

app.set('port', process.env.PORT || 3000)
app.use(bodyParser.text())

app.get('/', (req, res) => {
	res.send('ScrapperScript Server by Tiago Danin')
})

app.post('/', async (req, res) => {
	const data = await parseFile(req.body)
	res.json(data)
})

app.listen(app.get('port'), () => {
	console.log('[+] Port:', app.get('port'))
})

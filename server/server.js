const express = require('express')
const bodyParser = require('body-parser')
const app_express = express()
const { parseFile } = require('../src')

const port = process.env.PORT
if (!port) {
	console.log('Set env: PORT')
	console.log('E.g: export PORT=3000')
	return
}

app_express.set('port', process.env.PORT)
app_express.use(bodyParser.text())

app_express.get('/', (req, res) => {
	res.send('ScrapperScript Server by Tiago Danin')
})

app_express.post('/', async (req, res) => {
	var data = await parseFile(req.body)
	res.json(data)
})

app_express.listen(app_express.get('port'), () => {
	console.log('[+] Port: ', app_express.get('port'))
})

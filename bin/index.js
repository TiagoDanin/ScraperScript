#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const {parseFile} = require('../src')

const file = process.argv[1]
if (file) {
	const filePath = path.resolve(process.cwd() + '/' + file)
	const fileRaw = fs.readFileSync(filePath).toString()
	parseFile(fileRaw).then(r => console.log(r)) // eslint-disable-line promise/prefer-await-to-then
} else {
	console.log('Use: scrapperscript myFile')
}

#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { parseFile } = require('../src')

var file = process.argv[1]
if (!file) {
	console.log('Use: scrapperscript myFile')
	return
}
var filePath = path.resolve(process.cwd() + '/' +  file)
var fileRaw = fs.readFileSync(filePath).toString()
parseFile(fileRaw).then((r) => console.log(r))

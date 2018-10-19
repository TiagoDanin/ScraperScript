const next = (index, tags) => {
	return tags.splice(index+1, tags.length).join(' ')
}

const isString = (str) => {
	if (typeof str == 'string' && str.startsWith('"')) {
		return (str.replace(/^"/, '')).replace(/"$/, '')
	}
	return false
}

const parse = (input, html) => {
	if (Array.isArray(input)) {
		input = input.join(' ')
	}

	var tags = input.toString().split(' ')
	var data = tags.reduce((total, current, index) => {
		/*
		console.log('------------------')
		console.log('total:', total)
		console.log('current:', current)
		console.log('index:', index)
		console.log('tags:', tags)
		*/
		if (!total && total === false) {
			return false
		} else if (total && total.output) {
			return false
		} else if (total && total.stop) {
			return total
		}
		switch(current) {
			case '!!': {
				var comment = next(index, tags)
				if (input.startsWith('!!'))	{
					total.output = comment
				}
				break
			}
			case '>>': {
				total.select += ' > '
				break
			}
			case '==': {
				total.output = parse(total.select, html)
				var nextIndex = next(index, tags)
				if (isString(nextIndex) && isString(nextIndex) === total.output) {
					return total
				} else if (total.output === parse(nextIndex, html)) {
					break
				}
				return false
			}
			case '~=': {
			}
			case '||': {
				total.output = parse(total.select, html)
				if (total.output) {
					total.stop = true
					break
				}

				var nextIndex = next(index, tags)
				if (isString(nextIndex)) {
					total.output += isString(nextIndex)
					break
				}
				total.output = parse(nextIndex, html)
				break
			}
			case '++': {
				total.output = parse(total.select, html)
				var nextIndex = next(index, tags)
				if (isString(nextIndex)) {
					total.output += isString(nextIndex)
					break
				}

				var addOutput = parse(nextIndex, html)
				if (Array.isArray(total.output)) {
					total.select = [].concat(total.output, addOutput)
				} else if (typeof total.output == 'object') {
					total.output = {
						...addOutput,
						...total.output
					}
				}
				total.output += addOutput
				break
			}
			case '--': {
				var nextIndex = next(index, tags)
				var removeRaw = ''
				var output = parse(total.select, html)
				if (isString(nextIndex)) {
					removeRaw = isString(nextIndex)
				} else {
					removeRaw = parse(nextIndex, html)
				}

				if (output && output.replace && typeof output.replace == 'function') {
					total.output = output.replace(removeRaw, '')
				} else {
					total.output = output - removeRaw
				}
				break
			}
			case '@>': {
				total.table = next(index, tags)
				break
			}
			default: {
				total.select += current
				break
			}
		}
		return total
	}, {
		select: '',
		output: '',
		table: false,
		stop: false
	})

	if (!data) {
		return false
	} else if (data.output && data.output !== '') {
		return data.output
	} else if (data.select && data.table || data.table === '') {
		var select = data.table
		var nameOfIndex = 'index'
		var nameOfData = 'data'
		var type = 'string' //array or object
		if (select.startsWith('{')) {
			type = 'object'
			select = select.split(',')
			nameOfIndex = select[0]
			nameOfData = select[1]
			select = select.splice(2, select.length)
				.join(',')
				.replace(/^{/, '')
				.replace(/}$/, '')
		} else if (select.startsWith('[')) {
			type = 'array'
			select = (select.replace(/^\[/, '')).replace(/]$/, '')
		}

		var table = html(data.select).map((index, elem) => {
			var parseRaw = parse(select, html(elem))
			if (type == 'object') {
				var arrayOutput = {}
				arrayOutput[nameOfIndex] = index
				arrayOutput[nameOfData] = parseRaw
				return arrayOutput
			}
			return parseRaw
		}).get()
		if (type == 'string') {
			return table.join(', ')
		}
		return table
	} else if (typeof data.select == 'string' || data.select) {
		if (data.select === '') {
			return html.text()
		}

		if (typeof html == 'function') {
			return html(data.select).text()
		} else if (typeof html == 'object' && typeof html.children == 'function') {
			return html.children(data.select).text()
		} else if (typeof html.text == 'function') {
			return html.text()
		}
		//TODO: Error
		return 'ERRRO!'
	}
	return false
}

const cheerio = require('cheerio')

/*
var html = cheerio.load(`
<div class="title">
	<h2>Hello world</h2>
</div>
`)
console.log(parse('!! my comment in ScrapperScript', html))
//my comment in ScrapperScript
console.log(parse('div >> h2 !! my comment in ScrapperScript', html))
//Hello world
console.log(parse('div >> h2 == "Hello world"', html))
//Hello world
*/

/*
var html = cheerio.load(`
<div class="title">
	<h2>Hello world</h2>
	<h2>Hello world</h2>
	<h2>Hello world</h2>
</div>
`)
console.log(parse('div >> h2 @> {number, text, == "Hello world"}', html))
//[
//{ '{number': 0, ' text': 'Hello world' },
//{ '{number': 1, ' text': 'Hello world' },
//{ '{number': 2, ' text': 'Hello world' }
//]
console.log(parse('div >> h2 @> []', html))
//[ 'Hello world', 'Hello world', 'Hello world' ]
console.log(parse('div >> h2 @> ', html))
//Hello world, Hello world, Hello world
*/

/*
var html = cheerio.load(`
<div class="title">
	<h2>Title: <label>Hello world</label></h2>
	<h2>Title: <label>Hello world</label></h2>
	<h2>Title: <label>Hello world</label></h2>
</div>
`)
console.log(parse('div >> h2 @> {number, text, label == "Hello world"}', html))
//[
//{ '{number': 0, ' text': 'Hello world' },
//{ '{number': 1, ' text': 'Hello world' },
//{ '{number': 2, ' text': 'Hello world' }
//]
console.log(parse('div >> h2 @> [label]', html))
//[ 'Hello world', 'Hello world', 'Hello world' ]
console.log(parse('div >> h2 @> label', html))
//Hello world, Hello world, Hello world
*/

/*
var html = cheerio.load(`
<div>
	<h1>Tiago</h1>
	<h2>Danin</h2>
</div>
`)
console.log(parse('h1 ++ h2', html))
//TiagoDanin
console.log(parse('h1 ++ "2018"', html))
//Tiago2018
console.log(parse('h3 || h1', html))
//Tiago
console.log(parse('h3 || "2018"', html))
//2018
console.log(parse('h3 || h4 || h1 ++ h2 ++ "."', html))
//TiagoDanin.
console.log(parse('h1 -- "Tia"', html))
//go
*/

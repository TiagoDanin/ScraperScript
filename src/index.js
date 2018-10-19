const next = (index, tags) => {
	if (tags && tags[index+1]) {
		return tags.splice(index+1, tags.length).join(' ')
	}
	return false
}

const parse = (input, html, output) => {
	if (input === false) {
		return ''
	}
	if (typeof output !== 'string' || !output) {
		var output = ''
	}
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
		} else if (total && total.stop) {
			return total
		} else if (total && total.isString) {
			if (current === '"') {
				total.stop = true
				var hasInput = next(index, tags)
				if (hasInput) {
					total.output = parse(
						hasInput, html, total.output.replace(/\s$/,'')
					)
				} else {
					total.output = total.output.replace(/\s$/,'')
				}
				return total
			}
			total.output += current + ' '
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
			case '"': {
				total.isString = true
				break
			}
			case '>>': {
				total.select += ' > '
				break
			}
			case '==': {
				total.output = total.output || parse(total.select, html)
				var nextIndex = next(index, tags)
				if (total.output === parse(nextIndex, html)) {
					break
				}
				return false
			}
			case '~=': {
			}
			case '||': {
				total.output = total.output || parse(total.select, html)
				if (total.output) {
					total.stop = true
					break
				}

				var nextIndex = next(index, tags)
				total.output = parse(nextIndex, html)
				break
			}
			case '++': {
				total.output = total.output || parse(total.select, html)
				var nextIndex = next(index, tags)
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
				var removeRaw = parse(nextIndex, html)
				var output = total.output || parse(total.select, html)

				if (output && output.replace && typeof output.replace == 'function') {
					total.output = output.replace(removeRaw, '')
					break
				}
				total.output = output - removeRaw
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
		output: output,
		table: false,
		stop: false,
		isString: false
	})

	if (!data) {
		return false
	} else if (data.output && data.output !== '') {
		return data.output
	} else if (typeof data.output !== 'string') {
		return data.output
	} else if (data.select && data.table || data.table === '') {
		var select = data.table
		var nameOfIndex = 'index'
		var nameOfData = 'data'
		var type = 'string' //array or object
		if (select.startsWith('{')) {
			type = 'object'
			select = ((select.replace(/^{/, '')).replace(/}$/, '')).split(',')
			nameOfIndex = select[0].replace(/\s/, '')
			nameOfData = select[1].replace(/\s/, '')
			select = select.splice(2, select.length).join(',')
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
	} else if (typeof data.select == 'string') {
		if (data.select === '') {
			return html.text()
		} else {
			if (typeof html == 'function') {
				return html(data.select).text()
			} else if (typeof html == 'object' && typeof html.children == 'function') {
				return html.children(data.select).text()
			} else if (typeof html.text == 'function') {
				return html.text()
			}
		}
		//TODO: Error
		return 'ERRRO!'
	}
	return false
}

module.exports = parse

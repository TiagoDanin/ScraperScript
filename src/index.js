const cheerio = require('cheerio')
const axios = require('axios')
const stringify = require('json-stringify-safe')

const next = (index, tags) => {
	if (tags && tags[index+1]) {
		return tags.splice(index+1, tags.length).join(' ')
	}
	return false
}

const parseQuery = (input, html, output) => {
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
		if (!total && total === false) {
			return false
		} else if (total && total.stop) {
			return total
		} else if (total && total.isString) {
			if (current === '"') {
				total.stop = true
				var hasInput = next(index, tags)
				if (hasInput) {
					total.output = parseQuery(
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
			case '~=': {
				total.output = total.output || parseQuery(total.select, html)
				var nextIndex = next(index, tags)
				if (total.output === parseQuery(nextIndex, html)) {
					break
				}
				return false
			}
			case '==': {
				total.output = total.output || parseQuery(total.select, html)
				var nextIndex = next(index, tags)
				if (total.output === parseQuery(nextIndex, html)) {
					break
				}
				return false
			}
			case '||': {
				total.output = total.output || parseQuery(total.select, html)
				if (total.output) {
					total.stop = true
					break
				}

				var nextIndex = next(index, tags)
				total.output = parseQuery(nextIndex, html)
				break
			}
			case '++': {
				total.output = total.output || parseQuery(total.select, html)
				var nextIndex = next(index, tags)
				var addOutput = parseQuery(nextIndex, html)

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
				var removeRaw = parseQuery(nextIndex, html)
				var output = total.output || parseQuery(total.select, html)

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
			var queryRaw = parseQuery(select, html(elem))
			if (type == 'object') {
				var arrayOutput = {}
				arrayOutput[nameOfIndex] = index
				arrayOutput[nameOfData] = queryRaw
				return arrayOutput
			}
			return queryRaw
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
	}
	return {
		error: true,
		msg: `"${data.select}"  is invalid`
	}
}

const parseValues = (input) => {
	var match = input.match(/^-\s([_-\w]*):\s*(.*)\s*:(\w*)/)
	if (!match) {
		return false
	}
	return output = {
		key: match[1],
		query: match[2],
		type: match[3]
	}
}

const parseHtml = (input) => {
	return cheerio.load(input)
}

const parseType = (input, type) => {
	if (type == 'string') {
		return input.toString()
	} else if (type == 'number') {
		return Number(input)
	} else if (type == 'boolean') {
		return Boolean(input)
	} else if (type == 'object') {
		if (typeof input == 'object') {
			return input
		} else {
			return {input}
		}
	} else if (type == 'array') {
		if (Array.isArray(input)) {
			return input
		} else {
			return Array(input)
		}
	}
	return input
}

const parseFile = async (input) => {
	var output = {}
	output.errorsMsg = []
	output.error = false

	const lines = input.split('\n')
	const url = lines[0].replace(/^@/, '')
	const response = await axios({
		method: 'GET',
		url: url
	}).catch((e) => {
		return {
			error: true,
			msg: e
		}
	})
	if (response.error) {
		return JSON.stringify(response)
	}
	const html = parseHtml(response.data.toString())

	try {
		for (var line of lines) {
			var values = parseValues(line)
			if (values) {
				var data = parseQuery(values.query, html)
				if (data && data.error) {
					output.error = true
					output.errorsMsg.push(data.msg)
				}
				output[values.key] = parseType(
					data,
					values.type
				)
			}
		}
	} catch (e) {
		return JSON.stringify({
			error: true,
			msg: e
		})
	}
	return JSON.stringify(output)
}

module.exports = {
	parseQuery,
	parseHtml,
	parseQuery,
	parseValues,
	parseType,
	parseFile
}

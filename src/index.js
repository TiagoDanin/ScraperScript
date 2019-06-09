const cheerio = require('cheerio')
const axios = require('axios')

const next = (index, tags) => {
	if (tags && tags[index + 1]) {
		return tags.splice(index + 1, tags.length).join(' ')
	}

	return false
}

const parseQuery = (input, html, output) => {
	if (input === false) {
		return ''
	}

	if (typeof output !== 'string' || !output) {
		output = ''
	}

	if (Array.isArray(input)) {
		input = input.join(' ')
	}

	const tags = input.toString().split(' ')
	const data = tags.reduce((total, current, index) => {
		if (!total && total === false) {
			return false
		}

		if (total && total.stop) {
			return total
		}

		if (total && total.isString) {
			if (current === '"') {
				total.stop = true
				const hasInput = next(index, tags)
				if (hasInput) {
					total.output = parseQuery(
						hasInput, html, total.output.replace(/\s$/, '')
					)
				} else {
					total.output = total.output.replace(/\s$/, '')
				}

				return total
			}

			total.output += current + ' '
			return total
		}

		switch (current) {
			case '!!': {
				const comment = next(index, tags)
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
				const nextIndex = next(index, tags)
				if (total.output === parseQuery(nextIndex, html)) {
					break
				}

				return false
			}

			case '==': {
				total.output = total.output || parseQuery(total.select, html)
				const nextIndex = next(index, tags)
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

				const nextIndex = next(index, tags)
				total.output = parseQuery(nextIndex, html)
				break
			}

			case '++': {
				total.output = total.output || parseQuery(total.select, html)
				const nextIndex = next(index, tags)
				const addOutput = parseQuery(nextIndex, html)

				if (Array.isArray(total.output)) {
					total.select = [].concat(total.output, addOutput)
				} else if (typeof total.output === 'object') {
					total.output = {
						...addOutput,
						...total.output
					}
				}

				total.output += addOutput
				break
			}

			case '--': {
				const nextIndex = next(index, tags)
				const removeRaw = parseQuery(nextIndex, html)
				const output = total.output || parseQuery(total.select, html)

				if (output && output.replace && typeof output.replace === 'function') {
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
		output,
		table: false,
		stop: false,
		isString: false
	})

	if (!data) {
		return false
	}

	if (data.output && data.output !== '') {
		return data.output
	}

	if (typeof data.output !== 'string') {
		return data.output
	}

	if (data.select && (data.table || data.table === '')) {
		let select = data.table
		let nameOfIndex = 'index'
		let nameOfData = 'data'
		let type = 'string' // Array or object
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

		const table = html(data.select).map((index, elem) => {
			const queryRaw = parseQuery(select, html(elem))
			if (type == 'object') {
				const arrayOutput = {}
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
	}

	if (typeof data.select === 'string') {
		if (data.select === '') {
			return html.text()
		}

		if (typeof html === 'function') {
			return html(data.select).text()
		}

		if (typeof html === 'object' && typeof html.children === 'function') {
			return html.children(data.select).text()
		}

		if (typeof html.text === 'function') {
			return html.text()
		}
	}

	return {
		error: true,
		msg: `"${data.select}"  is invalid`
	}
}

const parseValues = input => {
	const match = input.match(/^-\s([_-\w]*):\s*(.*)\s*:(\w*)/)
	if (!match) {
		return false
	}

	return output = {
		key: match[1],
		query: match[2],
		type: match[3]
	}
}

const parseHtml = input => {
	return cheerio.load(input)
}

const parseType = (input, type) => {
	if (type == 'string') {
		return input.toString()
	}

	if (type == 'number') {
		return Number(input)
	}

	if (type == 'boolean') {
		return Boolean(input)
	}

	if (type == 'object') {
		if (typeof input === 'object') {
			return input
		}

		return {input}
	}

	if (type == 'array') {
		if (Array.isArray(input)) {
			return input
		}

		return new Array(input)
	}

	return input
}

const parseFile = async input => {
	const output = {}
	output.errorsMsg = []
	output.error = false

	const lines = input.split('\n')
	const url = lines[0].replace(/^@/, '')
	const response = await axios({
		method: 'GET',
		url
	}).catch(error => {
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
		for (const line of lines) {
			const values = parseValues(line)
			if (values) {
				const data = parseQuery(values.query, html)
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
	} catch (error) {
		return JSON.stringify({
			error: true,
			msg: error
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

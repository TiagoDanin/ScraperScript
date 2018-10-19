const fs = require('fs')
const assert = require('assert')
const cheerio = require('cheerio')
const parse = require('../src')

var fixtures = {}
const files = ['name', 'helloWorld', 'helloList']
files.forEach((filename) => {
	fixtures[filename] = cheerio.load(
		fs.readFileSync(`test/fixtures/${filename}.html`).toString()
	)
})

describe('parse', () => {
	it('>>', () => {
		assert.equal(
			parse('div >> h2', fixtures.helloWorld),
			'Hello world'
		)
	})
	it('@>', () => {
		var r = parse('div >> h2 @> {number, text, bold == " tiago "}', fixtures.helloList)
		assert.equal(r[1].number, 1)
		assert.equal(r[1].text, 'tiago')
		assert.equal(r[0].text, false)
		r = parse('div >> h2 @> [bold]', fixtures.helloList)
		assert.equal(r[0], 'world')
		assert.equal(r[1], 'tiago')
		assert.equal(r[2], 'user')
		assert.equal(
			parse('div >> h2 @> bold', fixtures.helloList),
			'world, tiago, user'
		)
	})
	it('!!', () => {
		assert.equal(
			parse('!! my comment in ScrapperScrip', fixtures.helloWorld),
			'my comment in ScrapperScrip'
		)
		assert.equal(
			parse('div >> h2 !! my comment in ScrapperScript', fixtures.helloWorld),
			'Hello world'
		)
	})
	it('++', () => {
		assert.equal(
			parse('h1 ++ h2', fixtures.name),
			'TiagoDanin'
		)
		assert.equal(
			parse('h1 ++ " 2018 "', fixtures.name),
			'Tiago2018'
		)
	})
	it('--', () => {
		assert.equal(
			parse('h1 -- " Tia "', fixtures.name),
			'go'
		)
	})
	it('==', () => {
		assert.equal(
			parse('div >> h2 == " Hello world "', fixtures.helloWorld),
			'Hello world'
		)
		assert.equal(
			parse('" tiago " == " tiago "', fixtures.helloWorld),
			'tiago'
		)
		assert.equal(
			parse('" tiago " == " thiago "', fixtures.helloWorld).toString(),
			'false'
		)
	})
	it('||', () => {
		assert.equal(
			parse('h3 || h1', fixtures.name),
			'Tiago'
		)
		assert.equal(
			parse('h3 || " 2018 "', fixtures.name),
			'2018'
		)
	})
})

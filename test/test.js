const fs = require('fs')
const assert = require('assert')
const { parseHtml, parseValues, parseQuery } = require('../src')

var fixtures = {}
const files = ['name', 'helloWorld', 'helloList']
files.forEach((filename) => {
	fixtures[filename] = parseHtml(
		fs.readFileSync(`test/fixtures/${filename}.html`).toString()
	)
})

describe('get values', () => {
	var r = parseValues('- name: div >> h2 @> {number, text, bold == " tiago "}:string')
	assert.equal(r.key, 'name')
	assert.equal(r.query, 'div >> h2 @> {number, text, bold == " tiago "}')
	assert.equal(r.type, 'string')
})

describe('query query', () => {
	it('>>', () => {
		assert.equal(
			parseQuery('div >> h2', fixtures.helloWorld),
			'Hello world'
		)
	})
	it('@>', () => {
		var r = parseQuery('div >> h2 @> {number, text, bold == " tiago "}', fixtures.helloList)
		assert.equal(r[1].number, 1)
		assert.equal(r[1].text, 'tiago')
		assert.equal(r[0].text, false)
		r = parseQuery('div >> h2 @> [bold]', fixtures.helloList)
		assert.equal(r[0], 'world')
		assert.equal(r[1], 'tiago')
		assert.equal(r[2], 'user')
		assert.equal(
			parseQuery('div >> h2 @> bold', fixtures.helloList),
			'world, tiago, user'
		)
	})
	it('!!', () => {
		assert.equal(
			parseQuery('!! my comment in ScrapperScrip', fixtures.helloWorld),
			'my comment in ScrapperScrip'
		)
		assert.equal(
			parseQuery('div >> h2 !! my comment in ScrapperScript', fixtures.helloWorld),
			'Hello world'
		)
	})
	it('++', () => {
		assert.equal(
			parseQuery('h1 ++ h2', fixtures.name),
			'TiagoDanin'
		)
		assert.equal(
			parseQuery('h1 ++ " 2018 "', fixtures.name),
			'Tiago2018'
		)
	})
	it('--', () => {
		assert.equal(
			parseQuery('h1 -- " Tia "', fixtures.name),
			'go'
		)
	})
	it('==', () => {
		assert.equal(
			parseQuery('div >> h2 == " Hello world "', fixtures.helloWorld),
			'Hello world'
		)
		assert.equal(
			parseQuery('" tiago " == " tiago "', fixtures.helloWorld),
			'tiago'
		)
		assert.equal(
			parseQuery('" tiago " == " thiago "', fixtures.helloWorld).toString(),
			'false'
		)
	})
	it('||', () => {
		assert.equal(
			parseQuery('h3 || h1', fixtures.name),
			'Tiago'
		)
		assert.equal(
			parseQuery('h3 || " 2018 "', fixtures.name),
			'2018'
		)
	})
})

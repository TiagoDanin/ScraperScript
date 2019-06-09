/* eslint-disable no-undef */
const fs = require('fs')
const assert = require('assert')
const {parseHtml, parseValues, parseQuery} = require('../src')

const fixtures = {}
const files = ['name', 'helloWorld', 'helloList']
files.forEach(filename => {
	fixtures[filename] = parseHtml(
		fs.readFileSync(`test/fixtures/${filename}.html`).toString()
	)
})

describe('get values', () => {
	const r = parseValues('- name: div >> h2 @> {number, text, bold == " tiago "}:string')
	assert.strictEqual(r.key, 'name')
	assert.strictEqual(r.query, 'div >> h2 @> {number, text, bold == " tiago "}')
	assert.strictEqual(r.type, 'string')
})

describe('query query', () => {
	it('>>', () => {
		assert.strictEqual(
			parseQuery('div >> h2', fixtures.helloWorld),
			'Hello world'
		)
	})
	it('@>', () => {
		let r = parseQuery('div >> h2 @> {number, text, bold == " tiago "}', fixtures.helloList)
		assert.strictEqual(r[1].number, 1)
		assert.strictEqual(r[1].text, 'tiago')
		assert.strictEqual(r[0].text, false)
		r = parseQuery('div >> h2 @> [bold]', fixtures.helloList)
		assert.strictEqual(r[0], 'world')
		assert.strictEqual(r[1], 'tiago')
		assert.strictEqual(r[2], 'user')
		assert.strictEqual(
			parseQuery('div >> h2 @> bold', fixtures.helloList),
			'world, tiago, user'
		)
	})
	it('!!', () => {
		assert.strictEqual(
			parseQuery('!! my comment in ScrapperScript', fixtures.helloWorld),
			'my comment in ScrapperScript'
		)
		assert.strictEqual(
			parseQuery('div >> h2 !! my comment in ScrapperScript', fixtures.helloWorld),
			'Hello world'
		)
	})
	it('++', () => {
		assert.strictEqual(
			parseQuery('h1 ++ h2', fixtures.name),
			'TiagoDanin'
		)
		assert.strictEqual(
			parseQuery('h1 ++ " 2018 "', fixtures.name),
			'Tiago2018'
		)
	})
	it('--', () => {
		assert.strictEqual(
			parseQuery('h1 -- " Tia "', fixtures.name),
			'go'
		)
	})
	it('==', () => {
		assert.strictEqual(
			parseQuery('div >> h2 == " Hello world "', fixtures.helloWorld),
			'Hello world'
		)
		assert.strictEqual(
			parseQuery('" tiago " == " tiago "', fixtures.helloWorld),
			'tiago'
		)
		assert.strictEqual(
			parseQuery('" tiago " == " thiago "', fixtures.helloWorld).toString(),
			'false'
		)
	})
	it('||', () => {
		assert.strictEqual(
			parseQuery('h3 || h1', fixtures.name),
			'Tiago'
		)
		assert.strictEqual(
			parseQuery('h3 || " 2018 "', fixtures.name),
			'2018'
		)
	})
})

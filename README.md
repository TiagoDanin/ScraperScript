# ScraperScript

[![Travis](https://img.shields.io/travis/TiagoDanin/ScraperScript.svg?branch=master&style=flat-square)](https://travis-ci.org/TiagoDanin/ScraperScript) [![Downloads](https://img.shields.io/npm/dt/scraperscript.svg?style=flat-square)](https://npmjs.org/package/scraperscript) [![Node](https://img.shields.io/node/v/scraperscript.svg?style=flat-square)](https://npmjs.org/package/scraperscript) [![Version](https://img.shields.io/npm/v/scraperscript.svg?style=flat-square)](https://npmjs.org/package/scraperscript) [![XO code style](https://img.shields.io/badge/code%20style-XO-red.svg?style=flat-square)](https://github.com/xojs/xo) 

ScraperScript is a query language for Web Scraping

## Installation

Module available through the [npm registry](https://www.npmjs.com/). It can be installed using the  [`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) or [`yarn`](https://yarnpkg.com/en/) command line tools.

```sh
# NPM
npm install scraperscript --global
# Or Using Yarn
yarn global add scraperscript
```

## Documentation

Use the command `scraperscript myfile` or server

Example file.

```markdown
@https://helloword.site/list
!! A comment ...
- names: html >> body >> div >> h2 @> {number, text, bold} :array
- hasTitle: html >> head >> title == " my string " :boolean
- title: html >> head >> title :string
```

This return an json:

```json
"error": false,
"errorsMsg": [],
"names": [
	{
		"number": 0,
		"text": "Tiago"
	},
	{
		"number": 0,
		"text": "James"
	}
],
"hasTitle": true,
"title": "my string"
```

## Syntax
Place the URL in the first line: `@http://myurl.com`

Other lines: `- key: query :type`

PS: Space is important.

### Key
Name

Rules:
- Use at the beginning of the line
- Format `- key:`

Example: `- name:`

### Type
Return type

Rules:
- Use at the end of the line
- Format `:type`

Types:
- array
- object
- boolean
- string
- number

Example: `:string`

### Query

**String**

`" my string "`

NOTE: `"my string"` is invalid

**Comment**

`!! my comment in ScrapperScript`

**Elements**

`nameOfHtmlElementOne >> nameOfHtmlElementTwo`

**Map elements [String]**

`nameOfHtmlElementOne @> nameOfSubHtmlElement`

**Map elements [Array]**

`nameOfHtmlElementOne @> [nameOfSubHtmlElement]`

**Map elements [Object]**

`nameOfHtmlElementOne @> {nameOfIndex, nameOfData, nameOfSubHtmlElement}`

**Addition**

`nameOfHtmlElementOne ++ nameOfHtmlElementTwo`

**Replace**

`nameOfHtmlElementOne -- nameOfHtmlElementTwo`

**Equal comparison or Different**

`nameOfHtmlElementOne == nameOfHtmlElementTwo`

`nameOfHtmlElementOne ~= nameOfHtmlElementTwo`

**OR**

`nameOfHtmlElementOne || nameOfHtmlElementTwo`

## Tests

To run the test suite, first install the dependencies, then run `test`:

```sh
# NPM
npm test
# Or Using Yarn
yarn test
```

## Dependencies

- [axios](https://ghub.io/axios): Promise based HTTP client for the browser and node.js
- [cheerio](https://ghub.io/cheerio): Tiny, fast, and elegant implementation of core jQuery designed specifically for the server

## Dev Dependencies

- [body-parser](https://ghub.io/body-parser): Node.js body parsing middleware
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [mocha](https://ghub.io/mocha): simple, flexible, fun test framework
- [xo](https://ghub.io/xo): JavaScript happiness style linter ❤️

## Contributors

Pull requests and stars are always welcome. For bugs and feature requests, please [create an issue](https://github.com/TiagoDanin/ScraperScript/issues). [List of all contributors](https://github.com/TiagoDanin/ScraperScript/graphs/contributors).

## License

[MIT](LICENSE) © [Tiago Danin](https://TiagoDanin.github.io)
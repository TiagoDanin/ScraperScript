# ScraperScript [![Build Status](https://travis-ci.org/TiagoDanin/ScraperScript.png?branch=master)](https://travis-ci.org/TiagoDanin/ScraperScript)

ScraperScript is a query language for Web Scraping

## How use

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

## Installation

This is a [Node.js](https://nodejs.org/) module available through the
[npm registry](https://www.npmjs.com/). It can be installed using the
[`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)
or
[`yarn`](https://yarnpkg.com/en/)
command line tools.

```sh
npm install scraperscript --save
```

## Dependencies

- [cheerio](https://ghub.io/cheerio): Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
- [axios](https://ghub.io/axios): Promise based HTTP client for the browser and node.js

## Dev Dependencies

- [mocha](https://ghub.io/mocha): simple, flexible, fun test framework
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [body-parser](https://ghub.io/body-parser): Node.js body parsing middleware
- [json-stringify-safe](https://ghub.io/json-stringify-safe): Like JSON.stringify, but doesn&#39;t blow up on circular refs.


## License

MIT

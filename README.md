# ScraperScript [![Build Status](https://travis-ci.org/TiagoDanin/ScraperScript.png?branch=master)](https://travis-ci.org/TiagoDanin/ScraperScript)

ScraperScript is a query language for Web Scraping

## How use

Use the command `scraperscript myfile` or server

Example file.

```
@https://helloword.site/list
!! A comment ...
- names: html >> body >> div >> h2 @> {number, text, bold} :object
- hasTitle: html >> head >> title == " my string " :boolean
- title: html >> head >> title :string
```

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
- [json-stringify-safe](https://ghub.io/json-stringify-safe): Like JSON.stringify, but doesn&#39;t blow up on circular refs.
- [axios](https://ghub.io/axios): Promise based HTTP client for the browser and node.js
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [body-parser](https://ghub.io/body-parser): Node.js body parsing middleware

## Dev Dependencies

- [mocha](https://ghub.io/mocha): simple, flexible, fun test framework

## License

MIT

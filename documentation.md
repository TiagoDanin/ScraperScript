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

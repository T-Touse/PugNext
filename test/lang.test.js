import {describe,test,expect} from "bun:test"
import { render } from "../src/pug/index";

describe("convert pug to html",()=>{
	test("convert pug to html",()=>{
		const html = render("br")
		expect(html.trim()).toContain("<br >")
	})
	test("convert pug to html with content",()=>{
		const html = render("p it's a render")
		expect(html.trim()).toContain("<p >it's a render</p>")
	})
	test("convert pug to html with attr",()=>{
		const html = render('img(src="image.png")')
		expect(html.trim()).toContain('<img src="image.png"')
	})
	test("convert pug to html with content,attr",()=>{
		const html = render("p(value=\"value\")it's a render")
		expect(html.trim()).toContain("<p value=\"value\">it's a render</p>")
	})
	test("convert pug to html with children",()=>{
		const html = render(`
div
	p child 1
	p child 2
`).trim()
		expect(html).toContain("<div >")
		expect(html).toContain("<p >child 1</p>")
		expect(html).toContain("<p >child 2</p>")
	})
	test("convert pug to html with text plain",()=>{
		const html = render(`
p
	| content 1
	| content 2
			`).trim()
		expect(html).toContain("<p ")
		expect(html).toContain("content 1")
		expect(html).toContain("content 2")
	})
})
describe("use dynamics variables",()=>{
	test("convert pug to html with content",()=>{
		const html = render("p= 'js string' ")
		expect(html.trim()).toContain("<p >js string</p>")
	})
	test("convert pug to html with attr",()=>{
		const html = render('img(src={"image"+".png"})')
		expect(html.trim()).toContain('<img src="image.png"')
	})
})

/*
describe("use conditional rendering",()=>{
	test('conditions', () => {
		const pugCode = `
- var isLoggedIn = true
if isLoggedIn
	p Bienvenue, utilisateur connecté !
else
	p Veuillez vous connecter.
`;
		const expectedHtml = '<p>Bienvenue, utilisateur connecté !</p>';
		expect(pug.render(pugCode)).toContain(expectedHtml);
	});
	test('convert pug to html > boucles', () => {
	const pugCode = `
- var items = ['Item 1', 'Item 2', 'Item 3']
ul
	each item in items
		li= item
`;
		const expectedHtml = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
		expect(pug.render(pugCode)).toContain(expectedHtml);
	});
	test('convert pug to html > mixins', () => {
	const pugCode = `
mixin list(items)
	ul
		each item in items
			li= item

	+list(['Item 1', 'Item 2', 'Item 3'])
`;
		const expectedHtml = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
		expect(pug.render(pugCode).toContain(expectedHtml);
	});
})
*/
/*

test('convert pug to html > héritage de templates', () => {
	const layoutPug = `
	html
		head
		block head
		body
		block content
	`;
	const indexPug = `
	extends layout.pug

	block head
		title Mon Titre

	block content
		h1 Bonjour le monde
	`;
	const expectedHtml = '<html><head><title>Mon Titre</title></head><body><h1>Bonjour le monde</h1></body></html>';
	assert.equal(pug.render(indexPug, { filename: 'index.pug', basedir: __dirname, doctype: 'html', pretty: true, locals: { layout: layoutPug } }), expectedHtml);
});

test("markdown filter",()=>{
		const html = render(`
:markdown
	# Titre
	Ceci est un paragraphe en Markdown.
`).trim()
		expect(html).toContain("<h1>Titre</h1>")
		expect(html).toContain("<p>Ceci est un paragraphe en Markdown.</p>")
})
*/
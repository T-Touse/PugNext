const pug = require("../src/pug")
console.log(pug.PUG(`
.card
	p it is a 
	| render
- a = "a"
	`))
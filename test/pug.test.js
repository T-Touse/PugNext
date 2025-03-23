const pug = require("../src/pug")
console.log(pug.PUG(`
- a = "a"
.card
	p it is #{a}
	| render
	`))
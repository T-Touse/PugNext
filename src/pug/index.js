const { compile } = require("./compile");
export function render(source){
	const compiled = compile(source);
	const html = compiled().join()
	return compiled().join()
}
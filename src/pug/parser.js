// --- Fonctionnalités principales : parsing, transformation des attributs et du contenu ---
const TAG_CONTENT = ["\\w", "\\#", "\\.", "\\-",];

const TAG_START = ["\\+", "\\-", "\\|", ...TAG_CONTENT];

const TAG_REX = new RegExp(`( *|\\t*)((${TAG_START.join('|')})(${TAG_CONTENT.join('|')})*)\\(?`);

// Parser le contenu PUG/Jade
export function parse(source) {
	const stack = [], root = [];
	source.split("\n").filter(l => l.trim()).forEach(line => {
		const indent = line.match(/^\s*/)[0].length;
		let tag = line.match(TAG_REX)?.[2] ?? "|";

		while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
		const parentNode = (stack.length ? stack[stack.length - 1].node : {children:root})

		let i = indent + tag.length;

		if (line.at(i) == "(") {
			let p = 1;
			i++;
			while (i < line.length && p != 0) {
				if (line.at(i) == "(") p++;
				else if (line.at(i) == ")") p--;
				i++;
			}
		}

		const attrs = parseAttrs(line.slice(indent + tag.length, i - 1));
		const content = line.slice(i);
		tag = tag.trim();
		let node = {}

		// Traitement des différents types de tags (script, mixin, texte brut)
		switch (tag[0]) {
			case "-"://script
				node.type = "script"
				node.exp = content
				break;
			case "+":
				node.type = "mixin"
				node.attrs = attrs
				node.content = [content]
				node.children = []
				break;
			case "|":
				parentNode.content.push(...parseContent(content))
				return;
				break;
			default:
				tag.match(/#(\w|\-)+|\.(\w|\-)+|:?(\w|\-)+/g)?.forEach((x, n) => {
					const y = x.slice(1);
					if (n == 0 && x[0] != "#" && x[0] != ".") {
						if (x[0] == ":") x = y;
						tag = x;
					} else if (x[0] == "#") {
						attrs.id = y;
					} else if (x[0] == ".") {
						attrs.className = (attrs.className || "") + y;
					}
				});
				node = {
					type:"node",
					tag,
					attrs,
					content: parseContent(content),
					children: []
				};
		}

		parentNode.children.push(node);
		stack.push({ indent, node });
	});
	return root;
}

// Parse les attributs d'un tag
const parseAttrs = s => s ? Object.fromEntries([...s.matchAll(/(\w+)=("(.*?)"|[^\s,]+|\{(.+?)\})/g)]
.map(([_, k, v]) => [k, /^[a-zA-Z_$]/.test(v) ? { name: v } : (v[0] == "{" ? { exp: v.slice(1, -1) } : v)])) : {};

const VALUE_CONTENT = [
	"(?:#\\{(.+?)\\})",
	"([^#]+)|(\\#)"
]
const CONTENT_REX = new RegExp(VALUE_CONTENT.join('|'),"g")

// Parse le contenu d'un tag (pour le texte ou les expressions)
const parseContent = c => c[0] == "=" ? [{ exp: c.slice(1).trim() }] : c.match(CONTENT_REX)?.map(x => (x[0] == "#" && x.length != 1) ? { name: x.replace(/#\{(.+?)\}/g, (_, v) => v) } : /^(\s)/.test(x)?x.slice(1):x) ?? [];

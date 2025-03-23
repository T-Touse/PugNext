import { parse } from "./parser";

// Fonction pour créer un élément HTML
export function createElement(tag, attrs, children) {
	const _attrs = Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ");
	return `<${tag} ${_attrs}>${children.join('')}</${tag}>`;
}

const get = (obj, path) => path.split('.').reduce((o, p) => o?.[p] ?? null, obj);

function compileVar(_var,states = {}){
	if (_var.name) {
		return get(states, _var.name) ?? true;
	} else if (_var.exp) {
		return (new Function("$state", `with($state)return ${_var.exp}`))(states);
	}else{
		return _var
	}
}

// Compilation du template PUG en fonction des données d'état
export function compile(source, self = createElement) {
	if(typeof self !== "function")
		self = createElement
	const ast = parse(source);

	return (states = {}) => {
		const render = ({ tag, attrs, content, children }) => {
			// Gérer les attributs dynamiques (comme les événements)
			const _attrs = {}
			for (const attr in attrs)
				if (attr && typeof attrs[attr] == "string" && attr.startsWith("on")) {
					_attrs[attr] = (new Function("component", `return ()=>{ ${attrs[attr]} }`))(states);
				} else if (typeof attrs[attr] == "object") {
					_attrs[attr] = compileVar(attrs[attr],states)
				}else{
					_attrs[attr] = attrs[attr].slice(1,-1)
				}
			// Rendre le contenu et les enfants
			content = (content||[]).map(x => (typeof x == "object") ? compileVar(x,states) : x)
			return self(tag, _attrs, [...content,...children.map(render)]);
		};
		return ast.map(render);
	};
}
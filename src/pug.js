((root, factory) => {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node
		module.exports = factory();
	} else {
		root.PUG = factory();
	}
})(this, () => {
	// --- Configuration et options globales ---
	const OPTIONS = {
		filters: {},
		self: false,
		debug: false,
		compileDebug: false,
		globals: [],
		cache: false,
		name: "template",
		tags: {},
		mixins: [],
	};

	// Fonction pour créer un élément HTML
	function createElement(tag, attrs, children) {
		const _attrs = Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ");
		return `<${tag} ${_attrs}>${children.join('')}</${tag}>`;
	}

	// Compilation du template PUG en fonction des données d'état
	function compile(source, self = createElement) {
		if(typeof self !== "function")
			self = createElement
		const ast = parse(source);
		const get = (obj, path) => path.split('.').reduce((o, p) => o?.[p] ?? null, obj);

		return states => {
			const render = ({ tag, attrs, content, children }) => {
				// Gérer les attributs dynamiques (comme les événements)
				for (const attr in attrs)
					if (attr && typeof attrs[attr] == "string" && attr.startsWith("on")) {
						attrs[attr] = (new Function("component", `return ()=>{ ${attrs[attr]} }`))(states);
					} else if (typeof attrs[attr] == "object") {
						if (attrs[attr].name) {
							attrs[attr] = get(states, attrs[attr].name) ?? true;
						} else if (attrs[attr].exp) {
							attrs[attr] = (new Function("$state", `with($state)return ${attrs[attr].exp}`))(states);
						}
					}

				// Rendre le contenu et les enfants
				content = content.map(x => (typeof x == "object") ? get(states, x.name) : x).join('');
				return self(tag, attrs, [...(content ? [content] : []), ...children.map(render)]);
			};
			return ast.map(render);
		};
	}

	// --- Ajouter de nouvelles fonctionnalités (tags, filtres, etc.) ---
	function addTag(tag, handler) {
		OPTIONS.tags[tag] = handler;
	}

	function addFilter(name, filterFn) {
		OPTIONS.filters[name] = filterFn;
	}

	function addMixin(mixinFn) {
		OPTIONS.mixins.push(mixinFn);
	}

	// Fonction pour ajouter une fonctionnalité de filtrage
	function applyFilters(content, filters) {
		return filters.reduce((acc, filterName) => {
			const filter = OPTIONS.filters[filterName];
			if (filter) return filter(acc);
			return acc;
		}, content);
	}

	// --- Exportation des méthodes ---
	const module = {
		render(source, options, callback) {
			const compiled = compile(source);
			const returns = compiled();
			callback(returns);
			return returns;
		},

		compile(source, options = {}) {
			const returns = compile(source);
			return returns;
		},

		async renderAsync(source, options) {
			const compiled = compile(source);
			return await compiled();
		},

		_parseToAST: parse,

		PUG(strings, ...values) {
			const self = this??createElement;
			const source = typeof strings == "string" ? strings : strings.reduce((acc, s, i) => acc + s + (values[i] || ""), "");
			return compile(source, self)({});
		},

		addTag,
		addFilter,
		addMixin,
	};

	return module;
});

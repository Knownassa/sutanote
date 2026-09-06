globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-04T10:14:30.065Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/__vite-browser-external-DQCdTjuR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-a8/4Xo/jquOjtuJzJdS6A3tVA6s\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 113,
		"path": "../public/assets/__vite-browser-external-DQCdTjuR.js"
	},
	"/assets/RichTextEditor-rxUouwr2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63f6f-Cq4kKloxFPVXdj63S4tEDIWM+Xg\"",
		"mtime": "2026-09-04T10:14:28.880Z",
		"size": 409455,
		"path": "../public/assets/RichTextEditor-rxUouwr2.js"
	},
	"/assets/asset-store-BThjLfN_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5e-Jy4JVWRebDsVftQxsDKco7esK4I\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 94,
		"path": "../public/assets/asset-store-BThjLfN_.js"
	},
	"/assets/chunk-IFSHUC46-Cmy16ENl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1c3-+vQthYTE5mg8IVArOyGOt/oUfV4\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 106947,
		"path": "../public/assets/chunk-IFSHUC46-Cmy16ENl.js"
	},
	"/assets/edge-repository-DpKaaOjn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f6-CI98+HOTfdVUE9ftBxRQqdK5b2E\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 502,
		"path": "../public/assets/edge-repository-DpKaaOjn.js"
	},
	"/assets/history-store-DfuHruuz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a06-ZB9W6CdSmPMJKOfKaG5e4R191go\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 2566,
		"path": "../public/assets/history-store-DfuHruuz.js"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-09-04T10:14:30.065Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/index.browser-D65rSomk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b9-nDNH3+fNmj2M7dzoUcjiZsW73bs\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 185,
		"path": "../public/assets/index.browser-D65rSomk.js"
	},
	"/assets/database-DQHpFc6R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"774a4-orzOPSmfgvtHTDZs1mrvXewyIqU\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 488612,
		"path": "../public/assets/database-DQHpFc6R.js"
	},
	"/assets/index-k2ux36ax.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5451c-oPaRympJZLvxh2VLFjRa8/Gdey4\"",
		"mtime": "2026-09-04T10:14:28.879Z",
		"size": 345372,
		"path": "../public/assets/index-k2ux36ax.js"
	},
	"/assets/node-repository-jtRYArXI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c09-PNpc17GfHjjhCxqttsm+J1urimQ\"",
		"mtime": "2026-09-04T10:14:28.881Z",
		"size": 3081,
		"path": "../public/assets/node-repository-jtRYArXI.js"
	},
	"/assets/nodefs-BfveVaSy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22b-chXgl3ro5NnkakI4sspsuLcWB4s\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 555,
		"path": "../public/assets/nodefs-BfveVaSy.js"
	},
	"/assets/initdb-DwLcS450.wasm": {
		"type": "application/wasm",
		"etag": "\"607ea-EA0LyIiqMneEA5ghLUd5KcTorTk\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 395242,
		"path": "../public/assets/initdb-DwLcS450.wasm"
	},
	"/assets/notice-store-BWjlEQGS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45-RoatXL/gLsxwcBEqfykc3RTLVNc\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 69,
		"path": "../public/assets/notice-store-BWjlEQGS.js"
	},
	"/assets/opfs-ahp-BX9lq8yX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"271c-0JW2JC372ZT0/5fEWcag6QPqgFg\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 10012,
		"path": "../public/assets/opfs-ahp-BX9lq8yX.js"
	},
	"/assets/persistence-manager-Hv18XU9_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"75f-mSZ6xiQj6u7rpeQgeWfAsUXcXII\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 1887,
		"path": "../public/assets/persistence-manager-Hv18XU9_.js"
	},
	"/assets/react-DbvyfjWD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b1-yz8zw0ojSlAP/NY4AwDPHi1shu4\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 689,
		"path": "../public/assets/react-DbvyfjWD.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-8hax8RNO.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1b4e-HxTvncQaTlNVKqoZVBrNuacUsRo\"",
		"mtime": "2026-09-04T10:14:28.894Z",
		"size": 6990,
		"path": "../public/assets/routes-8hax8RNO.css"
	},
	"/assets/store-AN4xQod3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45-Yzl+0qgi3/vIjRciua5qcCUQ5Jc\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 69,
		"path": "../public/assets/store-AN4xQod3.js"
	},
	"/assets/styles-BEkfowBl.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"19565-orBmHMaLWSLvtMqjllizdr0W71k\"",
		"mtime": "2026-09-04T10:14:28.894Z",
		"size": 103781,
		"path": "../public/assets/styles-BEkfowBl.css"
	},
	"/assets/routes-BEYSosBg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94d1b-KT0UeGwc9X5Irb1aVcgn2CiZskM\"",
		"mtime": "2026-09-04T10:14:28.882Z",
		"size": 609563,
		"path": "../public/assets/routes-BEYSosBg.js"
	},
	"/assets/pglite-BpGD4DQm.data": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"600e3c-OWVGtuEaDGCxngN5MXdzvIotHdM\"",
		"mtime": "2026-09-04T10:14:28.883Z",
		"size": 6295100,
		"path": "../public/assets/pglite-BpGD4DQm.data"
	},
	"/assets/pglite-DbGWm3Oa.wasm": {
		"type": "application/wasm",
		"etag": "\"99ed32-J5ghv9Hdnewdg4S5IPzlvJ3hie0\"",
		"mtime": "2026-09-04T10:14:28.886Z",
		"size": 10087730,
		"path": "../public/assets/pglite-DbGWm3Oa.wasm"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_L4wBXo = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_L4wBXo
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };

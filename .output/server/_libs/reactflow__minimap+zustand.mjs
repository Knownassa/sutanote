import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { C as pointer_default, T as cc, _ as useStore, b as zoom_default, d as getBoundsOfRects, f as getNodePositionWithOrigin, p as getNodesBounds, r as Panel, v as useStoreApi, w as select_default, x as identity } from "./@reactflow/background+[...].mjs";
//#region node_modules/@reactflow/minimap/node_modules/zustand/esm/shallow.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function shallow$1(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	if (objA instanceof Map && objB instanceof Map) {
		if (objA.size !== objB.size) return false;
		for (const [key, value] of objA) if (!Object.is(value, objB.get(key))) return false;
		return true;
	}
	if (objA instanceof Set && objB instanceof Set) {
		if (objA.size !== objB.size) return false;
		for (const value of objA) if (!objB.has(value)) return false;
		return true;
	}
	const keysA = Object.keys(objA);
	if (keysA.length !== Object.keys(objB).length) return false;
	for (const keyA of keysA) if (!Object.prototype.hasOwnProperty.call(objB, keyA) || !Object.is(objA[keyA], objB[keyA])) return false;
	return true;
}
//#endregion
//#region node_modules/@reactflow/minimap/dist/esm/index.mjs
var MiniMapNode = ({ id, x, y, width, height, style, color, strokeColor, strokeWidth, className, borderRadius, shapeRendering, onClick, selected }) => {
	const { background, backgroundColor } = style || {};
	const fill = color || background || backgroundColor;
	return import_react.createElement("rect", {
		className: cc([
			"react-flow__minimap-node",
			{ selected },
			className
		]),
		x,
		y,
		rx: borderRadius,
		ry: borderRadius,
		width,
		height,
		fill,
		stroke: strokeColor,
		strokeWidth,
		shapeRendering,
		onClick: onClick ? (event) => onClick(event, id) : void 0
	});
};
MiniMapNode.displayName = "MiniMapNode";
var MiniMapNode$1 = (0, import_react.memo)(MiniMapNode);
var selector$1 = (s) => s.nodeOrigin;
var selectorNodes = (s) => s.getNodes().filter((node) => !node.hidden && node.width && node.height);
var getAttrFunction = (func) => func instanceof Function ? func : () => func;
function MiniMapNodes({ nodeStrokeColor = "transparent", nodeColor = "#e2e2e2", nodeClassName = "", nodeBorderRadius = 5, nodeStrokeWidth = 2, nodeComponent: NodeComponent = MiniMapNode$1, onClick }) {
	const nodes = useStore(selectorNodes, shallow$1);
	const nodeOrigin = useStore(selector$1);
	const nodeColorFunc = getAttrFunction(nodeColor);
	const nodeStrokeColorFunc = getAttrFunction(nodeStrokeColor);
	const nodeClassNameFunc = getAttrFunction(nodeClassName);
	const shapeRendering = typeof window === "undefined" || !!window.chrome ? "crispEdges" : "geometricPrecision";
	return import_react.createElement(import_react.Fragment, null, nodes.map((node) => {
		const { x, y } = getNodePositionWithOrigin(node, nodeOrigin).positionAbsolute;
		return import_react.createElement(NodeComponent, {
			key: node.id,
			x,
			y,
			width: node.width,
			height: node.height,
			style: node.style,
			selected: node.selected,
			className: nodeClassNameFunc(node),
			color: nodeColorFunc(node),
			borderRadius: nodeBorderRadius,
			strokeColor: nodeStrokeColorFunc(node),
			strokeWidth: nodeStrokeWidth,
			shapeRendering,
			onClick,
			id: node.id
		});
	}));
}
var MiniMapNodes$1 = (0, import_react.memo)(MiniMapNodes);
var defaultWidth = 200;
var defaultHeight = 150;
var selector = (s) => {
	const nodes = s.getNodes();
	const viewBB = {
		x: -s.transform[0] / s.transform[2],
		y: -s.transform[1] / s.transform[2],
		width: s.width / s.transform[2],
		height: s.height / s.transform[2]
	};
	return {
		viewBB,
		boundingRect: nodes.length > 0 ? getBoundsOfRects(getNodesBounds(nodes, s.nodeOrigin), viewBB) : viewBB,
		rfId: s.rfId
	};
};
var ARIA_LABEL_KEY = "react-flow__minimap-desc";
function MiniMap({ style, className, nodeStrokeColor = "transparent", nodeColor = "#e2e2e2", nodeClassName = "", nodeBorderRadius = 5, nodeStrokeWidth = 2, nodeComponent, maskColor = "rgb(240, 240, 240, 0.6)", maskStrokeColor = "none", maskStrokeWidth = 1, position = "bottom-right", onClick, onNodeClick, pannable = false, zoomable = false, ariaLabel = "React Flow mini map", inversePan = false, zoomStep = 10, offsetScale = 5 }) {
	const store = useStoreApi();
	const svg = (0, import_react.useRef)(null);
	const { boundingRect, viewBB, rfId } = useStore(selector, shallow$1);
	const elementWidth = style?.width ?? defaultWidth;
	const elementHeight = style?.height ?? defaultHeight;
	const scaledWidth = boundingRect.width / elementWidth;
	const scaledHeight = boundingRect.height / elementHeight;
	const viewScale = Math.max(scaledWidth, scaledHeight);
	const viewWidth = viewScale * elementWidth;
	const viewHeight = viewScale * elementHeight;
	const offset = offsetScale * viewScale;
	const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
	const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
	const width = viewWidth + offset * 2;
	const height = viewHeight + offset * 2;
	const labelledBy = `${ARIA_LABEL_KEY}-${rfId}`;
	const viewScaleRef = (0, import_react.useRef)(0);
	viewScaleRef.current = viewScale;
	(0, import_react.useEffect)(() => {
		if (svg.current) {
			const selection = select_default(svg.current);
			const zoomHandler = (event) => {
				const { transform, d3Selection, d3Zoom } = store.getState();
				if (event.sourceEvent.type !== "wheel" || !d3Selection || !d3Zoom) return;
				const pinchDelta = -event.sourceEvent.deltaY * (event.sourceEvent.deltaMode === 1 ? .05 : event.sourceEvent.deltaMode ? 1 : .002) * zoomStep;
				const zoom = transform[2] * Math.pow(2, pinchDelta);
				d3Zoom.scaleTo(d3Selection, zoom);
			};
			const panHandler = (event) => {
				const { transform, d3Selection, d3Zoom, translateExtent, width, height } = store.getState();
				if (event.sourceEvent.type !== "mousemove" || !d3Selection || !d3Zoom) return;
				const moveScale = viewScaleRef.current * Math.max(1, transform[2]) * (inversePan ? -1 : 1);
				const position = {
					x: transform[0] - event.sourceEvent.movementX * moveScale,
					y: transform[1] - event.sourceEvent.movementY * moveScale
				};
				const extent = [[0, 0], [width, height]];
				const nextTransform = identity.translate(position.x, position.y).scale(transform[2]);
				const constrainedTransform = d3Zoom.constrain()(nextTransform, extent, translateExtent);
				d3Zoom.transform(d3Selection, constrainedTransform);
			};
			const zoomAndPanHandler = zoom_default().on("zoom", pannable ? panHandler : null).on("zoom.wheel", zoomable ? zoomHandler : null);
			selection.call(zoomAndPanHandler);
			return () => {
				selection.on("zoom", null);
			};
		}
	}, [
		pannable,
		zoomable,
		inversePan,
		zoomStep
	]);
	const onSvgClick = onClick ? (event) => {
		const rfCoord = pointer_default(event);
		onClick(event, {
			x: rfCoord[0],
			y: rfCoord[1]
		});
	} : void 0;
	const onSvgNodeClick = onNodeClick ? (event, nodeId) => {
		onNodeClick(event, store.getState().nodeInternals.get(nodeId));
	} : void 0;
	return import_react.createElement(Panel, {
		position,
		style,
		className: cc(["react-flow__minimap", className]),
		"data-testid": "rf__minimap"
	}, import_react.createElement("svg", {
		width: elementWidth,
		height: elementHeight,
		viewBox: `${x} ${y} ${width} ${height}`,
		role: "img",
		"aria-labelledby": labelledBy,
		ref: svg,
		onClick: onSvgClick
	}, ariaLabel && import_react.createElement("title", { id: labelledBy }, ariaLabel), import_react.createElement(MiniMapNodes$1, {
		onClick: onSvgNodeClick,
		nodeColor,
		nodeStrokeColor,
		nodeBorderRadius,
		nodeClassName,
		nodeStrokeWidth,
		nodeComponent
	}), import_react.createElement("path", {
		className: "react-flow__minimap-mask",
		d: `M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`,
		fill: maskColor,
		fillRule: "evenodd",
		stroke: maskStrokeColor,
		strokeWidth: maskStrokeWidth,
		pointerEvents: "none"
	})));
}
MiniMap.displayName = "MiniMap";
var MiniMap$1 = (0, import_react.memo)(MiniMap);
//#endregion
export { MiniMap$1 as t };

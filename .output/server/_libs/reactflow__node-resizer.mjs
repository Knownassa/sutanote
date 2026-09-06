import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { S as drag_default, T as cc, h as useNodeId, m as useGetPointerPosition, u as clamp, v as useStoreApi, w as select_default } from "./@reactflow/background+[...].mjs";
//#region node_modules/@reactflow/node-resizer/dist/esm/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var ResizeControlVariant;
(function(ResizeControlVariant) {
	ResizeControlVariant["Line"] = "line";
	ResizeControlVariant["Handle"] = "handle";
})(ResizeControlVariant || (ResizeControlVariant = {}));
function getDirection({ width, prevWidth, height, prevHeight, invertX, invertY }) {
	const deltaWidth = width - prevWidth;
	const deltaHeight = height - prevHeight;
	const direction = [deltaWidth > 0 ? 1 : deltaWidth < 0 ? -1 : 0, deltaHeight > 0 ? 1 : deltaHeight < 0 ? -1 : 0];
	if (deltaWidth && invertX) direction[0] = direction[0] * -1;
	if (deltaHeight && invertY) direction[1] = direction[1] * -1;
	return direction;
}
var initPrevValues = {
	width: 0,
	height: 0,
	x: 0,
	y: 0
};
var initStartValues = {
	...initPrevValues,
	pointerX: 0,
	pointerY: 0,
	aspectRatio: 1
};
function ResizeControl({ nodeId, position, variant = ResizeControlVariant.Handle, className, style = {}, children, color, minWidth = 10, minHeight = 10, maxWidth = Number.MAX_VALUE, maxHeight = Number.MAX_VALUE, keepAspectRatio = false, shouldResize, onResizeStart, onResize, onResizeEnd }) {
	const contextNodeId = useNodeId();
	const id = typeof nodeId === "string" ? nodeId : contextNodeId;
	const store = useStoreApi();
	const resizeControlRef = (0, import_react.useRef)(null);
	const startValues = (0, import_react.useRef)(initStartValues);
	const prevValues = (0, import_react.useRef)(initPrevValues);
	const getPointerPosition = useGetPointerPosition();
	const defaultPosition = variant === ResizeControlVariant.Line ? "right" : "bottom-right";
	const controlPosition = position ?? defaultPosition;
	(0, import_react.useEffect)(() => {
		if (!resizeControlRef.current || !id) return;
		const selection = select_default(resizeControlRef.current);
		const enableX = controlPosition.includes("right") || controlPosition.includes("left");
		const enableY = controlPosition.includes("bottom") || controlPosition.includes("top");
		const invertX = controlPosition.includes("left");
		const invertY = controlPosition.includes("top");
		const dragHandler = drag_default().on("start", (event) => {
			const node = store.getState().nodeInternals.get(id);
			const { xSnapped, ySnapped } = getPointerPosition(event);
			prevValues.current = {
				width: node?.width ?? 0,
				height: node?.height ?? 0,
				x: node?.position.x ?? 0,
				y: node?.position.y ?? 0
			};
			startValues.current = {
				...prevValues.current,
				pointerX: xSnapped,
				pointerY: ySnapped,
				aspectRatio: prevValues.current.width / prevValues.current.height
			};
			onResizeStart?.(event, { ...prevValues.current });
		}).on("drag", (event) => {
			const { nodeInternals, triggerNodeChanges } = store.getState();
			const { xSnapped, ySnapped } = getPointerPosition(event);
			const node = nodeInternals.get(id);
			if (node) {
				const changes = [];
				const { pointerX: startX, pointerY: startY, width: startWidth, height: startHeight, x: startNodeX, y: startNodeY, aspectRatio } = startValues.current;
				const { x: prevX, y: prevY, width: prevWidth, height: prevHeight } = prevValues.current;
				const distX = Math.floor(enableX ? xSnapped - startX : 0);
				const distY = Math.floor(enableY ? ySnapped - startY : 0);
				let width = clamp(startWidth + (invertX ? -distX : distX), minWidth, maxWidth);
				let height = clamp(startHeight + (invertY ? -distY : distY), minHeight, maxHeight);
				if (keepAspectRatio) {
					const nextAspectRatio = width / height;
					const isDiagonal = enableX && enableY;
					const isHorizontal = enableX && !enableY;
					width = nextAspectRatio <= aspectRatio && isDiagonal || enableY && !enableX ? height * aspectRatio : width;
					height = nextAspectRatio > aspectRatio && isDiagonal || isHorizontal ? width / aspectRatio : height;
					if (width >= maxWidth) {
						width = maxWidth;
						height = maxWidth / aspectRatio;
					} else if (width <= minWidth) {
						width = minWidth;
						height = minWidth / aspectRatio;
					}
					if (height >= maxHeight) {
						height = maxHeight;
						width = maxHeight * aspectRatio;
					} else if (height <= minHeight) {
						height = minHeight;
						width = minHeight * aspectRatio;
					}
				}
				const isWidthChange = width !== prevWidth;
				const isHeightChange = height !== prevHeight;
				if (invertX || invertY) {
					const x = invertX ? startNodeX - (width - startWidth) : startNodeX;
					const y = invertY ? startNodeY - (height - startHeight) : startNodeY;
					const isXPosChange = x !== prevX && isWidthChange;
					const isYPosChange = y !== prevY && isHeightChange;
					if (isXPosChange || isYPosChange) {
						const positionChange = {
							id: node.id,
							type: "position",
							position: {
								x: isXPosChange ? x : prevX,
								y: isYPosChange ? y : prevY
							}
						};
						changes.push(positionChange);
						prevValues.current.x = positionChange.position.x;
						prevValues.current.y = positionChange.position.y;
					}
				}
				if (isWidthChange || isHeightChange) {
					const dimensionChange = {
						id,
						type: "dimensions",
						updateStyle: true,
						resizing: true,
						dimensions: {
							width,
							height
						}
					};
					changes.push(dimensionChange);
					prevValues.current.width = width;
					prevValues.current.height = height;
				}
				if (changes.length === 0) return;
				const direction = getDirection({
					width: prevValues.current.width,
					prevWidth,
					height: prevValues.current.height,
					prevHeight,
					invertX,
					invertY
				});
				const nextValues = {
					...prevValues.current,
					direction
				};
				if (shouldResize?.(event, nextValues) === false) return;
				onResize?.(event, nextValues);
				triggerNodeChanges(changes);
			}
		}).on("end", (event) => {
			const dimensionChange = {
				id,
				type: "dimensions",
				resizing: false
			};
			onResizeEnd?.(event, { ...prevValues.current });
			store.getState().triggerNodeChanges([dimensionChange]);
		});
		selection.call(dragHandler);
		return () => {
			selection.on(".drag", null);
		};
	}, [
		id,
		controlPosition,
		minWidth,
		minHeight,
		maxWidth,
		maxHeight,
		keepAspectRatio,
		getPointerPosition,
		onResizeStart,
		onResize,
		onResizeEnd
	]);
	const positionClassNames = controlPosition.split("-");
	const colorStyleProp = variant === ResizeControlVariant.Line ? "borderColor" : "backgroundColor";
	const controlStyle = color ? {
		...style,
		[colorStyleProp]: color
	} : style;
	return import_react.createElement("div", {
		className: cc([
			"react-flow__resize-control",
			"nodrag",
			...positionClassNames,
			variant,
			className
		]),
		ref: resizeControlRef,
		style: controlStyle
	}, children);
}
var ResizeControl$1 = (0, import_react.memo)(ResizeControl);
//#endregion
export { ResizeControl$1 as t };

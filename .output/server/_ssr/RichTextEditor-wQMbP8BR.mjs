import { r as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as useEditor, t as EditorContent } from "../_libs/fast-equals+tiptap__react.mjs";
import { n as index_default } from "../_libs/@tiptap/extension-link+[...].mjs";
import { n as index_default$1 } from "../_libs/tiptap__extension-underline.mjs";
import { t as index_default$2 } from "../_libs/@tiptap/extension-placeholder+[...].mjs";
import { t as index_default$3 } from "../_libs/tiptap__starter-kit.mjs";
import { t as index_default$4 } from "../_libs/tiptap__extension-highlight.mjs";
import { n as TextStyle, t as index_default$5 } from "../_libs/@tiptap/extension-color+[...].mjs";
import { t as index_default$6 } from "../_libs/tiptap__extension-task-list.mjs";
import { t as index_default$7 } from "../_libs/tiptap__extension-task-item.mjs";
import { t as index_default$8 } from "../_libs/tiptap__extension-text-align.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RichTextEditor-wQMbP8BR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function RichTextEditor({ id, content, contentJson, onChange, onBlur, placeholder = "Start writing...", editable = true }) {
	const editor = useEditor({
		extensions: [
			index_default$3.configure({
				heading: { levels: [
					1,
					2,
					3
				] },
				codeBlock: false
			}),
			index_default$1,
			index_default$4.configure({ multicolor: true }),
			TextStyle,
			index_default$5,
			index_default.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline",
					target: "_blank",
					rel: "noopener noreferrer"
				}
			}),
			index_default$6,
			index_default$7.configure({ nested: true }),
			index_default$2.configure({
				placeholder: () => placeholder,
				emptyEditorClass: "is-editor-empty",
				emptyNodeClass: "is-empty"
			}),
			index_default$8.configure({ types: ["heading", "paragraph"] })
		],
		content: contentJson ?? content ?? "",
		editable,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML(), editor.getJSON(), editor.getText());
		},
		onBlur: () => onBlur(),
		editorProps: { attributes: { class: "prose prose-sm max-w-none focus:outline-none min-h-[80px]" } }
	});
	const [bubblePos, setBubblePos] = (0, import_react.useState)(null);
	const [showBubble, setShowBubble] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!editor) return;
		editor.setEditable(editable);
	}, [editor, editable]);
	(0, import_react.useEffect)(() => {
		if (!editor) return;
		const updateBubble = () => {
			const { from, to, empty } = editor.state.selection;
			const isFocused = editor.isFocused;
			if (empty || !isFocused || from === to) {
				setShowBubble(false);
				return;
			}
			const sel = window.getSelection();
			if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
				setShowBubble(false);
				return;
			}
			const range = sel.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			if (!rect || rect.width === 0 && rect.height === 0) {
				setShowBubble(false);
				return;
			}
			const editorEl = document.querySelector(`[data-rich-id="${id}"]`);
			if (editorEl && !editorEl.contains(range.commonAncestorContainer)) {}
			const x = rect.left + rect.width / 2;
			let y = rect.top;
			if (y < 60) y = rect.bottom + 12;
			const clampedX = Math.max(120, Math.min(window.innerWidth - 120, x));
			setBubblePos({
				x: clampedX,
				y
			});
			setShowBubble(true);
		};
		editor.on("selectionUpdate", updateBubble);
		editor.on("transaction", updateBubble);
		const onBlurHide = () => setShowBubble(false);
		editor.on("blur", onBlurHide);
		const onEsc = (e) => {
			if (e.key === "Escape") setShowBubble(false);
		};
		window.addEventListener("keydown", onEsc);
		return () => {
			editor.off("selectionUpdate", updateBubble);
			editor.off("transaction", updateBubble);
			editor.off("blur", onBlurHide);
			window.removeEventListener("keydown", onEsc);
		};
	}, [editor, id]);
	(0, import_react.useEffect)(() => {
		if (!editor) return;
		if (!editable) setShowBubble(false);
	}, [editable, editor]);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		if (!editor) return;
		const mod = e.metaKey || e.ctrlKey;
		if (mod && e.key === "b") {
			e.preventDefault();
			editor.chain().focus().toggleBold().run();
		} else if (mod && e.key === "i") {
			e.preventDefault();
			editor.chain().focus().toggleItalic().run();
		} else if (mod && e.key === "u") {
			e.preventDefault();
			editor.chain().focus().toggleUnderline().run();
		} else if (mod && e.shiftKey && e.key === "s") {
			e.preventDefault();
			editor.chain().focus().toggleStrike().run();
		}
	}, [editor]);
	(0, import_react.useEffect)(() => {
		if (!editor || editor.isFocused) return;
		if (contentJson) {
			const currentJson = editor.getJSON();
			if (JSON.stringify(currentJson) !== JSON.stringify(contentJson)) editor.commands.setContent(contentJson);
		} else if (editor.getHTML() !== content) editor.commands.setContent(content);
	}, [
		content,
		contentJson,
		editor
	]);
	if (!editor) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-rich-id": id,
		className: "relative nodrag nowheel select-text",
		onKeyDown: handleKeyDown,
		style: { outline: "none" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorContent, { editor }), showBubble && bubblePos && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingToolbar, {
			editor,
			isVisible: showBubble,
			position: bubblePos
		}), document.body) : null]
	});
}
function FloatingToolbar({ editor, isVisible, position }) {
	if (!editor || !isVisible || !position) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-popover px-2 py-1.5 shadow-lg",
		style: {
			left: position.x,
			top: position.y - 44,
			transform: "translateX(-50%)"
		},
		role: "toolbar",
		"aria-label": "Text formatting",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: editor.isActive("heading", { level: 1 }) ? "heading1" : editor.isActive("heading", { level: 2 }) ? "heading2" : editor.isActive("heading", { level: 3 }) ? "heading3" : "paragraph",
				onChange: (e) => {
					const val = e.target.value;
					editor.chain().focus().clearNodes().run();
					if (val !== "paragraph") {
						const lvl = parseInt(val.slice(-1));
						editor.chain().focus().toggleHeading({ level: lvl }).run();
					}
				},
				className: "rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground outline-none focus:ring-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "paragraph",
						children: "Paragraph"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "heading1",
						children: "Heading 1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "heading2",
						children: "Heading 2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "heading3",
						children: "Heading 3"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border mx-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleBold().run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition-colors ${editor.isActive("bold") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Bold (⌘B)",
				children: "B"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleItalic().run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md text-sm italic transition-colors ${editor.isActive("italic") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Italic (⌘I)",
				children: "I"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleUnderline().run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md text-sm underline transition-colors ${editor.isActive("underline") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Underline (⌘U)",
				children: "U"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleStrike().run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md text-sm line-through transition-colors ${editor.isActive("strike") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Strikethrough (⌘⇧S)",
				children: "S"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleCode().run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs transition-colors ${editor.isActive("code") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Inline code",
				children: "</>"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border mx-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors",
					title: "Highlight",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
						display: "inline-block",
						width: "16px",
						height: "12px",
						background: editor.getAttributes("highlight")["color"] || "linear-gradient(90deg, var(--sut-highlight-sand), var(--sut-highlight-rose))",
						borderRadius: "2px",
						border: "1px solid var(--border)"
					} })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-full left-0 mb-1 hidden group-hover:block z-50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg",
						children: [[
							"Sand",
							"Apricot",
							"Rose",
							"Sage",
							"Sky",
							"Lavender"
						].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => editor.chain().focus().setHighlight({ color: `var(--sut-highlight-${name.toLowerCase()})` }).run(),
							title: name,
							className: `h-6 w-6 rounded transition-transform hover:scale-110 ${editor.getAttributes("highlight")["color"] === `var(--sut-highlight-${name.toLowerCase()})` ? "ring-2 ring-primary ring-offset-1" : ""}`,
							style: { background: `var(--sut-highlight-${name.toLowerCase()})` }
						}, name)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => editor.chain().focus().unsetHighlight().run(),
							className: "flex h-6 w-6 items-center justify-center rounded border border-dashed border-border hover:bg-surface-hover",
							title: "Remove highlight",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "×"
							})
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors",
					title: "Text color",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
						display: "inline-block",
						width: "16px",
						height: "12px",
						background: editor.getAttributes("textStyle")["color"] || "linear-gradient(90deg, #0f172a, #7c3aed)",
						borderRadius: "2px",
						border: "1px solid var(--border)"
					} })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-full left-0 mb-1 hidden group-hover:block z-50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg",
						children: [[
							{
								n: "Default",
								v: ""
							},
							{
								n: "Ink",
								v: "#0f172a"
							},
							{
								n: "Clay",
								v: "#78350f"
							},
							{
								n: "Rose",
								v: "#be123c"
							},
							{
								n: "Sage",
								v: "#15803d"
							},
							{
								n: "Blue",
								v: "#1d4ed8"
							},
							{
								n: "Lavender",
								v: "#7c3aed"
							}
						].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (c.v) editor.chain().focus().setColor(c.v).run();
								else editor.chain().focus().unsetColor().run();
							},
							title: c.n,
							className: `h-6 w-6 rounded transition-transform hover:scale-110 ${editor.getAttributes("textStyle")["color"] === c.v ? "ring-2 ring-primary ring-offset-1" : ""}`,
							style: c.v ? { background: c.v } : { background: "linear-gradient(90deg, #0f172a, #7c3aed)" }
						}, c.n)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => editor.chain().focus().unsetColor().run(),
							className: "flex h-6 w-6 items-center justify-center rounded border border-dashed border-border hover:bg-surface-hover",
							title: "Default",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "×"
							})
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border mx-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().setTextAlign("left").run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md transition-colors ${editor.getAttributes("paragraph")["textAlign"] === "left" || !editor.getAttributes("paragraph")["textAlign"] ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Align left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "≡"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().setTextAlign("center").run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md transition-colors ${editor.getAttributes("paragraph")["textAlign"] === "center" ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Align center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "≡"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().setTextAlign("right").run(),
				className: `flex h-8 w-8 items-center justify-center rounded-md transition-colors ${editor.getAttributes("paragraph")["textAlign"] === "right" ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`,
				title: "Align right",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "≡"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border mx-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleBulletList().run(),
				className: "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors",
				title: "Bullet list",
				children: "•"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleOrderedList().run(),
				className: "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors",
				title: "Numbered list",
				children: "1."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => editor.chain().focus().toggleTaskList().run(),
				className: "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors",
				title: "Task list",
				children: "☐"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-6 bg-border mx-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					const url = window.prompt("Enter URL:", "https://");
					if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
				},
				className: "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors",
				title: "Add link (⌘K)",
				children: "🔗"
			})
		]
	});
}
//#endregion
export { RichTextEditor };

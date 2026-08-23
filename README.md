# sutanote

Project Name: Sutonote
Project Goal: Build a local-first, open-source visual workspace and infinite canvas application (similar to Milanote but with a Figma-like, high-performance UI).

Tech Stack & Setup

Framework: React + Vite.

Styling: Tailwind CSS + shadcn/ui.

Icons: lucide-react (Do not use emojis for UI elements).

Animations: Framer Motion (subtle, professional transitions only).

Fonts: Use 'Plus Jakarta Sans' or 'Geist' for the UI interface, and 'Lora' (serif) or 'JetBrains Mono' for note editing contexts.

Strict Design System (Crucial - Avoid "AI Garbage" Look)

I want a premium, intentional, human-designed aesthetic. Strictly adhere to the following:

Colors: Do NOT use bright, saturated, or neon colors. Use a muted, earthy palette.

Light Mode Background: stone-100 (#F5F5F4). Canvas Background: stone-50 (#FAFAF9).

Dark Mode Background: deep charcoal/zinc (#0A0A0A or #18181B).

UI Elements: Muted stone, zinc, and slate tones.

Accent/Sticky Note Colors: Pastel/muted (dusty rose, sage green, soft lavender, muted yellow).

Shadows & Borders: NO glowing shadows. Use crisp 1px solid borders (border-stone-200 in light, border-zinc-800 in dark). Reserve subtle drop shadows (shadow-sm) ONLY for elements that are actively being dragged or hovered over.

Border Radius: Consistent and crisp. Use rounded-xl (12px) for cards and nodes, rounded-lg (8px) for buttons and inputs. Do not use fully pill-shaped buttons.

Spacing: Use generous padding. Do not cram elements together.

Layout Architecture

Build the "Workspace View" shell. The app should take up the full viewport height (100vh) and width (100vw), with no page scrolling—only inner component scrolling.

1. Top Header Bar (Height: 48px):

Left: Breadcrumb navigation (e.g., Workspace > Project Name > Current Board). Use a subtle divider like a chevron > between them.

Center: Empty (to maximize focus).

Right: A minimal cluster of lucide-react icons:

Undo & Redo arrows.

A "Sync Status" indicator (a small green dot with "Saved locally" text, or a cloud icon).

A settings/gear icon.

An export/download icon.

2. Left Sidebar (Width: 260px, Collapsible):

Header: The app name "Sutonote" in a clean, medium-weight font.

Action Button: A "New Board" button (primary accent color, but muted).

Navigation: A clean, tree-like list structure for folders and boards.

Active board should have a subtle bg-stone-200 highlight.

Hover states should be subtle (bg-stone-100).

Bottom: User profile/settings area.

3. Main Canvas Area (The Core):

This area should be a large div with a dot-grid background (use CSS radial-gradient to create subtle, small dots spaced 24px apart, color rgba(0,0,0,0.05) for light mode).

Placeholder: For this initial build, place a few static "Cards" in the center of this canvas to demonstrate the styling.

Card 1 (Text Card): A white rounded-xl card with subtle border, containing a title and some text.

Card 2 (Sticky Note): A muted yellow rounded-lg card containing placeholder text.

Card 3 (To-Do List): A card containing a list with 2 checked boxes and 1 unchecked box using lucide-react check icons.

Floating Context Menu (Mockup): Render a floating toolbar near the top center of the canvas (only visible when an item is theoretically selected). It should contain alignment icons (align left, top, distribute horizontally) and a color-picker swatch.

UX & Interaction Rules

Transitions: Use Framer Motion to make the left sidebar collapse smoothly.

Hover States: When hovering over the static cards on the canvas, apply a very subtle shadow-md and a slightly darker border.

Command Palette Mockup: Add a hidden state where pressing Cmd+K (or clicking a button) opens a centered, minimal modal with a search input and a list of actions ("Add Text", "Add Image", "Add To-do"). Use cmdk or standard shadcn modal.

Important Constraints for the AI

Do not add unnecessary text or placeholder lorem ipsum paragraphs explaining what the app does. Just build the UI shell.

Ensure the code is modular. Separate the Header, Sidebar, Canvas Area, and Canvas Cards into distinct React components.

The main goal is visual perfection and premium aesthetic. Think "Linear" or "Figma" levels of polish, not generic SaaS template.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7361c532-bb2d-4472-b3d6-4bd62d3c9ca1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

# Project Guidelines - Kill Team Companion App (KT OP 2025)

## Project Overview
This is a simple Single Page Application (SPA) designed as a mobile companion app for Kill Team. It is built with Vue 3, Vite, and Pinia, and is optimized for deployment on GitHub Pages.

## Project Structure
- `vue-project/`: Root of the Vue application.
- `vue-project/src/components/`: Reusable UI components (Header, Menu, etc.).
- `vue-project/src/views/`: Main content views (Home, About, etc.).
- `vue-project/src/stores/`: Pinia stores for state management (if needed).
- `vue-project/src/router/`: Vue Router configuration (using Hash history for GH Pages).

## Development Principles
- **Simplicity First**: Avoid over-engineering. Keep logic straightforward and focused on utility for players.
- **Mobile-First Design**: The app will be used primarily on mobile devices. Ensure responsive layouts and touch-friendly interactive elements.
- **CSS & Style Importance**: High priority on visual clarity, readability, and a thematic "Kill Team" aesthetic. Use scoped styles in components.
- **GitHub Pages Compatibility**: 
  - Always use `base: './'` in `vite.config.js`.
  - Always use `createWebHashHistory` in `router/index.js` to prevent 404s on page refresh.

## Guidelines for Junie
- **Styling**: When creating or modifying components, pay extra attention to CSS. Use modern layout techniques (Flexbox, Grid) and ensure high contrast for readability during games.
- **Testing**: Run manual checks or simple unit tests for complex logic. Since this is a simple companion app, visual verification is often sufficient unless logic gets complex.
- **Build**: Before final submission of major features, ensure the project builds correctly via `npm run build` (if requested).
- **Code Style**: Follow standard Vue 3 Composition API patterns. Keep components small and focused.
- **Menu Positioning**: Ensure the menu is positioned correctly and does not overlap with other elements. Prefer to position it at the top of the page. Dont modify menu css and style if not specified differently.
- **Coding**: update only code when asking, dont hallucinate. Dont refactor or modify code if not asked to.
- **Stay Simple**: try to write simple and readable code. Avoid unnecessary complexity.
- **State of the app**: ensure the state of the component is consistent and predictable. Use stores and pinia for state management.
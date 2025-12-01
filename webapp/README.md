# This Modern Career

A single-page visual essay and interactive simulation exploring how corporate hierarchies, merit, and luck shape careers. The page combines a scroll-driven narrative, an animated hierarchy simulation, and supporting data visualisations.

## Tech stack

- React + TypeScript (Vite)
- Recharts for data visualisation
- Framer Motion for animation
- Tailwind-style utility classes for layout and styling


## Scripts

Common `package.json` scripts:

- `npm run dev` – start the Vite dev server
- `npm run build` – create a production build
- `npm run preview` – preview the production build locally

## Project structure

Key files and folders:

- `App.tsx` – main page layout, scroll logic, and section composition
- `components/SimulationCanvas.tsx` – career hierarchy simulation
- `components/DataVizPanel.tsx` – outcome distributions and facet charts
- `components/HierarchyChart.tsx` – static hierarchy shape chart
- `components/Navbar.tsx` – top navigation and active section indicator
- `components/ui/*` – presentational primitives (section wrapper, headings, body text, buttons, scroll cards)
- `styles.css` – global styles, fonts, and simulation-layer layout

## Simulation overview

The simulation models a five-layer hierarchy with a fixed span of control. On each “stage” of a career:

1. Some agents retire, creating vacancies.
2. Promotions happen upward into open roles, based on a blend of merit and luck.
3. New hires enter at the bottom layer.

The user can adjust the overall level of luck and their own merit, then step through the five stages manually or via the scroll-driven tutorial.

## Data and charts

The data visualisations show aggregated results from many simulated careers—for example:

- The share of careers ending at each level
- How outcomes vary by merit percentile and luck
- When median performers tend to move into management

Numbers and distributions are generated offline via a Python Monte Carlo simulation and baked into the React app for fast rendering.

## License / usage

This repo is intended as a self-contained interactive essay. If you plan to reuse the simulation or visual patterns, please credit the original author and adapt responsibly.

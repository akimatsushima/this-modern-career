# This Modern Career

A visual essay and interactive simulation about corporate hierarchies, merit, and luck. The project has two main parts:

- **Web app (`webapp/`)** – React + TypeScript single-page app that presents the essay, interactive simulation, and charts.
- **Simulation (`simulation/`)** – Python scripts used to run large-scale Monte Carlo simulations and generate the datasets behind the charts.

---

## Web App (`webapp/`)

Built with [Vite](https://vitejs.dev/), React, and TypeScript.

### Install dependencies

```bash
cd webapp
npm install
```

### Run the dev server

```bash
cd webapp
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

### Build for production

```bash
cd webapp
npm run build
```

This produces a static bundle in `webapp/dist`.

The repository is configured with a GitHub Actions workflow (`.github/workflows/pages.yml`) to build from `webapp/` and deploy the contents of `webapp/dist` to GitHub Pages on pushes to `main`.

---

## Simulation (`simulation/`)

The `simulation/` folder contains the Python implementation of the Monte Carlo career model used for the aggregate results in the essay. A typical workflow is:

1. Set up a Python environment (e.g. via `venv` or conda).
2. Install any required packages (e.g. `numpy`, `pandas`) if they are not already available.
3. Run the main simulation script to generate CSV outputs.

Example (adjust paths / env as needed):

```bash
cd simulation
python career_simulation.py
```

The script writes CSV files that are then used for analysis and visualization in the web app.

---

## Repository Structure

- `webapp/` – React + TypeScript front end, including:
  - `App.tsx` – main essay layout, simulation, and charts
  - `components/` – visualization and UI components
  - `styles.css` – global typography and layout
- `simulation/` – Python simulation scripts and data generation
- `.github/workflows/pages.yml` – GitHub Pages build + deploy workflow
- `LICENSE` – project license

---

## License

See `LICENSE` for full terms.
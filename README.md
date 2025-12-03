# This Modern Career

A visual essay and interactive simulation about corporate hierarchies, merit, and luck. The project has two main parts:

- **Web app (`webapp/`)** – React + TypeScript single-page app that presents the essay, interactive simulation, and charts.
- **Simulation (`simulation/`)** – Placeholder for Python scripts that were used to generate the datasets behind the charts. The scripts are not included in this repository.

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

The `simulation/` folder currently contains a placeholder for the Python implementation of the Monte Carlo career model. The original scripts and CSV datasets used to generate the essay's charts are not included in this repository. 

The interactive simulation in the web app re-implements the same rules in TypeScript and React, allowing readers to explore the dynamics in real time. If you need the original Python scripts or datasets, they can be added to `simulation/` or provided separately.

---

## Repository Structure

- `webapp/` – React + TypeScript front end, including:
  - `App.tsx` – main essay layout, simulation, and charts
  - `components/` – visualization and UI components
  - `styles.css` – global typography and layout
- `simulation/` – Placeholder for Python simulation scripts and data generation
- `.github/workflows/pages.yml` – GitHub Pages build + deploy workflow
- `LICENSE` – project license

---

## License

See `LICENSE` for full terms.
- 👋 Hi, I’m Adrian
- 👀 I’m interested in becoming a software engineer
- 🌱 I’m currently learning Java
- 💞️ I’m looking to collaborate on anything really.
- 📫 How to reach me 

<!---
drxpadrian/drxpadrian is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->

## Relay — customer service dashboard

A responsive React dashboard for tracking agent performance, cases solved, QA scores, average handle time (AHT), and brand advocacy.

### Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

The development server uses port 5173. For a production build, run `npm run build`; `npm run preview` serves the resulting `dist/` directory locally.

### Features

- Overview, agents, and quality & advocacy views.
- 7-, 30-, and 90-day reporting periods with previous-period comparisons.
- Team filtering, agent search, sorting, and pagination.
- Agent profiles with performance summaries and resolution charts.
- CSV export of the selected team, reporting period, search, and sort order.
- Responsive layout, keyboard-accessible dialogs, and a metric guide.
- Bundled fonts; no external runtime services or credentials required.

### Data and metric definitions

This is a working frontend with deterministic **sample data**, not a live customer-service integration. Data ends on October 16, 2026. Agent definitions and daily record generation live in `src/metrics.js`; replace them with your service's data when integrating a backend. Availability indicators are also illustrative.

- **Cases solved:** resolved cases in the reporting period.
- **QA score:** review score weighted by reviewed conversation count. Target: 95%.
- **AHT:** total handling time divided by resolved cases, including after-case work.
- **Brand advocacy:** positive brand-recommendation responses divided by all survey responses.

### Validation

```sh
npm test
npm run build
npm run test:e2e
```

The browser tests use the cloud environment's `/usr/bin/chromium`. On a different machine, change `launchOptions.executablePath` in `playwright.config.js` to your installed Chromium executable, or remove `launchOptions` and run `npx playwright install chromium` to use Playwright's managed browser.

In a cloud environment with an unwritable default npm cache, use `npm ci --cache /tmp/relay-npm-cache`.

### GitHub Pages deployment

Dashboard source lives on the `relay-dashboard` branch; the production site is published to the `gh-pages` branch.

```sh
npm ci
npm run deploy
```

In the repository's **Settings → Pages**, select **Deploy from a branch**, choose **gh-pages** and **/ (root)**, then save. After GitHub completes its Pages build, the expected project URL is `https://drxpadrian.github.io/drxpadrian/`. This is an expected URL, not a guarantee of a completed deployment. Relative asset paths are configured in `vite.config.js` so the app works under that project path.

Updating the site requires running `npm run deploy` again from this repository with Git push access. GitHub Pages activation requires repository administration access.

```
 _____   _______
|  __ \ |__   __|
| |  | |   | |
| |  | |   | |
| |__| |   | |
|_____/    |_|

```

# Digitaltableteur

Digitaltableteur is a portfolio site. The project was originally built with React and Vite but now runs on [Next.js](https://nextjs.org/) using the App Router and static export. Below you'll find how to run the project and a quick overview of the folder structure.

## Getting Started

Install dependencies with:

```bash
npm ci
```

Copy `.env.example` to `.env` and fill in your EmailJS credentials if you want the contact form to work locally. The file also includes `REACT_APP_GA_ID` for configuring Google Analytics:

```bash
cp .env.example .env
```

Set `REACT_APP_GA_ID` to your Google Analytics measurement ID if you want to collect usage statistics.

### Run the development server

```bash
npm run dev
```

Next.js serves the app at `http://localhost:3000` by default and reloads as you edit files.

### Run Storybook

```bash
npm run storybook
```

This will start Storybook at `http://localhost:6006` so you can browse the UI components.

### Build for production

```bash
npm run export
```

The static site is generated in the `out` folder.

### Lint

Run all code quality checks with:

```bash
npm run lint
```

Stylelint is configured with `stylelint-declaration-strict-value` to warn about
hardcoded color values in CSS files and inline styles found in `.tsx` and `.html`
files. Use CSS variables or functions for colors to avoid warnings.

### Service worker

The app registers a service worker using Workbox to cache static assets and
pages. The registration happens in `src/index.tsx` via the helper in
`serviceWorkerRegistration.ts`.

To update the service worker, deploy a new build and refresh any open tabs so
the new worker can take control. If offline support needs to be disabled,
replace the `register()` call with `unregister()` in `src/index.tsx` and rebuild
the project.

### Fetch Figma design

If you need the raw design data, you can download the Figma file as JSON. Set the
`FIGMA_TOKEN` environment variable with your personal access token, then run:

```bash
npm run fetch-figma
```

The file is saved as `figma.json` in the project root.

## Pull Request Workflow

Every pull request is validated with lint and unit tests using GitHub Actions.
Preview builds are automatically deployed so changes can be reviewed live.
A comment with a link to the preview URL is posted on each PR once deployment finishes.
If the workflow fails with a "branch is not allowed to deploy" error, check the
environment rules for GitHub Pages. Go to **Settings → Environments →
`github-pages`** and make sure the branch restrictions allow your pull request
branches, otherwise the preview deployment will be rejected.

## Folder overview

- **src/** – application source code
- **app/** – Next.js app directory
- **public/** – static assets
- **.storybook/** – Storybook configuration files
- **out/** – static export (generated after running `npm run export`)
- **node_modules/** – project dependencies installed via npm

## Learn More

This project now uses [Next.js](https://nextjs.org/) with the App Router. See the [Next.js documentation](https://nextjs.org/docs) for more details.

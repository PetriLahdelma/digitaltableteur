# Digitaltableteur
              
Digitaltableteur is a React application for a portfolio site. Below you'll find how to run the project and a quick overview of the folder structure.

## Getting Started

Install dependencies with:

```bash
npm ci
```

Copy `.env.example` to `.env` and fill in your EmailJS credentials if you want the contact form to work locally:

```bash
cp .env.example .env
```

### Run the development server

```bash
npm start
```

Open `http://localhost:3000` in your browser. The app automatically reloads as you edit files.

### Run Storybook

```bash
npm run storybook
```

This will start Storybook at `http://localhost:6006` so you can browse the UI components.

### Build for production

```bash
npm run build
```

The optimized output is placed in the `build` folder.

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

## Folder overview

- **src/** – application source code
- **public/** – static assets and the HTML template
- **.storybook/** – Storybook configuration files
- **build/** – compiled production build (generated after running `npm run build`)
- **node_modules/** – project dependencies installed via npm

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can read the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) and the [React documentation](https://reactjs.org/) for more details.

    _ _      _ _        _ _        _    _     _                
 __| (_)__ _(_) |_ __ _| | |_ __ _| |__| |___| |_ ___ _  _ _ _ 
/ _` | / _` | |  _/ _` | |  _/ _` | '_ \ / -_)  _/ -_) || | '_|
\__,_|_\__, |_|\__\__,_|_|\__\__,_|_.__/_\___|\__\___|\_,_|_|  
       |___/                                                   

# Digital Tableteur

Digital Tableteur is a React application. Below you'll find how to run the project and a quick overview of the folder structure.

## Getting Started

Install dependencies with:

```bash
npm ci
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

## Folder overview

- **src/** – application source code
- **public/** – static assets and the HTML template
- **.storybook/** – Storybook configuration files
- **build/** – compiled production build (generated after running `npm run build`)
- **node_modules/** – project dependencies installed via npm

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can read the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) and the [React documentation](https://reactjs.org/) for more details.

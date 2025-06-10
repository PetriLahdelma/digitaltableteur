# Digitaltableteur

 (            
 )\ )  *   )  
(()/(` )  /(  
 /(_))( )(_)) 
(_))_(_(_())  
 |   \_   _|  
 | |) || |    
 |___/ |_|    
              
Digitaltableteur is a React application for a portfolio site. Below you'll find how to run the project and a quick overview of the folder structure.

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

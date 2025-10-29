```
 _____   _______
|  __ \ |__   __|
| |  | |   | |
| |  | |   | |
| |__| |   | |
|_____/    |_|

```

# Digitaltableteur

> "Iteration beats perfection—ship today, learn tomorrow, refine forever."

Digitaltableteur is a modern React TypeScript portfolio website built with Vite, featuring internationalization,
responsive design, secure content delivery, and a comprehensive design system. The project showcases creative work,
technical articles, and provides multi-language support across English, Finnish, and Swedish.

## 🚀 Features

- **Multi-language Support**: Complete i18n implementation with English, Finnish, and Swedish translations
- **Responsive Design**: Mobile-first approach with adaptive layouts for all device sizes
- **Secure CV Download**: Password-protected resume download with real-time validation
- **Design System**: Comprehensive component library with consistent styling and theming
- **Blog Platform**: Dynamic article system with lazy loading and SEO optimization
- **Contact Integration**: EmailJS-powered contact form with validation
- **Performance Optimized**: Vite build system with code splitting and asset optimization
- **Accessibility**: WCAG compliant components with proper ARIA support
- **SEO Ready**: React Helmet integration with dynamic meta tags and sitemap generation

## 🏁 Getting Started

### Prerequisites

- Node.js (recommended: latest LTS version)
- npm or yarn package manager

### Installation

Install dependencies:

```bash
npm install
```

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Configure the following environment variables:

- EmailJS credentials for contact form functionality
- VITE_GA_ID for Google Analytics tracking
- FIGMA_TOKEN for design asset synchronization
- CV_PASSWORD for secure resume download (production only)

## ⚒️ Development

Set `REACT_APP_GA_ID` to your Google Analytics measurement ID if you want to collect usage statistics.

### Start the development server

```bash
npm start
```

```bash
npm run dev
```

The application will be available at http://localhost:5173 with hot module replacement.

### Run Storybook

```bash
npm run storybook
```

Browse components at http://localhost:6006 for isolated development and testing.

### 🏗 Build & Deployment

```bash
npm run build
```

Generates optimized assets in the dist directory with:

Tree-shaken JavaScript bundles
Minified CSS with vendor prefixes
Compressed images and fonts
Service worker for offline caching

### Deployment

```bash
npm run deploy
```

Automatically builds and deploys to GitHub Pages with:

CNAME file configuration for custom domain
Cache busting with content hashes
Dotfiles preservation for GitHub Pages compatibility

## 🔧 Development Tools

### Code Quality

Run all code quality checks with:

```bash
npm run lint
```

Runs comprehensive checks including:

- ESLint: TypeScript and React best practices
- Prettier: Consistent code formatting
- Stylelint: CSS standards with strict color value enforcement

### Testing

```bash
npm test
```

Executes Vitest test suite with:

Component unit tests
Integration testing
Coverage reporting

## 🎨 Design Asset Management

### Fetch Figma design

If you need the raw design data, you can download the Figma file as JSON. Set the
`FIGMA_TOKEN` environment variable with your personal access token, then run:

```bash
npm run fetch-figma
```

Synchronizes design tokens and assets from Figma using the API.
The file is saved as `figma.json` in the project root.

### SEO & Content Generation

```bash
npm run generate:sitemap    # Generate XML sitemap
npm run generate:llms       # Create LLM-friendly content index
npm run generate:alt-text   # Generate accessibility descriptions
```

## 🏗 Architecture

Frontend Stack

- React 18: Modern React with concurrent features
- TypeScript 5.8: Full type safety and developer experience
- Vite 6.3: Lightning-fast build tooling and HMR
- React Router 7: Client-side routing with lazy loading
- i18next: Internationalization with namespace support
- Framer Motion: Smooth animations and transitions

Styling & Design

- CSS Modules: Scoped styling with consistent naming
- Design Tokens: CSS custom properties for theming
- Responsive Design: Mobile-first with breakpoint system
- Component Library: Reusable @dt/ components with TypeScript

Backend Services

- Vercel Serverless: API endpoints for secure operations
- EmailJS: Contact form email delivery
- GitHub Pages: Static site hosting with custom domain
- Service Worker: Offline caching with Workbox

Security Features

- Password Protection: Secure CV download with API validation
- CORS Configuration: Proper cross-origin resource sharing
- Environment Isolation: Secure credential management
- Content Security: Sanitized user inputs and XSS protection

## 🌐 Internationalization

The site supports three languages with complete translation coverage:

- English (EN): Primary language with full content
- Finnish (FI): Native language support
- Swedish (SV): Regional language support

Translation files are located in locales with namespace organization for maintainability.

## 🔐 Security & Performance

Security Measures

- Password-protected content delivery
- Environment-based configuration
- CORS-enabled API endpoints
- Sanitized user inputs

Performance Optimizations

- Code splitting with dynamic imports
- Image optimization and lazy loading
- Service worker caching strategy
- Bundle analysis and tree shaking
- Compressed asset delivery

## 🚀 CI/CD Pipeline

GitHub Actions

- Automated Testing: ESLint, Stylelint, and Vitest on every PR
- Preview Deployments: Automatic staging environments for pull requests
- Production Deployment: Automated builds and cache busting

Branch Protection

- Required status checks for code quality
- Review requirements for main branch
- Automated preview environments for collaboration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new components
- Follow the existing CSS Modules pattern
- Add translations for all user-facing text
- Include Storybook stories for new components
- Maintain test coverage for critical functionality

## 📁 Folder overview

- **src/** – application source code
- **public/** – static assets and the HTML template
- **.storybook/** – Storybook configuration files
- **dist/** – compiled production build (generated after running `npm run build`)
- **node_modules/** – project dependencies installed via npm

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev/) - Build tool and development server
- [React Documentation](https://react.dev/) - Frontend framework
- [React Router](https://reactrouter.com/) - Client-side routing
- [i18next](https://www.i18next.com/) - Internationalization framework
- [Storybook](https://storybook.js.org/) - Component development environment

# paint-to-kid

This project was created with [Better Fullstack](https://github.com/Marve10s/Better-Fullstack), a modern TypeScript stack that combines React, Vite SPA, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React + Vite** - Client-routed React SPA powered by Vite
- **TailwindCSS** - CSS framework
- **shadcn/ui** - UI components
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **PWA** - Progressive Web App support

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the web application.

## PWA Support with React Router v7

There is a known compatibility issue between VitePWA and React Router v7.
See: https://github.com/vite-pwa/vite-plugin-pwa/issues/809

## Git Hooks and Formatting

- Initialize hooks: `pnpm run prepare`
- Format and lint fix: `pnpm run check`

## Project Structure

```
paint-to-kid/
├── apps/
│   ├── web/         # Frontend application (React + Vite SPA)
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run check`: Run Biome formatting and linting
- `cd apps/web && pnpm run generate-pwa-assets`: Generate PWA assets

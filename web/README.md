# Project UIL: ATLAS

**ATLAS** is a comprehensive research repository and knowledge architecture designed to document, categorize, and synthesize Human Frictions and Behavioral Patterns across digital ecosystems. This Next.js application serves as the interactive presentation layer for the ATLAS research repository, transforming raw markdown documentation into a highly polished, searchable, and interconnected digital experience.

## Project Overview

Project UIL (User Interaction Logic) aims to map the fundamental frictions and behavioral adaptations users experience when interacting with complex systems. The ATLAS repository is the single source of truth for this research.

Instead of maintaining a separate database, this Next.js application is entirely **document-driven**. It parses the official `.md` files directly from the repository and dynamically renders them into interactive dashboards, registries, and exploratory interfaces.

## Features

- **ATLAS Explorer**: A categorized library of documented Human Frictions, complete with metadata, context, examples, and cross-referenced behavioral patterns.
- **Pattern Explorer**: An index of Behavioral Patterns demonstrating how users cognitively and behaviorally adapt to system frictions.
- **Live Metrics Dashboard**: Automatically parses canonical Word/Markdown metric reports into interactive visualization dashboards without requiring manual data entry.
- **Dynamic Registries**: Modern, interactive, and searchable Registry tables (APID, Category, Pattern) driven completely by the source documentation.
- **Global `cmd+k` Search**: Instant, fully-indexed offline search across the entire repository using Pagefind.
- **Document-Driven Architecture**: The UI automatically updates whenever the underlying repository files change.

## Repository Structure

The project directory is structured as follows:

- `content/`
  - `atlas/`: The canonical source directory containing all Human Friction markdown documents (e.g., `AU-001.md`).
  - `patterns/`: The source directory for Behavioral Pattern documents.
  - `docs/`: System documentation, methodologies, and framework overviews.
  - `registries/`: The official Registry documents mapped to dynamic tables.
  - `metrics/`: Canonical reports containing repository statistics and milestones.
- `src/`
  - `app/`: Next.js App Router definitions. Contains all page routes (`/atlas`, `/patterns`, `/registries`, `/metrics`, etc.).
  - `components/`: React components (Clients, Layouts, Interactive Widgets).
  - `lib/`: Core utilities (e.g., Markdown parsing, Registry extraction, Pagefind integration).
- `public/`: Static assets (images, fonts, generated Pagefind search index).

## Installation

To set up the repository on a new machine:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atlas/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

4. **Production Build**
   ```bash
   npm run build
   ```
   This will compile the Next.js application and generate the Pagefind search index.

## Environment Variables

This project is fully static and does not require active database connections or external API keys to build. All data is read from the local file system at build time.

*(If you add any server-side analytics or telemetry later, create a `.env.local` file and declare them there. Do not commit `.env` files containing secrets.)*

## Build Commands

- `npm run dev`: Starts the local development server.
- `npm run build`: Executes the full production build sequence (compiles Next.js, generates static HTML, and builds the Pagefind search index).
- `npm run lint`: Runs ESLint to catch code quality issues.
- `npm run start`: Starts a production server (only applicable if not exporting statically).

## Deployment

This application is designed to be effortlessly deployed to [Vercel](https://vercel.com).

1. Push your code to a GitHub repository.
2. Log into Vercel and select **Add New > Project**.
3. Import your GitHub repository.
4. **Build Command**: `npm run build`
5. **Output Directory**: `out` (or `.next` depending on your `next.config.ts` export settings).
6. Click **Deploy**.

Vercel will automatically detect the Next.js framework, compile the static routes, execute the Pagefind index generation, and deploy the research repository globally. Because the site relies entirely on repository files, updates to any `.md` file will automatically trigger a new Vercel deployment if connected via Git integration.

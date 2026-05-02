# Mulingo Monorepo

Welcome to the **Mulingo** monorepo! This repository contains the source code for the Mulingo application. It is structured to handle both the backend APIs and frontend application within a unified workspace.

## Tech Stack Overview

- **Monorepo Manager**: npm Workspaces
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL 8.0 
- **Tooling**: ESLint (v9 Flat Config), Prettier, Nodemon, TypeScript Compiler (tsc)
- **Infrastructure**: Docker & Docker Compose (Multi-stage Dev & Prod Environments)

For a fully free cloud deployment (Vercel + Render + free MySQL), see `DEPLOYMENT_FREE.md`.

---

## Directory Structure

```text
mulingo/
├── backend/                # Express & TypeScript Backend
│   ├── src/                # Backend Source code
│   ├── dist/               # Compiled JavaScript (generated on build)
│   ├── Dockerfile          # Multi-stage Docker definitions
│   ├── eslint.config.mjs   # ESLint 9 Flat Configuration
│   ├── tsconfig.json       # TypeScript Configuration
│   └── package.json        # Backend dependencies and scripts
│
├── frontend/               # Frontend Application (Placehoder)
│
├── docker-compose.yml       # Docker configuration for Local Development
├── docker-compose.prod.yml  # Docker overwrite for Production Deployment
├── package.json             # Root workspace definitions & proxy scripts
└── .dockerignore            # Files that won't be sent to Docker daemon
```

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) (latest)
- [Docker](https://www.docker.com/products/docker-desktop) and [Docker Compose](https://docs.docker.com/compose/install/)

---

## Quick Start (with Docker)

We heavily utilize Docker to maintain a pristine, reproducible environment. This handles the MySQL Database provisioning as well as running the Backend.

### 🛠️ Development Mode (Hot-Reload Enabled)

This mode mounts your local code into the container. Any changes you make to the `/backend/src` folder will automatically trigger Nodemon to restart the server seamlessly.

To start the local development environment:
```bash
docker-compose up --build
```
> **What this does:**
> - Spins up a `mysql:8.0` container with persistent volumes
> - Builds the backend targeting the `development` stage
> - Runs `npm run dev` in the container
> - Maps local port `3000` to the backend and `3306` to MySQL.

### 🚀 Production Mode

To test or deploy the actual lightweight image that will run on a production server (with no hot-reloading sidecar tools, and no access to your local uncompiled code), you need to stitch the base compose file with the production override:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```
> **What this does:**
> - Builds the backend targeting the `production` stage
> - Strips out devDependencies inside the container
> - Copies the compiled JavaScript from the `dist` directory
> - Sets `NODE_ENV=production`

To shut down any of the Docker environments safely, run:
```bash
docker-compose down
```

---

## Running Locally Without Docker

If you prefer to run the Node.js application raw on your host machine without Docker (you will need to provide your own MySQL database connection):

1. **Install Dependencies:**
   From the root of the project, run:
   ```bash
   npm install
   ```
   *(npm Workspaces will correctly install all frontend and backend dependencies)*

2. **Run Backend in Dev Mode:**
   ```bash
   npm run dev
   ```

3. **Build the Backend:**
   ```bash
   npm run build
   ```

4. **Start the Compiled Backend:**
   ```bash
   npm start
   ```

## Linting & Formatting

We enforce a strict code style using the newest ESLint Flat Config mechanics coupled with Prettier. 

Currently, rules cover TypeScript strict typings and clean spacing parameters:

- **ESLint rules config**: `backend/eslint.config.mjs`
- **Prettier config**: `backend/.prettierrc`

*(Scripts are prepared to be added for formatting across the entire monorepo based on your CI/CD needs.)*

---

## API Health Check

Once the app is running—either locally or via Docker—you can verify the system is up by visiting:

```text
http://localhost:3000/health
```

It will return:
```json
{
  "status": "ok",
  "message": "Backend is healthy"
}
```

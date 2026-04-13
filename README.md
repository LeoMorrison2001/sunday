# Sunday

A full-stack monorepo project built with React + Vite (client) and Node.js + TypeScript (server), managed by pnpm workspaces.

## Project Structure

```
sunday/
├── client/          # Frontend - React 19 + Vite 8 + TypeScript
├── server/          # Backend  - Node.js + TypeScript (tsx)
├── packages/        # Shared packages
├── docker/          # Docker configuration
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js
- pnpm 10+

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start dev servers:

```bash
# Client
pnpm --filter client dev

# Server
pnpm --filter server dev
```

Build client for production:

```bash
pnpm --filter client build
```

## Tech Stack

| Layer   | Technology                        |
| ------- | --------------------------------- |
| Client  | React 19, Vite 8, TypeScript 6   |
| Server  | Node.js, TypeScript, tsx          |
| Package | pnpm workspaces                   |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PKI Visualizer - An interactive web application that visualizes Public Key Infrastructure (PKI) components and their relationships using a force-directed graph. Each component displays relevant OpenSSL commands.

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server (http://localhost:5173)
npm run build  # Production build to dist/
npm run preview # Preview production build
```

## Architecture

- **React + Vite** - Frontend framework and build tool
- **react-force-graph-2d** - D3-based force-directed graph visualization

### Key Files

- `src/data/pkiNodes.js` - PKI component definitions with OpenSSL commands
- `src/data/pkiLinks.js` - Relationships between PKI components
- `src/components/PKIGraph.jsx` - Force-directed graph visualization
- `src/components/CommandPanel.jsx` - Displays commands for selected node

### PKI Components

11 components organized by category:
- **CA**: Root CA, Intermediate CA
- **Certificates**: Server Certificate, Client Certificate
- **Keys**: Private Key, Public Key
- **Request**: CSR
- **Revocation**: CRL, OCSP Responder
- **Store/Chain**: Trust Store, Certificate Chain

## Adding New Components

1. Add node definition to `src/data/pkiNodes.js` with `id`, `label`, `category`, `description`, and `commands` array
2. Add relationships to `src/data/pkiLinks.js` with `source`, `target`, and `label`

<div align="center">

# 🕷️ Repository Scraper

**A lightweight microservice that recursively extracts all source code from any GitHub repository.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Framework-Express-000000?style=flat-square&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

</div>

---

## ✨ What is this?

Repository Scraper is a simple, focused Express microservice that walks a GitHub repository tree via the GitHub Contents API and returns every readable file's path and content as a clean array — ready to be embedded, indexed, or analyzed.

It was built as the scraping backbone for **[SearchIt](https://github.com/solo8116/searchit)**, but works as a standalone service for any use case that needs raw code extracted from a GitHub repo.

---

## 🚀 How It Works

```
POST /api/extract
       │
       ▼
  GitHub Contents API
  /repos/{owner}/{repo}/contents/{path}
       │
       ├── file ──► base64 decode ──► add to result
       │
       └── dir  ──► recurse ──────► repeat
       │
       ▼
  Returns: [ [filePath, fileContent], ... ]
```

1. Receives a GitHub repo URL, a starting path, and a GitHub token
2. Calls the GitHub Contents API to list files and directories
3. Recursively walks every directory
4. Base64-decodes each file's content (skips binary/unreadable files automatically)
5. Returns a flat array of `[filePath, fileContent]` pairs

---

## 📦 Project Structure

```
repository-scraper/
├── src/
│   ├── index.ts          # Express app & /api/extract route
│   ├── extractCode.ts    # Recursive GitHub tree walker
│   ├── decoder.ts        # Base64 → UTF-8 decoder (filters binary files)
│   └── types.ts          # TypeScript types
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A GitHub personal access token (for private repos; public repos need one too to avoid rate limits)

### 1. Clone & Install

```bash
git clone https://github.com/solo8116/repository-scraper
cd repository-scraper
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

```env
PORT=3000
```

> The GitHub token is passed per-request, not stored in env — so no extra config needed.

### 3. Run

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The service will be available at `http://localhost:3000`.

---

## 📡 API Reference

### `POST /api/extract`

Recursively extracts all readable files from a GitHub repository.

**Request Body:**

```json
{
  "url": "https://github.com/owner/repo",
  "path": "/",
  "token": "ghp_your_github_token",
  "skipPaths": ["node_modules", "dist", ".git", "build"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | `string` | ✅ | Full GitHub repository URL |
| `path` | `string` | ✅ | Starting path (use `"/"` for the root) |
| `token` | `string` | ✅ | GitHub personal access token |
| `skipPaths` | `string[]` | ❌ | Paths to skip (e.g. `node_modules`, `dist`) |

**Success Response `200`:**

```json
{
  "success": true,
  "message": "code extracted successfully",
  "data": [
    ["src/index.ts", "import express from 'express';\n..."],
    ["src/types.ts", "export type TExtract = {\n..."],
    ["README.md", "# My Project\n..."]
  ]
}
```

**Error Response `500`:**

```json
{
  "success": false,
  "message": "Error while communicating with GitHub API. ..."
}
```

---

## 💡 Key Behaviours

**Binary file filtering** — The decoder automatically skips files that can't be decoded as valid UTF-8 (images, compiled binaries, etc.), so you only get readable source files back.

**Recursive traversal** — Directories are walked depth-first. The entire repo tree is flattened into a single array, no matter how deeply nested.

**Skip paths** — Pass `skipPaths` to exclude heavy or irrelevant directories like `node_modules`, `dist`, or `__pycache__`. This significantly speeds up scraping on large repos.

**GitHub token** — Even for public repos, passing a token avoids GitHub's anonymous rate limit of 60 requests/hour. Authenticated requests get 5,000 requests/hour.

---

## 🔗 Used By

This service is the scraping layer for **[SearchIt](https://github.com/solo8116/searchit)** — an AI-powered RAG tool that lets you ask natural language questions about any GitHub repository.


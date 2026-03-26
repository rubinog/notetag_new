<p align="center">
  <img src="public/logo.png" alt="NoteTag Logo" width="120" />
</p>

<h1 align="center">NoteTag</h1>

<p align="center">
  <i>Privacy-first notes with Markdown, threads, and native GitHub sync.</i>
</p>

Official repository: https://github.com/rubinog/notetag_new

NoteTag is a fast note-taking app inspired by Memos. Data is stored locally in the browser and can be synced to your own private GitHub repository, so you keep full ownership of your notes.

## Features

- GitHub auto-sync for create, update, and delete operations.
- Rich Markdown rendering with task lists and syntax highlighting.
- Nested replies to build threaded note conversations.
- Tag-based organization with quick filtering.
- Internal note linking.
- Focus mode composer.
- Mobile-optimized UI (drawer sidebar, bottom-sheet modals, floating action button).

## Tech Stack

- React + Vite + TypeScript
- Vanilla CSS
- Lucide React
- markdown-it + highlight.js
- GitHub REST API

## Getting Started

### 1) Clone

```bash
git clone https://github.com/rubinog/notetag_new.git
cd notetag_new
```

### 2) Install dependencies

```bash
npm install
```

### 3) Run in development

```bash
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`).

### 4) Run from phone on local network

```bash
npm run dev -- --host
```

Then open the LAN URL shown by Vite (example: `http://192.168.1.20:5173`) from your mobile device on the same Wi-Fi.

### 5) Production build

```bash
npm run build
npm run preview
```

## Docker

Run with Docker Compose:

```bash
docker compose up --build -d
```

App URL: `http://localhost:8080`

Notes:
- Multi-stage Docker build (Node -> Nginx).
- Nginx serves the static app and handles SPA routing.

## Configure GitHub Sync

1. Create a private repository on GitHub (example: `my-notes`).
2. Create a Personal Access Token:
   - Classic token with `repo` scope, or
   - Fine-grained token with read/write access to repository contents.
3. In NoteTag, open Settings and fill:
   - Owner (GitHub username)
   - Repository name
   - Token
4. Save config.

## Useful Scripts

- `npm run dev` - start development server
- `npm run build` - type-check and create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Contributing

Issues and pull requests are welcome.

## License

This project is open source. Add your preferred license file if needed.

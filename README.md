# 📝 NoteTag
> A beautiful, privacy-first, Memos-inspired note-taking application that syncs natively with your GitHub repository.

NoteTag is built for developers and thinkers who want a rapid, distraction-free environment to jot down thoughts, snippets, and ideas. Instead of relying on a proprietary third-party database, **NoteTag uses your own private GitHub repository as the backend**, guaranteeing you 100% ownership and control over your data.

## ✨ Features

- **GitHub Auto-Sync**: Every note you create, edit, or delete is instantly and silently synced to your GitHub repo in the background.
- **Rich Markdown & Code Support**: Full markdown parsing including task lists, blockquotes, and native code syntax highlighting via `highlight.js`.
- **Nested Threads (Comments)**: Reply to your own notes to create infinite sub-threads and expand on your ideas over time.
- **Hashtag Organization**: Type `#any-tag` to automatically categorize notes. A quick-access tag menu helps you filter your feed instantly.
- **Focus Mode**: Expand the composer to a full-screen, distraction-free writing environment.
- **Note Linking**: Easily cross-reference your thoughts using the internal note-linking tool.
- **Customizable Theming**: Choose your favorite accent color and enjoy a pristine UI built with flexible CSS variables.

## 🚀 Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Modern Vanilla CSS
- **Icons**: Lucide React
- **Markdown & Highlighting**: `markdown-it`, `highlight.js`
- **API**: Native GitHub REST API integration

## 📦 Setup & Installation

If you want to run NoteTag locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/rubinog/notetag.git
   cd notetag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## ⚙️ How to configure GitHub Sync

To enable cloud synchronization:
1. Create a **Private Repository** on your GitHub account (e.g., `my-notes`).
2. Generate a **Personal Access Token (Classic)** from `Developer Settings > Personal access tokens` with `repo` permissions (or a Fine-Grained token with Content Read/Write access).
3. Open the NoteTag Settings ⚙️ and enter your Username, Repository Name, and PAT.
4. Click **Save Config**. You're all set! NoteTag will now seamlessly auto-sync in the background.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to open an issue or pull request on the repository.

## 📝 License

This project is open-source.

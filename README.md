# 🚀 CHATLY - AI Memory Vault & Cross-Platform Bridge

> *"Bro, I'm telling you—when you're working with multiple AI tools like ChatGPT, Claude, Gemini, and other AI assistants for coding, research, and projects, one problem keeps hitting hard: context loss. Whether an AI reaches its token limit, a conversation becomes too long, or you simply want to switch to another AI platform, carrying over the entire context becomes a nightmare. Re-explaining your project background, previous errors, decisions, and everything you've already built again and again is exhausting. After getting tired of manually copying, pasting, and spoon-feeding context every single day, I thought, 'Enough is enough. I need a permanent solution.' And that's how **CHATLY** was born!"* 🔥

---

## 😤 The Real Problem (Why I Had to Build This)

While juggling college projects, debugging code, and machine learning experiments, I faced two major daily pains:

1. **Context Limit / Token Exhaustion:** When an AI either runs out of limit or starts forgetting earlier details, forcing you to move to a new chat window.

2. **Platform Switching:** Wanting to test a tricky logic piece from ChatGPT over on Claude or Gemini.

Normally, you are stuck in this loop:

- Scroll through past messages → **Copy long chunks** → Open a new chat → **Paste & re-explain everything from scratch.** Ugh! 😤

I wanted something lightweight that would quietly sit in my browser, keep all my chats locally secure, and magically port my active context over to a new chat or another AI with a single click—zero friction, zero hassle.

---

## 🛠️ Under the Hood: How I Built It (Technical Breakdown)

This isn't just a simple static HTML page; it uses a proper **Chrome Extension Architecture**:

### 1. **The Popup UI (`popup.html` & `popup.js`)**

- Built a sleek, modern glassmorphism UI from scratch using pure CSS variables and clean layout styling.
- Replaced boring generic icons with customized `icon.png` branding to give it a production-ready SaaS look.

### 2. **The Brain (`background.js` Service Worker)**

- Handles background events and data persistence using `chrome.storage.local`.
- Ensures that all chat data stays 100% private and secure inside the user's local browser storage.

### 3. **The Magic Bridge (`content.js` & DOM Injection)**

- The hardest part was figuring out how different websites (ChatGPT, Claude, Gemini) structure their underlying DOM.
- `content.js` injects into target tabs, reads active context, and safely populates input fields.
- **The Genius Hack:** Added a smart system-instruction wrapper so that when context is injected into the destination AI, it doesn't instantly auto-reply—it quietly reads and references the context for your next prompt without interrupting you. 🤫

---

## ✨ Core Features That Actually Matter

- **🗄️ Local Memory Vault:** Zero server dependencies, zero external database costs. Everything lives safely inside your browser's local storage.
- **🚀 Jump to AI (`🚀`):** One-click cross-platform or fresh-chat context transfer. Move seamlessly without losing your train of thought.
- **📥 Offline Archives:** Need to save a chat forever? Export your history instantly into `.txt`, `.json`, or `.md` files.
- **⚡ Zero Bloat:** Super lightweight, fast, and optimized for daily developer workflows.

---

## 👨‍💻 Tech Stack Used

- **JavaScript (ES6+)** — Core logic, async/await handling, and DOM automation.
- **HTML5 & CSS3** — Responsive layout and glassmorphism styling.
- **Chrome Extensions APIs** — `chrome.storage`, `chrome.scripting`, `chrome.tabs`, and active tab management.

---

## 📥 How to Run It Locally

Want to test or inspect the code on your own machine? Follow these steps:

1. Clone or download the repository:

```
https://github.com/krankur897/CHATLY-Ai-Memory-Valult.git
```

2. Open Chrome Extensions:

```
chrome://extensions/
```

3. Enable **Developer Mode**.

4. Click on **Load unpacked**.

5. Select the CHATLY project folder.

6. Pin the extension and start using CHATLY 🚀

---

## 💡 Final Thoughts

Building CHATLY taught me real-world DOM manipulation, asynchronous extension lifecycles, and how to build tools that solve genuine everyday developer friction.

If this project saved you even a minute of annoying copy-pasting, drop a ⭐ star on the repo! It motivates me to build and open-source more cool tools. 🚀
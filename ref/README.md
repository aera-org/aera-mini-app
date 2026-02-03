# My App: BubbleJump

**Version:** 0.1.0

Bubble Jump is a modern web application game that leverages Telegram Web App integration for secure user authentication. Built with React and TypeScript, the project uses centralized HTTP request management via axios and offers a dynamic, real-time gaming experience.

---

## Project Overview

This project implements an engaging game with performance, scalability, and security as its core principles. Instead of integrating with crypto wallets, the app uses Telegram’s `initData` to authenticate users. Once authenticated, players can dive into a real-time interactive game environment.

---

---

## Technology Stack

- **React & TypeScript:** Core framework and language.
- **Axios:** For centralized HTTP requests.
- **Canvas/WebGL:** For game rendering.
- **WebSocket Client:** For real-time game state communication.
- **@twa-dev/sdk:** For Telegram Web App integration.
- **i18next & react-i18next:** For internationalization.
- **React Router:** For client-side routing.

### Databases

- **Redis:** For temporary session storage and real-time data.
- **MongoDB:** For persistent user and game data storage.

### Development Environment

- **Docker:** For containerizing databases and other services.
- **Storybook:** For developing and testing UI components.

---

## User Flow

1. **Welcome Screen:**

   - Displays the game title, description, and a prominent "Play" button.
   - Automatically detects if the app is launched within Telegram.

2. **Telegram Authentication:**

   - When launched via Telegram, the app extracts initialization data (`initData`) from `window.Telegram.WebApp`.
   - The extracted data is sent to the backend for validation.

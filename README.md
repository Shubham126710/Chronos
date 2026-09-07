<div align="center">
  <img src="app/icon.svg" alt="Chronos Logo" width="128" />
  <h1 align="center">Chronos</h1>
  <p align="center">
    <strong>A premium, high-performance productivity operating system designed for deep work.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/Gemini_AI-1E88E5?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#experience">The Experience</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 📖 Overview

**Chronos** is a state-of-the-art productivity operating system designed for high performers. It provides a sleek, high-performance, and deeply immersive interface for managing tasks, tracking habits, scheduling deep work, and aligning daily actions with long-term goals.

Built with aesthetic excellence at its core, Chronos leverages a premium monochromatic design language with subtle dark mode accents and fluid micro-animations to create a distraction-free, luxurious user experience. The platform redefines personal productivity with advanced authentication, a highly customizable dashboard, an AI-powered command palette, and real-time database persistence.

## ✨ Features

### 1. **Premium Monochromatic UI/UX**
Chronos utilizes a dark-mode-first, highly polished interface featuring precise typography, dynamic spacing, and smooth Framer Motion micro-animations designed to awe users while maintaining a distraction-free environment.

### 2. **Dynamic Personalized Dashboard**
A deeply interactive user hub where you control the layout. The Dashboard Canvas features an array of modular widgets, including:
- **Productivity Score:** Real-time analytics on your weekly efficiency.
- **Tasks & Habits:** Quick toggles for daily actions.
- **Focus Timer:** Built-in Pomodoro capabilities for deep work.
- **Quick Capture:** A CLI-style interface for instantly logging notes and ideas.
- **Goals & Projects:** High-level tracking of your ultimate objectives.

### 3. **AI-Powered Command Palette & Executive Assistant**
Chronos features a powerful AI layer driven by Google Gemini. Accessible via the Command Palette (`⌘K`) or the Dashboard AI widget, it can understand your productivity system and take useful actions:
- Ask "When should I study today?" to find your optimal cognitive peak window based on calendar data.
- "Move low priority tasks to next week" to instantly de-clutter your schedule.
- The AI Executive automatically protects your focus blocks and re-balances schedules when tasks are missed.

### 4. **Intelligent Time Blocking & Calendar**
A dynamic time-blocking system that automatically schedules tasks around meetings and cognitive energy peaks with built-in buffer protection. Seamlessly transition between day views and manage your focus hours with unprecedented clarity.

### 5. **Secure Next-Gen Authentication**
Robust login systems built on top-tier authentication providers, ensuring your data is securely locked down while maintaining a frictionless onboarding experience.

### 6. **Frictionless Onboarding Flow**
A short, premium, interactive walkthrough designed to introduce new users to the Chronos philosophy. It establishes their first goal, task, and focus session, persisting the state securely through Prisma.

## 📸 Functionality & Usage

### Landing Page & Hero Section

![Hero Section](public/screenshots/1.%20hero.png)
<p align="center"><em>A sleek landing interface introducing the Chronos productivity suite.</em></p>

### Authentication

![Login](public/screenshots/2.%20login.png)
<p align="center"><em>A minimalist login screen designed with security and clean typography in mind.</em></p>

### Command Center & Dashboard

![Dashboard](public/screenshots/3.%20hero.png)
<p align="center"><em>The primary workspace with live metrics, quick capture, and customizable widgets.</em></p>

### Task Management

![Tasks](public/screenshots/4.%20tasks.png)
<p align="center"><em>Streamlined view to organize, prioritize, and process daily to-dos and project goals.</em></p>

### Intelligent Calendar

![Calendar](public/screenshots/5.%20calender.png)
<p align="center"><em>Interactive calendar supporting time blocking and optimal cognitive peak schedule management.</em></p>

### Habit Tracking

![Habits](public/screenshots/6.%20habits.png)
<p align="center"><em>Track recurring habits and maintain consistent daily productivity streaks.</em></p>

### Notes & Quick Capture

![Notes](public/screenshots/7.%20notes.png)
<p align="center"><em>Organized workspace for notes, quick captures, and knowledge management.</em></p>

### Performance & Analytics

![Analytics](public/screenshots/8.%20analytics.png)
<p align="center"><em>In-depth productivity metrics, focus scores, and progress analytics over time.</em></p>

### Integrations

![Integrations](public/screenshots/9.%20integrations.png)
<p align="center"><em>Connect your favorite tools and external calendar providers seamlessly.</em></p>

### System Settings

![Settings](public/screenshots/10.%20settings.png)
<p align="center"><em>Manage your profile preferences, theme parameters, and account controls.</em></p>

### Modular Architecture

![Modules](public/screenshots/11.%20modules.png)
<p align="center"><em>Configure system modules and extend dashboard capabilities.</em></p>

## 🛠 Tech Stack

This project is built using modern, enterprise-ready web technologies tailored for speed and reliability.

- **Framework**: [Next.js 15 (Turbopack)](https://nextjs.org/)
- **Frontend**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom premium monochromatic token system.
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/) (Configurable to PostgreSQL)
- **AI Integration**: [Google Gemini](https://deepmind.google/technologies/gemini/)

### Project Structure

```bash
├── prisma/             # Database schema & migrations
├── public/             # Static assets, logos, and screenshots
├── app/                # Next.js App Router (Pages, API Routes, Layouts)
├── components/         # Reusable React UI Components (Command Palette, Sidebar, etc.)
├── features/           # Domain-specific modules (Dashboard, Calendar, AI, Tasks)
├── lib/                # Utilities and Prisma Client
└── README.md           # You are here
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shubham126710/Chronos.git
   cd Chronos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your_google_gemini_api_key"
   ```

4. **Initialize Database**
   Run Prisma migrations to build your schema and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to launch Chronos.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <sub>Built with ❤️ by Shubham Upadhyay</sub>
</div>

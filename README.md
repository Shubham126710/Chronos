<div align="center">
  <img src="app/icon.svg" alt="Chronos Logo" width="150" />
  <p align="center">
    <br/>
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

## 🧠 The Experience

Chronos is not just a to-do list; it is a holistic productivity OS. 
- **The Dashboard** serves as your command center. You can customize the widget layout, placing the most critical metrics (like your overarching goals or daily habit streaks) front and center.
- **The Workflow** encourages capturing ideas instantly via the Quick Capture widget, processing them later in the Notes or Tasks views, and executing them during scheduled Focus Blocks on the Calendar.
- **The AI Assistant** acts as your personal Chief of Staff. Instead of generic advice, it performs real mutations on your database—rescheduling tasks, analyzing your focus score, and generating study plans—always asking for your confirmation before executing destructive actions.

## 📸 Gallery

<details>
<summary><b>Click to view UI Screenshots</b></summary>
<br/>

![1. Onboarding](public/Screenshots/1.%20onboarding.png)
*1. A premium, interactive onboarding walkthrough for first-time users.*

![2. Dashboard Canvas](public/Screenshots/2.%20dashboard.png)
*2. The customizable central command center featuring dynamic widgets.*

![3. Command Palette](public/Screenshots/3.%20command-palette.png)
*3. The AI-powered Command Palette for instant task execution and semantic queries.*

![4. Tasks & Projects](public/Screenshots/4.%20tasks.png)
*4. Streamlined task and project management interface.*

![5. Calendar & Time Blocking](public/Screenshots/5.%20calendar.png)
*5. Dynamic schedule view highlighting focus blocks and cognitive peaks.*

</details>

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

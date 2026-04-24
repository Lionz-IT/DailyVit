<h1 align="center">
  <br>
  DailyVit 🍏
  <br>
</h1>

<h4 align="center">A comprehensive web application to track daily health metrics and smartwatch synchronization.</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#development">Development</a>
</p>

---

## ✨ Features

- **Smartwatch Synchronization:** Connect and sync data seamlessly with supported smartwatches (e.g., Huawei Health Kit integration).
- **Health Metrics Dashboard:** Visualize daily steps, calories burned, heart rate, and sleep quality using interactive charts.
- **Scheduled Sync:** Automated background data synchronization using Cron jobs.
- **Modern UI/UX:** Responsive and clean interface built with React and Tailwind CSS.

## 🛠 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts:** [Chart.js](https://www.chartjs.org/) & react-chartjs-2
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** React Router v7

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **Task Scheduler:** `node-cron`
- **HTTP Client:** `axios`

## 🏗 Project Architecture

DailyVit is structured as a **Monorepo** to separate concerns while maintaining development convenience.

```text
dailyvit/
├── frontend/           # React SPA (User Interface)
│   ├── src/            # Components, hooks, API services
│   └── public/         # Static assets
├── backend/            # Node.js API server
│   ├── src/
│   │   ├── config/     # Database and environment configurations
│   │   ├── services/   # Business logic (e.g., Huawei API integration)
│   │   ├── scheduler/  # Background cron jobs
│   │   └── app.js      # Express application entry point
│   └── .env            # Backend environment variables
├── data/               # SQLite database storage (Ignored in Git)
│   ├── dailyvit.db     # Main database file
│   └── ...
├── package.json        # Root workspace configuration (concurrently)
└── README.md
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18 or higher recommended)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Lionz-IT/dailyvit.git
cd dailyvit
```

### 2. Install Dependencies

We use a root `package.json` to manage the monorepo. You can install all dependencies for both frontend and backend with a single command:

```bash
# Installs root dependencies (concurrently)
npm install 

# Installs dependencies for both /frontend and /backend
npm run install:all
```

### 3. Environment Variables

Create a `.env` file in the `backend/` directory. Use the provided `.env.example` (if available) as a template.

```bash
cd backend
touch .env
```
*Example `.env` content:*
```env
PORT=3000
HUAWEI_CLIENT_ID=your_client_id
HUAWEI_CLIENT_SECRET=your_client_secret
```

## 💻 Development

You can run both the frontend and backend servers simultaneously using the root package commands.

```bash
# Make sure you are in the root directory (/dailyvit)
npm run dev
```

This command uses `concurrently` to execute:
1. `npm run dev` in the `/backend` directory (Starts Express server on `http://localhost:3000` with watch mode).
2. `npm run dev` in the `/frontend` directory (Starts Vite dev server on `http://localhost:5173`).

### Important Notes for Developers

- **Database Security:** The `data/` directory contains the SQLite `.db` files. These files are strictly ignored in `.gitignore` to prevent leaking sensitive data or bloating the repository. **Do not force commit them.**
- **Huawei Health Integration Testing:** If you are testing webhooks or callbacks locally, you will need to expose your local backend to the internet. We recommend using [Ngrok](https://ngrok.com/).
  ```bash
  ngrok http 3000
  ```
  *Use the generated `https` URL for your Huawei Developer Callback URL.*

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
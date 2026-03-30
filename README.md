# Orquestra Frontend

Orquestra is a web application for shift planning and fair workload distribution.

This repository contains the frontend of the system, built as a Single Page Application (SPA) that communicates with a FastAPI backend.

---

## 🚀 Tech Stack

* Vue 3
* TypeScript
* Vite
* Vue Router
* Pinia
* Tailwind CSS
* Axios
* Day.js
* FullCalendar
* Chart.js

---

## 📦 Project Setup

### 1. Install dependencies

```bash
npm install
```

---

## 🧪 Run the project

```bash
npm run dev
```

The application will be available at:

* http://localhost:5173

---

## 🔗 Backend connection

The frontend communicates with the backend API.

By default, the backend is expected to run at:

```
http://localhost:8000
```

You can configure this using environment variables.

---

## ⚙️ Environment variables

Create a `.env` file in the root of the project:

```
VITE_API_BASE_URL=http://localhost:8000
```

Example file:

```
.env.example
```

---

## 🧱 Project structure

```
src/
  api/            # API communication (Axios)
  components/     # Reusable UI components
  composables/    # Reusable logic (hooks)
  router/         # Application routing
  stores/         # Global state (Pinia)
  utils/          # Helpers and utilities
  views/          # Pages (routes)
  types/          # TypeScript types
```

---

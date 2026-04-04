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

## 🔐 Authentication flow

The application uses JWT-based authentication and supports a **first-login password change flow**.

### Login

* Endpoint: `POST /auth/login`
* The backend returns:
  * `access_token`
  * `must_change_password`

### Frontend behavior

* The token is stored in local storage  
* If `must_change_password = true`:
  * the user is redirected to `/change-password`
  * access to the rest of the application is blocked  
* If `false`:
  * the user is redirected to the dashboard  

### Change password (first login)

* Endpoint: `POST /auth/change-password`  
* Requires authentication (Bearer token)  
* After success:
  * `must_change_password` is set to false  
  * the user is redirected to the dashboard  

---

## 👥 Employee onboarding (admin)

Employee creation is handled through a **single onboarding operation**.

### Endpoint

`POST /employees/onboarding`

### Behavior

* Creates both:
  * user account  
  * employee profile  
* Links both entities internally  
* The created user has:
  * `must_change_password = true`  

### Frontend behavior

* Admin fills a single form  
* Only one request is sent to the backend  
* No separate user creation is exposed in the UI  

---

## 📅 Schedule management

The application allows administrators to manage schedules and generate planning automatically.

### Features

* View list of schedules
* Create schedules with date range and status
* View schedule details
* Delete schedules

### Schedule detail view

* Displays all shifts associated with the schedule
* Shows assignments grouped by date
* Provides a weekly overview of planning

---

## ⚙️ Planning generation

The system supports automatic planning generation based on backend logic.

### Endpoint

```
POST /planning/generate/{schedule_id}
```

### Behavior

* Generates assignments for the selected schedule
* Uses backend rules (availability, workload, constraints)
* Updates shifts and assignments automatically

### Frontend behavior

* User triggers generation from schedule detail view
* The UI refreshes to display updated planning
* Feedback is provided through loading states and error handling

---

## 🧠 Application behavior

The frontend enforces business rules defined by the backend:

* Protected routes require authentication  
* Users with `must_change_password = true`:
  * cannot access the application  
  * are forced to complete the password change  
* Authentication state is persisted using local storage  
* Backend validation errors are displayed directly in the UI  

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

## 📌 Notes

* The frontend is designed around **employee management**, not separate user management  
* Account creation is performed through employee onboarding  
* The UI prioritizes clarity and stability for desktop usage  
* Layout decisions (fixed widths, table stability) were made to improve usability and visual consistency  
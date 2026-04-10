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
* The role is stored in local storage  
* The UI adapts based on the user role:
  * Sidebar navigation is filtered  
  * Routes are protected  
  * Admin-only actions are hidden for employees  

### Change password (first login)

* Endpoint: `POST /auth/change-password`  
* Requires authentication (Bearer token)  
* After success:
  * `must_change_password` is set to false  
  * the user is redirected to the dashboard  

---

## 👁️ Visibility rules

The frontend enforces role-based visibility:

### Admin

* Full navigation:
  * Dashboard
  * Employees
  * Shifts
  * Schedules
  * Equity analysis

### Employee

* Limited navigation:
  * Dashboard
  * Shifts (only assigned)
  * Schedules (only relevant ones)

---

### UI restrictions

* Admin-only actions are hidden:
  * create/edit/delete entities  
  * planning generation  
  * employee management  

* Employees can only view their own planning context  

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

## ⏱️ Shift management

The application includes a module for managing shifts associated with schedules.

### Features

* View list of shifts  
* Create new shifts  
* Edit existing shifts  
* Delete shifts  

---

### Shift list

* Displays all shifts in a table format  
* Columns include:
  * date  
  * start time  
  * end time  
  * schedule ID  
  * creation type  
  * status  
* Provides actions:
  * edit shift  
  * delete shift  

---

### Create and edit shifts

* Unified form for both creation and edition  
* Fields:
  * date  
  * start time  
  * end time  
  * schedule  
  * creation type (`manual` / `automatic`)  
  * status (`planned`, `assigned`, `pending`)  

### Validation

* Ensures that:
  * end time is strictly greater than start time  
* Prevents submission of invalid time ranges  
* Displays validation errors directly in the UI  

---

### Frontend behavior

* Data is retrieved and managed through API calls:
  * `GET /shifts/`
  * `GET /shifts/{id}`
  * `POST /shifts/`
  * `PUT /shifts/{id}`
  * `DELETE /shifts/{id}`
* Loading states are handled for list and form views  
* Errors are captured and displayed using centralized error handling utilities  
* After create/update/delete actions, the UI is updated accordingly  

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

### Access control

* **Admin**
  * Can access any schedule  
* **Employee**
  * Can only access schedules where they have assigned shifts  
  * Otherwise receives a `403 Forbidden`  

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

## 📊 Equity analysis (metrics)

The application includes a dedicated module for analyzing workload distribution and fairness.

### Structure

The module is organized into two tabs:

* **Fairness by schedule**
* **Workload by date range**

---

### Fairness by schedule

Analyzes how workload is distributed within a specific schedule.

#### Features

* Select schedule from dropdown  
* Default selection: **latest created schedule**  
* Automatic loading of fairness data  
* Summary metrics:
  * total assigned hours  
  * max assigned hours  
  * min assigned hours  
  * hours gap  

#### Visualization

* Horizontal bars per employee  
* Relative workload distribution  
* Percentage and assigned hours  

#### Insights

* Detects whether planning is balanced  
* Highlights:
  * highest workload employee  
  * lowest workload employee  

---

### Workload by date range

Analyzes workload across a custom time period.

#### Features

* Select:
  * start date  
  * end date  
* Default range: **current week (Monday to Sunday)**  
* Manual trigger via “Load workload” button  

#### Visualization

* Summary:
  * start date  
  * end date  
  * total assigned hours  
* Per employee:
  * assigned hours  
  * workload percentage  
  * horizontal distribution bars  

---

### Frontend behavior

* Metrics are loaded via API calls:
  * `GET /metrics/fairness/{schedule_id}`
  * `GET /metrics/workload`
* Errors are handled and displayed in the UI  
* Loading states are managed for each dataset  
* Tabs isolate contexts to improve usability  

---

## 🧠 Application behavior

The frontend enforces business rules defined by the backend:

* Protected routes require authentication  
* Users with `must_change_password = true`:
  * cannot access the application  
  * are forced to complete the password change  
* Authentication state is persisted using local storage  
* Backend validation errors are displayed directly in the UI  
* Role-based access is enforced in the frontend

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
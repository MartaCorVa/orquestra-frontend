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
* FullCalendar (used for schedule visualization)
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

Employee creation is handled through a **single onboarding operation**, including contract creation.

### Endpoint

`POST /employees/onboarding`

### Behavior

* Creates:
  * user account  
  * employee profile  
  * **initial contract**
* Links all entities internally  
* The created user has:
  * `must_change_password = true`  

---

### Contract model

During onboarding, a contract must be defined with:

* weekly_hours  
* daily_hours  
* min_days_off_per_week  
* working days (Monday → Sunday)  
* has_fixed_schedule  
* preferred_start_time / preferred_end_time (required if fixed schedule is enabled)  
* start_date / end_date  
* active status  

---

### Frontend behavior

* Admin fills a **single form including contract data**  
* Contract validation is enforced on the frontend:
  * required fields  
  * working days consistency  
  * fixed schedule validation  
* Only one request is sent to the backend  
* No separate user or contract creation is exposed in the UI  

---

## 📄 Contract management

Contracts define employee availability and workload constraints.

### Behavior

* Each employee has a **contract history**
* Only one contract can be active at a time  
* When a new contract is created:
  * the previous active contract is automatically set to inactive  
* Contracts are never overwritten → historical data is preserved  

---

### Frontend behavior

* The active contract is loaded when editing an employee  
* Editing contract data does not update the existing contract  
* If any contract field is modified:
  * a **new contract is created**
  * the previous one becomes inactive automatically  
* If no changes are made:
  * no contract request is sent  

---

### Purpose

This design allows:

* accurate historical tracking  
* reliable metrics calculation  
* auditability of workload evolution  

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

The application supports both **single shift creation** and **recurrent shift creation**.

#### Single shift

* Create or edit an individual shift
* Fields:
  * start date & time
  * end date & time
  * schedule
  * employee (optional)
  * creation type (`manual` / `automatic`)
  * status (`planned`, `assigned`)

---

#### Recurrent shift creation

Allows bulk creation of shifts across a date range.

* Define:
  * start date
  * end date
  * start time
  * end time
  * selected weekdays (e.g., Monday–Friday)
* Optionally assign an employee

##### Behavior

* For each valid day:
  * If no shift exists → a new shift is created
  * If a shift already exists:
    * no duplicate is created
    * the employee is assigned to the existing shift (if provided)

* Duplicate assignments are prevented automatically

---

### Validation

Validation is handled at **two levels**:

#### Frontend validation

* Required fields must be filled before submission
* Validation errors are shown only when the user submits the form
* Errors are displayed clearly in the UI (red feedback messages)

#### Rules enforced

* End datetime must be later than start datetime
* Start date cannot be later than end date
* At least one weekday must be selected (recurrent shifts)

---

#### Backend validation (also enforced)

* Shift must belong to the selected schedule
* No overlapping shifts for the same employee
* Minimum rest period between shifts
* Contract constraints:
  * allowed working days
  * daily and weekly hours
  * minimum days off
  * fixed schedule constraints

If any rule is violated, errors are returned and displayed in the UI.

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

The application allows administrators to manage schedules and visualize them through both **table and calendar views**.

### Features

* View schedules in:
  * **Table view**
  * **Calendar view (month, week, day)**
* Create schedules with date range and status
* View schedule details
* Generate planning for a schedule

---

### Table view

* Displays schedules in a tabular format  
* Columns include:
  * start date  
  * end date  
  * status  
  * creation date  

#### Filters

Schedules can be filtered using a shared filter panel:

* **Start date**
* **End date**
* **Status**

Filtering uses an **overlap-based approach**:

* A schedule is included if it intersects with the selected date range  

#### UX behavior

* Filters apply instantly to the table  
* A **"Clear filters"** action resets all filters  
* Date inputs prevent invalid ranges using `min` and `max` constraints  

---

### Calendar view

* Displays schedules using a FullCalendar-based interface  
* Supports:
  * month view  
  * week view  
  * day view  

#### Behavior

* Each schedule is rendered as an event spanning its date range  
* Events are color-coded based on status  
* Clicking an event navigates to the schedule detail view  

#### Filters

* The same filters used in the table view are applied to the calendar  
* Both views always display the same filtered dataset  

---

### Schedule detail view

* Displays shifts associated with the selected schedule  
* Provides a calendar-based visualization of planning  
* Shows assignments and schedule distribution  

---

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

### Result visualization

After generating planning for a schedule, the frontend displays a detailed summary of the result directly in the schedules table.

#### Behavior

* Each schedule with generated planning can display its **latest planning result**
* Results are shown in an expandable panel per schedule
* The panel includes:
  * generation message from backend
  * number of assignments created
  * number of unfilled shifts
  * employees below contract target
  * total missing contract hours

#### Employee insights

If there are employees below their contract target:

* A detailed list is displayed
* Each entry shows:
  * employee name
  * assigned hours vs contract hours
  * missing hours

#### State management

* Planning results are stored in a **Pinia store (`planningResults`)**
* Data is kept **in-memory per session**
* Results persist while navigating the application
* Results are cleared on page refresh

This avoids unnecessary re-fetching and allows users to inspect results without regenerating planning.

---

## 📊 Equity analysis (metrics)

The application includes a dedicated module for analyzing contract-based workload distribution and fairness.

### Structure

The module is organized into two tabs:

* **Fairness by schedule**
* **Workload by date range**

---

### Fairness by schedule

Analyzes how workload is distributed within a specific schedule based on employee contracts.

#### Features

* Select schedule from dropdown  
* Default selection: **latest created schedule**  
* Automatic loading of fairness data  
* Summary metrics:
  * total assigned hours  
  * max workload percentage
  * min workload percentage
  * workload percentage gap

#### Visualization

* Horizontal bars per employee  
* Contract-based workload distribution
* Percentage of workload relative to contract hours
* Assigned hours displayed alongside percentages

#### Insights

* Detects whether planning is balanced based on workload percentage
* Highlights:
  * employee with highest workload percentage
  * employee with lowest workload percentage
* Helps identify over- and under-utilization relative to contracts

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
  * contract weekly hours reference  
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

## 🧪 Testing & Code Quality

The frontend includes unit testing and code quality analysis.

### Testing

* Framework: **Vitest + Vue Test Utils**
* Coverage is generated using V8

Run tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### What is tested

* Forms validation (ShiftForm, EmployeeForm, etc.)
* View logic (ShiftCreateView, EquityAnalysisView)
API interactions and error handling

---

### Code quality (SonarQube / SonarCloud)

The project is prepared for static analysis using Sonar.

Metrics include:

* Code coverage
* Maintainability
* Reliability
* Security issues

---

## 🏗️ Frontend architecture

The application follows a modular and scalable structure:

* **Views** → page-level components (routing)
* **Components** → reusable UI elements
* **Stores (Pinia)** → global state management
* **API layer** → centralized communication with backend
* **Composables** → reusable logic

### Design principles

* Separation of concerns
* Single responsibility per component
* Clear API abstraction layer
* Reactive state management

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
* Schedule data can be explored through both table and calendar views, sharing the same filtering logic  
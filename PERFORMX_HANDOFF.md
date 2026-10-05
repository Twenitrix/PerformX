# PERFORMX — System Handoff & Operation Manual

**Application:** PERFORMX — Employee Performance Management System (EPMS)  
**Tagline:** *Manage work. Measure performance. Build better teams.*  
**Backend:** Spring Boot 3.3.4 (Java 21/24), Spring Data JPA, Spring Security 6, H2 Database  
**Frontend:** React 18, Vite, Tailwind CSS 3.4, Lucide Icons, Recharts  
**Design Standard:** Enterprise SaaS (`ui-ux-agent-standard-ver-2`) with Tier 1 cinematic transitions.

---

## 1. Quick Start (Running the Application)

Three convenient launch scripts have been created in `d:\IP`:

### Option A: 1-Click Launch (Recommended)
Double-click:
```bash
d:\IP\start-all.bat
```
This automatically starts:
1. Spring Boot backend on `http://localhost:8080` (with H2 database console at `/h2-console`).
2. React Vite dev server on `http://localhost:5173`.

### Option B: Separate Terminal Windows
- **Terminal 1 (Backend):**
  ```powershell
  d:\IP\run-backend.bat
  # Or: cd d:\IP\performx-backend && ..\.tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
  ```
- **Terminal 2 (Frontend):**
  ```powershell
  d:\IP\run-frontend.bat
  # Or: cd d:\IP\performx-frontend && npm run dev
  ```

Open your browser to: **`http://localhost:5173`**

---

## 2. Seeded Demonstration Accounts

The application automatically seeds **62 users** (2 Admins, 6 Supervisors, 54 Employees), ~300 realistic tasks, 4 quarters of performance evaluations, 30 days of login audit logs, and multi-turn chat threads.

| Role | Name | Email / ID | Password | Access Level |
|---|---|---|---|---|
| **ADMIN** | System Administrator | `admin@performx.com` / `ADM-1001` | `admin123` | Full system control, user provisioning, log & chat deletion, analytics |
| **SUPERVISOR** | Marcus Vance | `marcus.vance@performx.com` / `SUP-1003` | `supervisor123` | Engineering lead: manages team, assigns tasks, gives feedback & reviews, reads logs (no delete) |
| **SUPERVISOR** | Neel Patel | `neel.patel@performx.com` / `SUP-1004` | `supervisor123` | Engineering lead: alternate supervisor |
| **EMPLOYEE** | Aarav Sharma | `aarav.sharma@performx.com` / `EMP-1009` | `employee123` | Software Engineer reporting to Marcus: manages assigned tasks, updates progress, views score trend |

> **Pro Tip:** On the Login page and inside the top navigation bar, there is a **"Demo Persona"** dropdown button that lets you instantly switch between Admin, Supervisor, and Employee in 1 click without typing credentials.

---

## 3. Database Architecture (ER Diagram Compliance)

Every table and relationship matches Neeluddin's ER diagram with zero discrepancy:

| Table | Primary Key | Foreign Keys | Key Attributes & Description |
|---|---|---|---|
| `users` | `user_id` | — | `name`, `email`, `employee_code`, `password`, `role` (ADMIN, SUPERVISOR, EMPLOYEE), `department`, `phone`, `active`, `created_at` |
| `admins` | `admin_id` | `user_id` (1:1) | Administrative profile anchor |
| `supervisors` | `supervisor_id` | `user_id` (1:1) | Department management anchor |
| `employees` | `employee_id` | `user_id` (1:1), `supervisor_id` (N:1) | `joining_date`, `designation` |
| `tasks` | `task_id` | `supervisor_id` (FK), `employee_id` (FK) | `title`, `description`, `assigned_date`, `due_date`, `priority` (HIGH, MEDIUM, LOW), `status` (PENDING, IN_PROGRESS, COMPLETED, OVERDUE), `progress` (0-100), `expected_result`, `performance_weight`, `employee_update`, `supervisor_feedback`, `reviewed`, `completed_at` |
| `performance` | `performance_id` | `employee_id` (FK), `supervisor_id` (FK) | `review_period`, `productivity_score`, `quality_score`, `attendance_score`, `overall_score`, `comments`, `performance_area`, `rating` (1-5), `review_date` |
| `login_logs` | `log_id` | `user_id` (FK) | `login_time`, `logout_time`, `ip_address`, `device`, `status` (SUCCESSFUL, FAILED, ACTIVE). **Only Admin can delete.** |
| `chats` | `chat_id` | `sender_id` (FK), `receiver_id` (FK) | `created_at`, `deleted`. **Only Admin can delete.** |
| `messages` | `message_id` | `chat_id` (FK), `sender_id` (FK) | `message_text`, `sent_at`, `is_read`, `deleted` |

---

## 4. Complete Codebase Inventory

### Backend (`d:\IP\performx-backend`)
- `src/main/resources/application.properties` — H2 in-memory DB configuration, JWT secrets, and CORS origins.
- `src/main/java/com/performx/`
  - `PerformxApplication.java` — Spring Boot bootstrap entry point.
  - `model/` — `Entities.java`, `User.java`, `Admin.java`, `Supervisor.java`, `Employee.java`, `Task.java`, `Performance.java`, `LoginLog.java`, `Chat.java`, `Message.java`.
  - `repository/` — 9 JPA repositories (`UserRepository`, `AdminRepository`, `SupervisorRepository`, `EmployeeRepository`, `TaskRepository`, `PerformanceRepository`, `LoginLogRepository`, `ChatRepository`, `MessageRepository`).
  - `security/` — `JwtService.java`, `JwtAuthFilter.java`, `SecurityConfig.java`, `AuthUser.java`.
  - `common/` — `Api.java` (standard response envelopes and global REST exception handlers).
  - `dto/` — `Views.java` (safe JSON view mappers) and `Requests.java` (validated request records).
  - `service/` — `ScopeService.java` (strict role scoping and live formulaic score calculation), `AuthService.java`, `ChatService.java`, `AdminService.java`, `SupervisorService.java`, `EmployeeService.java`, `InsightService.java` (Smart AI performance assistant), `WorkspaceService.java` (role-scoped search and notifications).
  - `controller/` — `AuthController.java`, `AdminController.java`, `SupervisorController.java`, `EmployeeController.java`, `WorkspaceController.java`.
  - `config/DataSeeder.java` — Automatic startup seeder with realistic data.

### Frontend (`d:\IP\performx-frontend`)
- `src/index.css` & `tailwind.config.js` — Slate canvas, white cards, dark navy typography, indigo accents, semantic badges, and custom animation keyframes.
- `src/lib/api.js` — Axios client configured with JWT interceptors and endpoints.
- `src/lib/auth.jsx` — React AuthContext managing authentication state.
- `src/lib/utils.js` — Date formatters, duration formatters, initials generator, and CSV exporter.
- `src/components/ui.jsx` — Complete design system components (`PageHeader`, `Card`, `KpiCard`, `Table`, `StatusBadge`, `RoleBadge`, `PriorityBadge`, `PerformanceBadge`, `ProgressBar`, `UserAvatar`, `Modal`, `ConfirmationDialog`, `Tabs`, `SearchInput`, `Select`, `ToastProvider`, `Field`).
- `src/components/Layout.jsx` — Responsive sidebar (independent items for Admin, Supervisor, and Employee), top navbar with search, notifications, theme toggle, and 1-click demo switcher.
- `src/pages/`
  - `Login.jsx` — Split-screen login with branding illustration and 1-click demo shortcuts.
  - `CommonSettings.jsx` — Settings page for all three roles.
  - `admin/` — `AdminDashboard.jsx`, `AdminUsers.jsx`, `AdminAccessLogs.jsx`, `AdminChatMonitoring.jsx`, `AdminAnalytics.jsx`, `AdminRolesMatrix.jsx`, `AdminEmployees.jsx`, `AdminSupervisors.jsx`, `AdminActivity.jsx`, `AdminTaskAnalytics.jsx`.
  - `supervisor/` — `SupervisorDashboard.jsx`, `SupervisorTeam.jsx`, `SupervisorTasks.jsx`, `SupervisorReviews.jsx`, `SupervisorLoginLogs.jsx`, `SupervisorChats.jsx`.
  - `employee/` — `EmployeeDashboard.jsx`, `EmployeeTasks.jsx`, `EmployeePerformance.jsx`, `EmployeeFeedback.jsx`, `EmployeeChat.jsx`.
  - `App.jsx` & `main.jsx` — Route architecture with role-gated `ProtectedLayout`.

---

## 5. College / Client Demonstration Script

Follow this step-by-step sequence to showcase the entire product lifecycle:

### Step 1: Login & Role Redirection
1. Open `http://localhost:5173`.
2. Notice the modern SaaS login page with PERFORMX branding and the dashboard graphic.
3. Click the **"Supervisor"** demo button and click **Sign In**.
4. You are immediately directed to the Supervisor Dashboard (`/supervisor`).

### Step 2: Supervisor Assigns a Task
1. On the Supervisor Dashboard, review the **Team Performance Scorecard** (see Aarav Sharma at 89%–92%).
2. In the top right, click **Assign Task** (or navigate to **Work → Tasks → Assign Task**).
3. Fill in:
   - **Task Title:** `Build Q4 Analytics Export Engine`
   - **Employee:** Select `Aarav Sharma`
   - **Priority:** `High Priority`
   - **Deadline:** Choose a date 5 days from today
   - **Performance Weight:** `8`
   - **Expected Result:** `Full CSV & PDF export tested and reviewed.`
4. Click **Assign Task**. A green confirmation toast appears: *"Task successfully assigned."*

### Step 3: Employee Executes the Task
1. Use the top navigation bar's **Demo Persona** dropdown and switch to **Employee (Aarav)**.
2. In the Employee Dashboard (`/employee`), notice the new task appearing in **My Assigned Tasks**.
3. Go to **My Tasks** in the sidebar.
4. Click on `Build Q4 Analytics Export Engine` to open the task details modal.
5. Drag the **Update Progress** slider to `75%`, type *"Engine core written and unit tests passing"*, and click **Save Progress**.
6. Now click **Mark as Completed**. A confirmation dialog appears: *"Mark this task as completed?"*.
7. Click **Complete Task**. Notice the status badge immediately updates to **Completed** and delivery progress hits 100%.
8. Navigate to **My Performance** to see the updated score, completion rate, and timeline.

### Step 4: Supervisor Reviews & Submits Feedback
1. Switch demo persona back to **Supervisor (Marcus)**.
2. Go to **Work → Tasks**, find the completed task, and click **Details**.
3. View Aarav's update note, type feedback: *"Outstanding turnaround and comprehensive unit tests."*, and click **Save Feedback**.
4. Click **Mark as Reviewed**.
5. Navigate to **Performance → Performance Reviews** and click **Submit New Review**.
6. Select `Aarav Sharma`, click the **Smart AI Draft** button, and watch the AI engine synthesize his recent task completion rate and attendance into constructive quarterly review comments.
7. Click **Submit Review**.

### Step 5: Administrator Audits & Cleans System Records
1. Switch demo persona to **Admin**.
2. Notice the organization-wide KPIs and performance trend chart.
3. Navigate to **Monitoring → Access Logs**:
   - Filter by `Status: Failed` to inspect suspicious logins.
   - Select multiple log records using the checkboxes.
   - Click **Remove Selected Logs**. Confirm in the modal. Notice the logs are permanently deleted.
4. Navigate to **Monitoring → Chat Monitoring**:
   - Inspect the organizational chat between Marcus Vance and Aarav Sharma.
   - Click the trash icon to open the confirmation modal: *"Are you sure you want to remove this conversation?"*.
   - Click **Remove Chat**.
5. Navigate to **Administration → Roles & Permissions** to display the visual Permission Matrix comparing all three roles.

---

## 6. Security Guarantees
- **No button-only security:** Even if an employee attempts to hit `/api/v1/admin/logs` or `/api/v1/supervisor/tasks` via Postman, Spring Security returns `403 FORBIDDEN`.
- **Database isolation:** An employee cannot see another employee's performance or tasks even by guessing database IDs.
- **Log integrity:** Only users with `ROLE_ADMIN` can access the deletion endpoints.

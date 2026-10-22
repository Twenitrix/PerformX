# PERFORMX — Enterprise Employee Performance Management System (EPMS)
**IP Project**

PERFORMX is a modern, high-performance Employee Performance Management System engineered with a **Spring Boot 3.3.4 (Java 21/24)** backend and a **React 18 + Tailwind CSS 3.4** frontend.

Built strictly according to enterprise Role-Based Access Control (RBAC) and normalized relational database architecture (Neeluddin's ER diagram), PERFORMX provides an end-to-end operational pipeline across **Admin**, **Supervisor**, and **Employee** personas.

---

## 🌐 Live AWS Cloud Deployment

- **Live Web App (AWS CloudFront + S3 + EC2):** **[https://dyfjpjuaxaevz.cloudfront.net](https://dyfjpjuaxaevz.cloudfront.net)**
- **Live API Health Endpoint:** **[https://dyfjpjuaxaevz.cloudfront.net/api/v1/health](https://dyfjpjuaxaevz.cloudfront.net/api/v1/health)**
- **Deployment Architecture & Runbook:** See [`AWS_DEPLOYMENT_GUIDE.md`](./AWS_DEPLOYMENT_GUIDE.md)

---

## 🚀 Key Highlights & Architecture

### 1. Three Distinct Role Workflows
- **Admin**: System-wide analytics, user provisioning (activation/deactivation), batch access log deletion, organization-wide chat monitoring & message deletion.
- **Supervisor**: Team scorecard & velocity metrics, task delegation with weights and deadlines, task feedback submission, quarterly performance review submissions with **Smart AI feedback drafts**, read-only team audit logs.
- **Employee**: Personal KPI scorecard, task execution with an **interactive 0–100% progress slider**, task completion confirmations, 4-quarter performance trend line graphs (Recharts), supervisor feedback review, 1-on-1 supervisor chat.

### 2. Relational Database Compliance (Neeluddin's ER Diagram)
The system implements all 9 ER diagram entities:
- `USER` (Base credentials, role, status, contact details)
- `ADMIN` (1-to-1 extension with User)
- `SUPERVISOR` (Departmental manager entity)
- `EMPLOYEE` (Linked to supervisor, designation, joining date)
- `TASK` (Delegated work items with weights, progress, priority, and feedback)
- `PERFORMANCE` (Quarterly score breakdowns: productivity, quality, attendance, ratings)
- `LOGIN_LOG` (Security access audits with device, IP, and status)
- `CHAT` (Direct communication channels)
- `MESSAGE` (Audit-tracked conversational records)

---

## 🛠️ Technology Stack

- **Backend**:
  - Java 21 / 24
  - Spring Boot 3.3.4 (Web, Data JPA, Security 6, Validation)
  - JJWT (JSON Web Token 0.12.6)
  - H2 Database (In-Memory / Persistent File) & PostgreSQL (Amazon RDS ready)
- **Frontend**:
  - React 18 + Vite 5
  - Tailwind CSS 3.4 (Custom design tokens & responsive components)
  - Lucide React Icons
  - Recharts (Data visualizer & score progression charts)
  - Axios with JWT Interceptors
- **Cloud & DevOps (AWS)**:
  - **Amazon EC2** (Ubuntu 24.04 LTS, Java 21 `systemd` service)
  - **Amazon S3** (Private static frontend bucket with Origin Access Control)
  - **Amazon CloudFront** (Global HTTPS CDN + `/api/*` reverse proxy to EC2)
  - **GitHub Actions** (Automated CI build verification & artifact packaging)

---

## 🏁 Quick Start (Local Development)

### Prerequisites
- Java JDK 17+ (or 21/24)
- Node.js 18+ and npm
- Maven 3.9+ (or use the provided portable Maven launcher)

### 1-Click Startup (Windows)
Double-click `start-all.bat` or run:
```bat
start-all.bat
```

### Manual Startup

#### 1. Backend Server
```bash
cd performx-backend
mvn spring-boot:run
```
*API will run at `http://localhost:8080/api/v1`*
*H2 Console accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:performx`)*

#### 2. Frontend Development Server
```bash
cd performx-frontend
npm install
npm run dev
```
*Frontend will run at `http://localhost:5173/`*

---

## 🔑 Demo Personas

| Role | Identifier / Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@performx.com` | `admin123` |
| **Supervisor** | `marcus.vance@performx.com` | `supervisor123` |
| **Employee** | `aarav.sharma@performx.com` | `employee123` |

*Note: You can also click the quick-login persona buttons on the login screen.*

---

## 📄 License
This project is licensed under the MIT License.

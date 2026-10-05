import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth, ROLE_HOME } from './lib/auth'
import { ToastProvider, LoadingSkeleton } from './components/ui'
import { AppShell } from './components/Layout'

// Pages
import Login from './pages/Login'
import CommonSettings from './pages/CommonSettings'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminEmployees from './pages/admin/AdminEmployees'
import AdminSupervisors from './pages/admin/AdminSupervisors'
import AdminAccessLogs from './pages/admin/AdminAccessLogs'
import AdminChatMonitoring from './pages/admin/AdminChatMonitoring'
import AdminActivity from './pages/admin/AdminActivity'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminTaskAnalytics from './pages/admin/AdminTaskAnalytics'
import AdminRolesMatrix from './pages/admin/AdminRolesMatrix'

// Supervisor pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import SupervisorTeam from './pages/supervisor/SupervisorTeam'
import SupervisorTasks from './pages/supervisor/SupervisorTasks'
import SupervisorReviews from './pages/supervisor/SupervisorReviews'
import SupervisorLoginLogs from './pages/supervisor/SupervisorLoginLogs'
import SupervisorChats from './pages/supervisor/SupervisorChats'

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeTasks from './pages/employee/EmployeeTasks'
import EmployeePerformance from './pages/employee/EmployeePerformance'
import EmployeeFeedback from './pages/employee/EmployeeFeedback'
import EmployeeChat from './pages/employee/EmployeeChat'

function ProtectedLayout({ allowedRole }) {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSkeleton rows={4} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function RootRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedLayout allowedRole="ADMIN" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/supervisors" element={<AdminSupervisors />} />
          <Route path="/admin/logs" element={<AdminAccessLogs />} />
          <Route path="/admin/chats" element={<AdminChatMonitoring />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/task-analytics" element={<AdminTaskAnalytics />} />
          <Route path="/admin/roles" element={<AdminRolesMatrix />} />
          <Route path="/admin/settings" element={<CommonSettings />} />
        </Route>

        {/* SUPERVISOR ROUTES */}
        <Route element={<ProtectedLayout allowedRole="SUPERVISOR" />}>
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/team" element={<SupervisorTeam />} />
          <Route path="/supervisor/performance" element={<SupervisorTeam />} />
          <Route path="/supervisor/tasks" element={<SupervisorTasks />} />
          <Route path="/supervisor/reviews" element={<SupervisorReviews />} />
          <Route path="/supervisor/logs" element={<SupervisorLoginLogs />} />
          <Route path="/supervisor/chats" element={<SupervisorChats />} />
          <Route path="/supervisor/settings" element={<CommonSettings />} />
        </Route>

        {/* EMPLOYEE ROUTES */}
        <Route element={<ProtectedLayout allowedRole="EMPLOYEE" />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/tasks" element={<EmployeeTasks />} />
          <Route path="/employee/performance" element={<EmployeePerformance />} />
          <Route path="/employee/feedback" element={<EmployeeFeedback />} />
          <Route path="/employee/chat" element={<EmployeeChat />} />
          <Route path="/employee/settings" element={<CommonSettings />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </ToastProvider>
  )
}

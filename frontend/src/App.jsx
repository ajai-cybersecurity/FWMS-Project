import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import FarmerDashboard from './pages/FarmerDashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import TasksPage from './pages/TasksPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'
import DashboardLayout from './components/layout/DashboardLayout'
import NotFoundPage from './pages/NotFoundPage'

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

const RoleRouter = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const map = { ADMIN: '/admin', FARMER: '/farmer', WORKER: '/worker' }
  return <Navigate to={map[user.role] || '/login'} replace />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<RoleRouter />} />

    {/* Admin */}
    <Route path="/admin" element={
      <ProtectedRoute roles={['ADMIN']}>
        <DashboardLayout role="ADMIN" />
      </ProtectedRoute>
    }>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="tasks" element={<TasksPage role="ADMIN" />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    {/* Farmer */}
    <Route path="/farmer" element={
      <ProtectedRoute roles={['FARMER']}>
        <DashboardLayout role="FARMER" />
      </ProtectedRoute>
    }>
      <Route index element={<FarmerDashboard />} />
      <Route path="tasks" element={<TasksPage role="FARMER" />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    {/* Worker */}
    <Route path="/worker" element={
      <ProtectedRoute roles={['WORKER']}>
        <DashboardLayout role="WORKER" />
      </ProtectedRoute>
    }>
      <Route index element={<WorkerDashboard />} />
      <Route path="tasks" element={<TasksPage role="WORKER" />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

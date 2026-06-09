import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './utils/auth'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TrainingMaterial from './pages/TrainingMaterial'
import Simulatori from './pages/Simulatori'
import CrackSpreadLab from './pages/CrackSpreadLab'
import MarginCallSimulator from './pages/MarginCallSimulator'
import Team from './pages/Team'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/training" element={<TrainingMaterial />} />
              <Route path="/simulators" element={<Simulatori />} />
              <Route path="/simulators/crack-spread" element={<CrackSpreadLab />} />
              <Route path="/simulators/margin-call" element={<MarginCallSimulator />} />
              <Route path="/team" element={<Team />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

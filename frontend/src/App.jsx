import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import FindLawyers from './pages/FindLawyers';
import LawyerProfile from './pages/LawyerProfile';
import EmailSimulator from './pages/EmailSimulator';
import Marketplace from './pages/Marketplace';
import Workplace from './pages/Workplace';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AiChatWidget from './components/AiChatWidget';
import CommandPalette from './components/CommandPalette';
import ThemeCustomizer from './components/ThemeCustomizer';
import CursorGlow from './components/CursorGlow';

function LawyerRedirect() {
  const { lawyerId } = useParams();
  return <Navigate to={`/dashboard/lawyers/${lawyerId}`} replace />;
}

function App() {
  useEffect(() => {
    // Apply saved theme on mount
    const saved = localStorage.getItem('lexoraTheme') || 'light';
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <CursorGlow />
          <Routes>
            <Route path="/"                 element={<Home />} />
            <Route path="/login"            element={<Login />} />
            <Route path="/signin"           element={<Login />} />
            <Route path="/register"         element={<Register />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/email-templates"  element={<EmailSimulator />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
             <Route path="/marketplace"            element={<Marketplace />} />
            <Route path="/workplace"              element={<Workplace />} />
            <Route path="/find-lawyers"           element={<Navigate to="/dashboard/find-lawyers" replace />} />
            <Route path="/lawyers/:lawyerId"      element={<LawyerRedirect />} />
            <Route path="*"                       element={<Navigate to="/" replace />} />
          </Routes>

          {/* Floating AI Chatbot — inside Router so useNavigate works */}
          <AiChatWidget />

          {/* Global Search Palette */}
          <CommandPalette />

          {/* Design customizer dialog panel */}
          <ThemeCustomizer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

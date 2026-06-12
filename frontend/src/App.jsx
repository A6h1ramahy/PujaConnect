import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import PanditList    from './pages/PanditList';
import PanditProfile from './pages/PanditProfile';
import BookingPage   from './pages/BookingPage';
import Rituals       from './pages/Rituals';
import RitualDetail  from './pages/RitualDetail';
import PlaceholderPage from './pages/PlaceholderPage';
import UserDashboard   from './pages/dashboard/UserDashboard';
import PanditDashboard from './pages/dashboard/PanditDashboard';
import AdminDashboard  from './pages/dashboard/AdminDashboard';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: '',
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #1c1917)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pandits"    element={<Layout><PanditList /></Layout>} />
            <Route path="/pandits/:id" element={<Layout><PanditProfile /></Layout>} />
            <Route path="/rituals"    element={<Layout><Rituals /></Layout>} />
            <Route path="/rituals/:slug" element={<Layout><RitualDetail /></Layout>} />

            {/* Placeholder routes */}
            <Route path="/resources/puja-guide" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/resources/ritual-info" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/resources/faq" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/resources/support" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/trust/verified-pandits" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/trust/secure-booking" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/trust/guidelines" element={<Layout><PlaceholderPage /></Layout>} />
            <Route path="/trust/support" element={<Layout><PlaceholderPage /></Layout>} />

            {/* User-only routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="user">
                <Layout><UserDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/book/:panditId" element={
              <ProtectedRoute role="user">
                <Layout><BookingPage /></Layout>
              </ProtectedRoute>
            } />

            {/* Pandit-only routes */}
            <Route path="/pandit/dashboard" element={
              <ProtectedRoute role="pandit">
                <Layout><PanditDashboard /></Layout>
              </ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin">
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

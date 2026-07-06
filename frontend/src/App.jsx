import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AppointmentPage from './pages/AppointmentPage';

function StethoscopeLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="22" r="11" stroke="white" strokeWidth="4" />
      <path d="M32 33 Q32 48 42 48 Q52 48 52 38" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="52" cy="37" r="4" fill="white" />
      <rect x="29" y="16" width="6" height="12" rx="3" fill="white" />
      <rect x="26" y="19" width="12" height="6" rx="3" fill="white" />
    </svg>
  );
}

function Header() {
  const location = useLocation();
  const onAppointmentPage = location.pathname.startsWith('/appointment');

  return (
    <div className="app-header">
      <NavLink to="/" className="app-logo">
        <div className="logo-icon">
          <StethoscopeLogo />
        </div>
        <div>
          <p className="brand-name">MediBook</p>
          <p className="brand-sub">Healthcare appointment management</p>
        </div>
      </NavLink>

      <div className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link-item ${isActive && !onAppointmentPage ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/appointment"
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
        >
          New appointment
        </NavLink>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/appointment/:id" element={<AppointmentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

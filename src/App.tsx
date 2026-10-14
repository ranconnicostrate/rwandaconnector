import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext';
import { LocationProvider } from './contexts/LocationContext';
import { AppShell } from './components/layout/AppShell';
import { ROLE_HOME } from './components/layout/navigation';
import { Splash } from './components/layout/Splash';
import { Home } from './pages/Home';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { SavedJobs } from './pages/SavedJobs';
import { Applications } from './pages/Applications';
import { Network } from './pages/Network';
import { People } from './pages/People';
import { PersonProfile } from './pages/PersonProfile';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { LinkedInCallback } from './pages/LinkedInCallback';
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerJobs } from './pages/employer/EmployerJobs';
import { EmployerApplicants } from './pages/employer/EmployerApplicants';
import { EmployerCompany } from './pages/employer/EmployerCompany';
import { EmployerAnalytics } from './pages/employer/EmployerAnalytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCompanies } from './pages/admin/AdminCompanies';
import { AdminJobs } from './pages/admin/AdminJobs';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminPosts } from './pages/admin/AdminPosts';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAdvertisements } from './pages/admin/AdminAdvertisements';
import type { Role } from './types';

/**
 * Route-level authorisation. The data layer enforces the same rules again on
 * every mutation, so hiding a route is a convenience, not the security boundary.
 */
function RequireRole({ allow, children }: {allow: Role[];children: React.ReactNode;}) {
  const { role } = usePlatform();
  if (!allow.includes(role)) return <Navigate to={ROLE_HOME[role]} replace />;
  return <>{children}</>;
}

function AuthenticatedApp() {
  return (
    <PlatformProvider>
      <LocationProvider>
      <Routes>
        <Route path="/login" element={<RedirectHome />} />
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:jobId" element={<JobDetail />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/:companyId" element={<CompanyDetail />} />
          <Route path="people/:personId" element={<PersonProfile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />

          <Route
              path="network"
              element={
              <RequireRole allow={['JOB_SEEKER', 'EMPLOYER']}>
                <Network />
              </RequireRole>
              } />
            
          <Route
              path="people"
              element={
              <RequireRole allow={['JOB_SEEKER', 'EMPLOYER']}>
                <People />
              </RequireRole>
              } />
            
          <Route
              path="saved"
              element={
              <RequireRole allow={['JOB_SEEKER']}>
                <SavedJobs />
              </RequireRole>
              } />
            
          <Route
              path="applications"
              element={
              <RequireRole allow={['JOB_SEEKER']}>
                <Applications />
              </RequireRole>
              } />
            

          <Route
              path="employer"
              element={
              <RequireRole allow={['EMPLOYER']}>
                <EmployerDashboard />
              </RequireRole>
              } />
            
          <Route
              path="employer/jobs"
              element={
              <RequireRole allow={['EMPLOYER']}>
                <EmployerJobs />
              </RequireRole>
              } />
            
          <Route
              path="employer/applicants"
              element={
              <RequireRole allow={['EMPLOYER']}>
                <EmployerApplicants />
              </RequireRole>
              } />
            
          <Route
              path="employer/company"
              element={
              <RequireRole allow={['EMPLOYER']}>
                <EmployerCompany />
              </RequireRole>
              } />
            
          <Route
              path="employer/analytics"
              element={
              <RequireRole allow={['EMPLOYER']}>
                <EmployerAnalytics />
              </RequireRole>
              } />
            

          <Route
              path="admin"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminDashboard />
              </RequireRole>
              } />
            
          <Route
              path="admin/users"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminUsers />
              </RequireRole>
              } />
            
          <Route
              path="admin/companies"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminCompanies />
              </RequireRole>
              } />
            
          <Route
              path="admin/jobs"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminJobs />
              </RequireRole>
              } />
            
          <Route
              path="admin/applications"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminApplications />
              </RequireRole>
              } />
            
          <Route
              path="admin/posts"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminPosts />
              </RequireRole>
              } />
            
          <Route
              path="admin/reports"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminReports />
              </RequireRole>
              } />
            
          <Route
              path="admin/advertisements"
              element={
              <RequireRole allow={['ADMIN']}>
                <AdminAdvertisements />
              </RequireRole>
              } />
            

          <Route path="*" element={<RedirectHome />} />
        </Route>
      </Routes>
      </LocationProvider>
    </PlatformProvider>);

}

function RedirectHome() {
  const { role } = usePlatform();
  return <Navigate to={ROLE_HOME[role]} replace />;
}

function AnonymousApp() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
      <Route
        path="*"
        element={<Navigate to="/login" replace state={{ from: location.pathname }} />} />
      
    </Routes>);

}

function Gate() {
  const { status } = useAuth();
  if (status === 'loading') return <Splash />;
  return status === 'authenticated' ? <AuthenticatedApp /> : <AnonymousApp />;
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Gate />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>);

}
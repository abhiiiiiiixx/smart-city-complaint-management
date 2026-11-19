import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ToastNotification } from './components/common/ToastNotification';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ContactPage } from './pages/public/ContactPage';
import { PublicTrackerPage } from './pages/public/PublicTrackerPage';
import { CityMapPage } from './pages/public/CityMapPage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Citizen pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { SubmitComplaintPage } from './pages/citizen/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage';

// Officer pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { AssignedComplaintsPage } from './pages/officer/AssignedComplaintsPage';
import { OfficerPerformancePage } from './pages/officer/OfficerPerformancePage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { ManageDepartmentsPage } from './pages/admin/ManageDepartmentsPage';
import { ManageOfficersPage } from './pages/admin/ManageOfficersPage';
import { ManageCitizensPage } from './pages/admin/ManageCitizensPage';
import { ManageCategoriesPage } from './pages/admin/ManageCategoriesPage';
import { ReportsAnalyticsPage } from './pages/admin/ReportsAnalyticsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, role, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [trackSearchId, setTrackSearchId] = useState<string>('SC-2026-0001');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected tabs lists
  const citizenTabs = ['citizen-dashboard', 'submit-complaint', 'my-complaints'];
  const officerTabs = ['officer-dashboard', 'assigned-complaints', 'officer-performance'];
  const adminTabs = [
    'admin-dashboard',
    'all-complaints',
    'manage-departments',
    'manage-officers',
    'manage-citizens',
    'manage-categories',
    'analytics-reports',
  ];

  // Reset complaint selection on user change / logout to guarantee user isolation
  useEffect(() => {
    setSelectedComplaintId(null);
  }, [user?.id]);

  // Comprehensive Route Guard & Immediate Login Redirection
  useEffect(() => {
    const isProtected =
      citizenTabs.includes(currentTab) ||
      officerTabs.includes(currentTab) ||
      adminTabs.includes(currentTab);

    // 1. If guest tries to access protected tab, bounce to login
    if (isProtected && !isAuthenticated) {
      setCurrentTab('login');
      return;
    }

    // 2. If user is authenticated and on login or register page, AUTOMATICALLY redirect to their dashboard!
    if (isAuthenticated && (currentTab === 'login' || currentTab === 'register')) {
      if (role === 'admin') {
        setCurrentTab('admin-dashboard');
      } else if (role === 'officer') {
        setCurrentTab('officer-dashboard');
      } else {
        setCurrentTab('citizen-dashboard');
      }
      return;
    }

    // 3. Strict role-based protection for authenticated users
    if (isAuthenticated) {
      if (adminTabs.includes(currentTab) && role !== 'admin') {
        setCurrentTab(role === 'officer' ? 'officer-dashboard' : 'citizen-dashboard');
        return;
      }
      if (officerTabs.includes(currentTab) && role !== 'officer' && role !== 'admin') {
        setCurrentTab('citizen-dashboard');
        return;
      }
    }
  }, [currentTab, isAuthenticated, role]);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSearch = (complaintNumber: string) => {
    setTrackSearchId(complaintNumber);
    setCurrentTab('track');
  };

  const handleComplaintSelected = (id: string) => {
    setSelectedComplaintId(id);
  };

  const isWorkspaceTab =
    currentTab.includes('dashboard') ||
    citizenTabs.includes(currentTab) ||
    officerTabs.includes(currentTab) ||
    adminTabs.includes(currentTab);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onTrackSearch={handleTrackSearch}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex w-full">
        {/* Render Sidebar only when authenticated and inside workspace */}
        {isAuthenticated && isWorkspaceTab && (
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Routed Content Area */}
        <main className="flex-1 min-w-0">
          {/* Public Routes */}
          {currentTab === 'landing' && (
            <LandingPage
              onNavigate={handleNavigate}
              onTrackSearch={handleTrackSearch}
            />
          )}

          {currentTab === 'about' && <AboutPage />}
          {currentTab === 'how-it-works' && <HowItWorksPage />}
          {currentTab === 'contact' && <ContactPage />}
          {currentTab === 'city-map' && (
            <CityMapPage
              onNavigate={handleNavigate}
              onSelectComplaint={(c) => {
                setTrackSearchId(c.complaint_number);
                handleNavigate('track');
              }}
            />
          )}

          {currentTab === 'track' && (
            <PublicTrackerPage
              initialSearch={trackSearchId}
              onNavigate={handleNavigate}
            />
          )}

          {/* Auth Routes: Only shown if unauthenticated */}
          {!isAuthenticated && currentTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
          {!isAuthenticated && currentTab === 'register' && <RegisterPage onNavigate={handleNavigate} />}

          {/* Citizen Routes (Strictly for Citizen role) */}
          {isAuthenticated && role === 'citizen' && currentTab === 'citizen-dashboard' && (
            <CitizenDashboard
              onNavigate={handleNavigate}
              onSelectComplaint={handleComplaintSelected}
            />
          )}

          {isAuthenticated && role === 'citizen' && currentTab === 'submit-complaint' && (
            <SubmitComplaintPage
              onNavigate={handleNavigate}
              onComplaintSubmitted={(id) => {
                setSelectedComplaintId(id);
              }}
            />
          )}

          {isAuthenticated && role === 'citizen' && currentTab === 'my-complaints' && (
            <MyComplaintsPage
              onNavigate={handleNavigate}
              selectedComplaintId={selectedComplaintId}
            />
          )}

          {/* Officer Routes (Strictly for Officer role) */}
          {isAuthenticated && (role === 'officer' || role === 'admin') && currentTab === 'officer-dashboard' && (
            <OfficerDashboard onNavigate={handleNavigate} />
          )}

          {isAuthenticated && (role === 'officer' || role === 'admin') && currentTab === 'assigned-complaints' && (
            <AssignedComplaintsPage />
          )}

          {isAuthenticated && (role === 'officer' || role === 'admin') && currentTab === 'officer-performance' && (
            <OfficerPerformancePage />
          )}

          {/* Admin Routes (STRICTLY RESTRICTED TO ADMIN ROLE ONLY) */}
          {isAuthenticated && role === 'admin' && currentTab === 'admin-dashboard' && (
            <AdminDashboard onNavigate={handleNavigate} />
          )}

          {isAuthenticated && role === 'admin' && currentTab === 'all-complaints' && <AllComplaintsPage />}
          {isAuthenticated && role === 'admin' && currentTab === 'manage-departments' && <ManageDepartmentsPage />}
          {isAuthenticated && role === 'admin' && currentTab === 'manage-officers' && <ManageOfficersPage />}
          {isAuthenticated && role === 'admin' && currentTab === 'manage-citizens' && <ManageCitizensPage />}
          {isAuthenticated && role === 'admin' && currentTab === 'manage-categories' && <ManageCategoriesPage />}
          {isAuthenticated && role === 'admin' && currentTab === 'analytics-reports' && <ReportsAnalyticsPage />}
        </main>
      </div>

      {/* Live Toast Notifications */}
      <ToastNotification onTrackSearch={handleTrackSearch} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <AppContent />
      </ComplaintProvider>
    </AuthProvider>
  );
};

export default App;

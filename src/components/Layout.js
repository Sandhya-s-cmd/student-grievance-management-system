import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import InteractiveBackground from './InteractiveBackground';
import Dashboard from './Dashboard';
import StudentDashboard from './StudentDashboard';
import AuthorityDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';
import MediationManagement from './MediationManagement';
import ComplaintForm from './ComplaintForm';
import ComplaintList from './ComplaintList';
import ComplaintDetails from './ComplaintDetails';
import Login from './Login';
import Registration from './Registration';
import Chatbot from './Chatbot';
import AuthDebug from './AuthDebug';
import InteractiveDemo from './InteractiveDemo';
import UserSettings from './UserSettings';
import Help from './Help';
import StudentGuide from './StudentGuide';
import FAQDocument from './FAQDocument';
import VideoTutorials from './VideoTutorials';
import MediationScheduler from './MediationScheduler';

const Layout = () => {
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Check for existing user session on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  // Handle browser storage events for cross-tab synchronization
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing stored user from storage event:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <InteractiveBackground>
        {user && <Navbar user={user} setUser={setUser} setSidebarOpen={setSidebarOpen} />}
        <div className="flex">
          {user && <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
          <main className={`flex-1 ${user ? 'ml-64' : ''} transition-all duration-300`}>
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />
              <Route path="/register" element={user ? <Navigate to="/" replace /> : <Registration />} />
              <Route path="/auth-debug" element={<AuthDebug />} />
              <Route path="/demo" element={<InteractiveDemo />} />
              <Route path="/settings" element={user ? <UserSettings user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/help" element={user ? <Help /> : <Navigate to="/login" replace />} />
              <Route path="/student-guide" element={user ? <StudentGuide /> : <Navigate to="/login" replace />} />
              <Route path="/faq" element={user ? <FAQDocument /> : <Navigate to="/login" replace />} />
              <Route path="/tutorials" element={user ? <VideoTutorials /> : <Navigate to="/login" replace />} />
              <Route path="/complaints" element={user ? <ComplaintList user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/complaints/:id" element={user ? <ComplaintDetails user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/submit-complaint" element={user ? <ComplaintForm user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/schedule-mediation" element={user && user.role === 'admin' ? <MediationManagement user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/mediation-management" element={user && user.role === 'admin' ? <MediationManagement user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/" element={user ? (user.role === 'admin' ? <AdminDashboard user={user} /> : user.role === 'authority' ? <AuthorityDashboard user={user} /> : <StudentDashboard user={user} />) : <Login setUser={setUser} />} />
              <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" replace />} />
              <Route path="/faculty" element={user && user.role === 'authority' ? <AuthorityDashboard user={user} /> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
            </Routes>
          </main>
        </div>
        {user && <Chatbot />}
      </InteractiveBackground>
    </Router>
  );
};

export default Layout;

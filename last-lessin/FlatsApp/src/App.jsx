
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./Register.jsx";
import LoginForm from "./Login.jsx";
import HomePage from "./Homepage.jsx";
import FlatForm from "./AddFlats.jsx";
import AllUsers from "./AllUsers.jsx";
import ProfileUpdateForm from "./UpdateProfile.jsx";
import FlatEditor from "./EditFlats.jsx";
import FlatDetails from './FlatDetails.jsx';
import AdminRoute from './AdminRoute.jsx';
import AllFlats from "./AllFlats.jsx";
import Favourite from "./Favourite.jsx";
import FlatView from "./FlatView.jsx";
import UserProfile from './UserProfile.jsx';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Routes */}
        <Route path="/homepage" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/add-flats" element={<ProtectedRoute><FlatForm /></ProtectedRoute>} />
        <Route path="/update-profile/:userId" element={<ProtectedRoute><ProfileUpdateForm /></ProtectedRoute>} />
        <Route path="/edit-flat/:flatId" element={<ProtectedRoute><FlatEditor /></ProtectedRoute>} />
        <Route path="/flat-details/:flatId" element={<ProtectedRoute><FlatDetails /></ProtectedRoute>} />
        <Route path="/all-flats" element={<ProtectedRoute><AllFlats /></ProtectedRoute>} />
        <Route path="/favourite" element={<ProtectedRoute><Favourite /></ProtectedRoute>} />
        <Route path="/flat-view/:flatId" element={<ProtectedRoute><FlatView /></ProtectedRoute>} /> 
        <Route path="/user-profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* Admin-Only Route */}
        <Route element={<ProtectedRoute><AdminRoute /></ProtectedRoute>}>
          <Route path='/all-users' element={<AllUsers />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
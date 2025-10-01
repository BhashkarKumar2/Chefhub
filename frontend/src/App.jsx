import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/basic/Home';
import Login from './pages/auth/Login';
import MobileLogin from './pages/auth/MobileLogin';
import Signup from './pages/auth/SignupNew';
import Dashboard from './pages/user/Dashboard';
import ChefProfile from './pages/chef/ChefProfile';
import Chefs from './pages/chef/Chefs';
import BookChef from './pages/chef/BookChef';
import MainLayout from './layouts/MainLayout';
import ChefOnboarding from './pages/chef/ChefOnboarding';
import About from './pages/basic/About';
import Contact from './pages/basic/Contact';
import Services from './pages/basic/Services';
import Profile from './pages/user/Profile';
import Favorites from './pages/user/Favorites';
import EditProfile from './pages/user/EditProfile';
import ViewBookings from './pages/user/ViewBookings';
import Register from './pages/auth/SignupNew';
import AuthSuccess from './pages/auth/AuthSuccess';
import AuthDebug from './pages/auth/AuthDebug';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './components/RealTimeFeatures';
import AdvancedSearch from './components/AdvancedSearch';
import UnifiedAIFeatures from './components/UnifiedAIFeatures';
// import ThemeDebugger from './components/ThemeDebugger';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen overflow-x-hidden max-w-full no-overflow">
                {/* <ThemeDebugger /> */}
                <MainLayout>
                  <main className="flex-1">
                    <Routes>
                      {/* Public routes - accessible without authentication */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/mobile-login" element={<MobileLogin />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/search" element={<AdvancedSearch />} />
                      <Route path="/chefs" element={
                        <ProtectedRoute>
                          <Chefs />
                        </ProtectedRoute>
                      } />
                      {/* Protected routes - require authentication */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/chef/:id" element={
                        <ProtectedRoute>
                          <ChefProfile />
                        </ProtectedRoute>
                      } />
                      <Route path="/book/:id" element={
                        <ProtectedRoute>
                          <BookChef />
                        </ProtectedRoute>
                      } />
                      <Route path="/book-chef" element={
                        <ProtectedRoute>
                          <BookChef />
                        </ProtectedRoute>
                      } />
                      <Route path="/book-chef-ai" element={
                        <ProtectedRoute>
                          <UnifiedAIFeatures mode="booking" />
                        </ProtectedRoute>
                      } />
                      <Route path="/ai-features" element={
                        <ProtectedRoute>
                          <UnifiedAIFeatures mode="dashboard" />
                        </ProtectedRoute>
                      } />
                      <Route path="/chef-onboarding" element={
                        <ProtectedRoute>
                          <ChefOnboarding />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/favorites" element={
                        <ProtectedRoute>
                          <Favorites />
                        </ProtectedRoute>
                      } />
                      <Route path="/edit-profile" element={
                        <ProtectedRoute>
                          <EditProfile />
                        </ProtectedRoute>
                      } />
                      <Route path="/bookings" element={
                        <ProtectedRoute>
                          <ViewBookings />
                        </ProtectedRoute>
                      } />
                      {/* Auth-related routes */}
                      <Route path="/auth-success" element={<AuthSuccess />} />
                      <Route path="/auth-debug" element={<AuthDebug />} />
                    </Routes>
                  </main>
                </MainLayout>
              </div>
            </Router>
          </SocketProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

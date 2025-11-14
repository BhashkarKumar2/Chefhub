import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './components/RealTimeFeatures';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
      <p className="mt-4 text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

// Lazy load pages
// Public pages - smaller bundle, load immediately
import Home from './pages/basic/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/SignupNew';

// Heavy pages - lazy load to reduce initial bundle size
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const ChefProfile = lazy(() => import('./pages/chef/ChefProfile'));
const Chefs = lazy(() => import('./pages/chef/Chefs'));
const BookChef = lazy(() => import('./pages/chef/BookChef'));
const ChefOnboarding = lazy(() => import('./pages/chef/ChefOnboarding'));
const UnifiedAIFeatures = lazy(() => import('./components/UnifiedAIFeatures'));
const AdvancedSearch = lazy(() => import('./components/AdvancedSearch'));

// Smaller pages - lazy load but less critical
const About = lazy(() => import('./pages/basic/About'));
const Contact = lazy(() => import('./pages/basic/Contact'));
const Services = lazy(() => import('./pages/basic/Services'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Favorites = lazy(() => import('./pages/user/Favorites'));
const EditProfile = lazy(() => import('./pages/user/EditProfile'));
const SetPassword = lazy(() => import('./pages/user/SetPassword'));
const ViewBookings = lazy(() => import('./pages/user/ViewBookings'));
const MobileLogin = lazy(() => import('./pages/auth/MobileLogin'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AuthSuccess = lazy(() => import('./pages/auth/AuthSuccess'));
const AuthDebug = lazy(() => import('./pages/auth/AuthDebug'));

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen overflow-x-hidden max-w-full no-overflow">
                <MainLayout>
                  <main className="flex-1">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public routes - accessible without authentication */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/mobile-login" element={<MobileLogin />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/register" element={<Signup />} />
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
                      <Route path="/set-password" element={
                        <ProtectedRoute>
                          <SetPassword />
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
                    </Suspense>
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

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/public/Home'
import Login from '../pages/auth/Login'
import MobileLogin from '../pages/auth/MobileLogin'
import MobileLoginTest from '../pages/auth/MobileLoginTest'
import Register from '../pages/auth/SignupNew'
import AuthDebug from '../pages/auth/AuthDebug'
import AuthSuccess from '../pages/auth/AuthSuccess'
import Dashboard from '../pages/user/Dashboard'
import Profile from '../pages/user/Profile'
import About from '../pages/public/About'
import Services from '../pages/public/Services'
import Contact from '../pages/public/Contact'
import BookChef from '../pages/chef/BookChef'
import Favorites from '../pages/user/Favorites'
import ChefOnboarding from '../pages/chef/ChefOnboarding'
import ViewBookings from '../pages/user/ViewBookings'
import AdvancedSearch from '../components/AdvancedSearch'
import { UnifiedAIFeatures } from '../components/ai';

export default function Router() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mobile-login" element={<MobileLogin />} />
        <Route path="/mobile-login-test" element={<MobileLoginTest />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book-chef" element={<BookChef />} />
        <Route path="/book-chef-ai" element={<UnifiedAIFeatures mode="booking" />} />
        <Route path="/search" element={<AdvancedSearch />} />
        <Route path="/ai-features" element={<UnifiedAIFeatures mode="dashboard" />} />
        <Route path="/bookings" element={<ViewBookings />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/chef-onboarding" element={<ChefOnboarding />} />
        <Route path="/auth-debug" element={<AuthDebug />} />
        <Route path="/bookings" element={<ViewBookings />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
      </Routes>
  )
}

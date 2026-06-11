import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar              from './components/Navbar'
import Hero                from './components/Hero'
import Categories          from './components/Categories'
import UrgentRequests      from './components/UrgentRequests'
import FeaturedFoundations from './components/FeaturedFoundations'
import Stats               from './components/Stats'
import Footer              from './components/Footer'

import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import FundacionPanel from './pages/panel/FundacionPanel'
import MiImpacto      from './pages/donante/MiImpacto'
import AdminPanel     from './pages/admin/AdminPanel'

function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  return (
    <>
      <Hero />
      <Categories onCategoryChange={setActiveCategory} />
      <FeaturedFoundations activeCategory={activeCategory} />
      <UrgentRequests />
      <Stats />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rutas públicas sin navbar de home */}
            <Route path="/login"    element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar" element={<ForgotPassword />} />

            {/* Rutas protegidas — paneles */}
            <Route path="/panel" element={
              <ProtectedRoute requiredRole="fundacion">
                <Navbar />
                <FundacionPanel />
              </ProtectedRoute>
            } />
            <Route path="/mi-impacto" element={
              <ProtectedRoute requiredRole="donante">
                <Navbar />
                <MiImpacto />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Navbar />
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Home */}
            <Route path="*" element={
              <>
                <Navbar />
                <main><Home /></main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

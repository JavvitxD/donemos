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

import Login              from './pages/Login'
import Register           from './pages/Register'
import ForgotPassword     from './pages/ForgotPassword'
import FundacionPanel     from './pages/panel/FundacionPanel'
import MiImpacto          from './pages/donante/MiImpacto'
import AdminPanel         from './pages/admin/AdminPanel'

// Páginas públicas
import Donar              from './pages/Donar'
import Fundaciones        from './pages/Fundaciones'
import FundacionPerfil    from './pages/FundacionPerfil'
import ComoFunciona       from './pages/ComoFunciona'
import Buscar             from './pages/Buscar'
import Seguridad          from './pages/Seguridad'
import Contacto           from './pages/Contacto'
import PoliticaPrivacidad from './pages/PoliticaPrivacidad'
import TerminosDeUso      from './pages/TerminosDeUso'

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
            {/* Auth — sin Navbar propio */}
            <Route path="/login"     element={<Login />} />
            <Route path="/registro"  element={<Register />} />
            <Route path="/recuperar" element={<ForgotPassword />} />

            {/* Páginas públicas — cada una incluye su propio Navbar + Footer */}
            <Route path="/donar/:fundacionId"     element={<Donar />} />
            <Route path="/fundaciones"           element={<Fundaciones />} />
            <Route path="/fundacion/:id"         element={<FundacionPerfil />} />
            <Route path="/como-funciona"         element={<ComoFunciona />} />
            <Route path="/buscar"                element={<Buscar />} />
            <Route path="/seguridad"             element={<Seguridad />} />
            <Route path="/contacto"              element={<Contacto />} />
            <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/terminos-de-uso"       element={<TerminosDeUso />} />

            {/* Rutas protegidas */}
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

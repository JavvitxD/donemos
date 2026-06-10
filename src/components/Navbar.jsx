import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { session, usuario, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)
  const dropRef = useRef()

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setDropOpen(false)
    setMenuOpen(false)
  }

  const rol = usuario?.rol

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 21C12 21 4 13.5 4 8.5C4 5.46 6.46 3 9.5 3C11.04 3 12 4 12 4C12 4 12.96 3 14.5 3C17.54 3 20 5.46 20 8.5C20 13.5 12 21 12 21Z" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Done<span className="text-primary-500">mos</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/"   className="text-gray-600 hover:text-primary-500 font-medium transition-colors text-sm">Explorar</Link>
            <a    href="/#fundaciones" className="text-gray-600 hover:text-primary-500 font-medium transition-colors text-sm">Fundaciones</a>
            <a    href="/#como"        className="text-gray-600 hover:text-primary-500 font-medium transition-colors text-sm">Cómo funciona</a>
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                    {usuario?.fundaciones?.foto_url
                      ? <img src={usuario.fundaciones.foto_url} alt="" className="w-full h-full object-cover" />
                      : (usuario?.nombre?.[0] ?? '?').toUpperCase()
                    }
                  </div>
                  <span className="text-sm font-medium text-gray-800 max-w-32 truncate">
                    {usuario?.fundaciones?.nombre ?? usuario?.nombre ?? 'Mi cuenta'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-gray-100 shadow-lg py-1.5 z-50">
                    {/* Info del usuario */}
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {usuario?.fundaciones?.nombre ?? usuario?.nombre ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                      <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                        {rol ?? 'donante'}
                      </span>
                    </div>

                    {/* Panel Admin — solo admins */}
                    {rol === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                        <span>⚙️</span> Panel Admin
                      </Link>
                    )}

                    {/* Mi panel — fundaciones (y admin que también sea fundación) */}
                    {(rol === 'fundacion' || (rol === 'admin' && usuario?.fundacion_id)) && (
                      <Link to="/panel" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span>🏛️</span> Mi panel
                      </Link>
                    )}

                    {/* Mi impacto — donantes */}
                    {(rol === 'donante' || rol === 'admin') && (
                      <Link to="/mi-impacto" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span>❤️</span> Mi impacto
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <span>🚪</span> Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"   className="btn-outline text-sm py-2 px-4">Iniciar sesión</Link>
                <Link to="/registro" className="btn-primary text-sm py-2 px-4">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(o => !o)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          <Link to="/"   className="block text-gray-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Explorar</Link>
          <a href="/#fundaciones" className="block text-gray-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Fundaciones</a>
          <a href="/#como"        className="block text-gray-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Cómo funciona</a>

          {session ? (
            <>
              <div className="border-t border-gray-100 pt-3 pb-1">
                <p className="text-xs text-gray-400">{session.user.email}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {usuario?.fundaciones?.nombre ?? usuario?.nombre ?? 'Mi cuenta'}
                </p>
                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                  {rol ?? 'donante'}
                </span>
              </div>
              {rol === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 text-gray-900 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  <span>⚙️</span> Panel Admin
                </Link>
              )}
              {(rol === 'fundacion' || (rol === 'admin' && usuario?.fundacion_id)) && (
                <Link to="/panel" className="flex items-center gap-2 text-primary-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  <span>🏛️</span> Mi panel
                </Link>
              )}
              {(rol === 'donante' || rol === 'admin') && (
                <Link to="/mi-impacto" className="flex items-center gap-2 text-primary-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  <span>❤️</span> Mi impacto
                </Link>
              )}
              <button onClick={handleSignOut} className="flex items-center gap-2 text-red-600 font-medium py-2 text-left w-full">
                <span>🚪</span> Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login"    className="btn-outline text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
              <Link to="/registro" className="btn-primary text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>Registrarse</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

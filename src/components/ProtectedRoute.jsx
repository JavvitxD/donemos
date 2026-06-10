import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { session, usuario, loading } = useAuth()
  const location = useLocation()

  // Espera tanto la sesión como el perfil del usuario
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Verificando acceso…</p>
        </div>
      </div>
    )
  }

  // Sin sesión → al login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Con sesión pero sin perfil cargado aún → esperar (no debería llegar aquí con loading bien manejado)
  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Rol requerido: admin tiene acceso a todo, otros solo a su ruta
  if (requiredRole && usuario.rol !== requiredRole && usuario.rol !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

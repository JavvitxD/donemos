import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session,       setSession]       = useState(undefined) // undefined = cargando sesión
  const [usuario,       setUsuario]       = useState(null)
  const [usuarioLoading,setUsuarioLoading]= useState(false)
  const sessionRef = useRef(null) // ref para que refreshUsuario no capture sesión stale

  useEffect(() => {
    // 1. Carga inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      sessionRef.current = session
      setSession(session)
      if (session) fetchUsuario(session.user)
      else         setSession(null) // null = no hay sesión (distinto de undefined)
    })

    // 2. Escucha cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      sessionRef.current = session
      setSession(session)
      if (session) fetchUsuario(session.user)
      else         setUsuario(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUsuario(authUser) {
    setUsuarioLoading(true)

    // Usamos maybeSingle() para que un resultado vacío devuelva data=null sin error,
    // y agregamos .limit(1) explícito para evitar ambigüedad con la policy RLS.
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, fundacion_id, fundaciones(nombre, foto_url)')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      // La tabla falló completamente (error de red, RLS mal configurado, etc.)
      // Solo en este caso usamos el metadata como último recurso.
      console.error('[AuthContext] Error leyendo tabla usuarios:', error.message, '| code:', error.code)
      setUsuario({
        id:            authUser.id,
        email:         authUser.email,
        nombre:        authUser.user_metadata?.nombre ?? authUser.email,
        rol:           authUser.user_metadata?.rol    ?? 'donante',
        fundacion_id:  null,
        fundaciones:   null,
        _fromMetadata: true,
      })
    } else if (data) {
      // Siempre priorizar el rol de la tabla usuarios
      console.log('[AuthContext] Usuario cargado de BD:', data.email, '| rol:', data.rol)
      setUsuario(data)
    } else {
      // data === null: el usuario tiene sesión pero no hay fila en la tabla usuarios.
      // Puede pasar si el trigger no corrió. Intentamos insertar la fila ahora.
      console.warn('[AuthContext] Sin fila en usuarios para', authUser.id, '— creando registro…')
      const { data: inserted, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id:     authUser.id,
          email:  authUser.email,
          nombre: authUser.user_metadata?.nombre ?? authUser.email,
          rol:    authUser.user_metadata?.rol    ?? 'donante',
        })
        .select('id, nombre, email, rol, fundacion_id, fundaciones(nombre, foto_url)')
        .maybeSingle()

      if (insertError) {
        console.error('[AuthContext] No se pudo crear fila en usuarios:', insertError.message)
        // Fallback metadata solo si el insert también falla
        setUsuario({
          id:            authUser.id,
          email:         authUser.email,
          nombre:        authUser.user_metadata?.nombre ?? authUser.email,
          rol:           authUser.user_metadata?.rol    ?? 'donante',
          fundacion_id:  null,
          fundaciones:   null,
          _fromMetadata: true,
        })
      } else {
        setUsuario(inserted)
      }
    }

    setUsuarioLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  function refreshUsuario() {
    const s = sessionRef.current
    if (s?.user) fetchUsuario(s.user)
  }

  const loading = session === undefined || usuarioLoading

  return (
    <AuthContext.Provider value={{ session, usuario, loading, signOut, refreshUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Ley1581Modal from '../components/Ley1581Modal'

const TABS = [
  { id: 'donante',   label: 'Soy donante',    emoji: '❤️' },
  { id: 'fundacion', label: 'Soy fundación',  emoji: '🏛️' },
]

export default function Register() {
  const navigate = useNavigate()
  const [tab,      setTab]      = useState('donante')
  const [showLey,  setShowLey]  = useState(false)
  const [acepta,   setAcepta]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)

  const [donante, setDonante] = useState({ nombre: '', email: '', password: '', confirm: '' })
  const [fund,    setFund]    = useState({ nombre: '', nit: '', email: '', password: '', confirm: '' })

  const setD = (k, v) => setDonante(f => ({ ...f, [k]: v }))
  const setF = (k, v) => setFund(f => ({ ...f, [k]: v }))

  function validate() {
    const f = tab === 'donante' ? donante : fund
    if (!f.nombre.trim())               return 'El nombre es obligatorio.'
    if (tab === 'fundacion' && !fund.nit.trim()) return 'El NIT es obligatorio.'
    if (!f.email.includes('@'))          return 'Ingresa un correo válido.'
    if (f.password.length < 8)           return 'La contraseña debe tener al menos 8 caracteres.'
    if (f.password !== f.confirm)        return 'Las contraseñas no coinciden.'
    if (!acepta)                         return 'Debes aceptar la política de tratamiento de datos.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    if (tab === 'donante') {
      const { error } = await supabase.auth.signUp({
        email:    donante.email,
        password: donante.password,
        options:  { data: { nombre: donante.nombre, rol: 'donante' } },
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSuccess('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.')
      setTimeout(() => navigate('/login'), 3000)

    } else {
      // Registro de fundación
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email:    fund.email,
        password: fund.password,
        options:  { data: { nombre: fund.nombre, rol: 'fundacion' } },
      })
      if (authError) { setLoading(false); setError(authError.message); return }

      // Insertar en tabla fundaciones
      const { data: fundData, error: fundError } = await supabase
        .from('fundaciones')
        .insert({ nombre: fund.nombre, email: fund.email, verificada: false })
        .select('id')
        .single()

      if (fundError) { setLoading(false); setError('Error al crear el perfil de fundación: ' + fundError.message); return }

      // Vincular usuario con la fundación (si ya hay sesión activa)
      if (authData.session) {
        await supabase
          .from('usuarios')
          .update({ fundacion_id: fundData.id })
          .eq('id', authData.user.id)
      }

      setLoading(false)
      setSuccess('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.')
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      {showLey && (
        <Ley1581Modal
          onAccept={() => { setAcepta(true); setShowLey(false) }}
          onClose={()  => setShowLey(false)}
        />
      )}

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 21C12 21 4 13.5 4 8.5C4 5.46 6.46 3 9.5 3C11.04 3 12 4 12 4C12 4 12.96 3 14.5 3C17.54 3 20 5.46 20 8.5C20 13.5 12 21 12 21Z" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Done<span className="text-primary-500">mos</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="mt-1 text-gray-500 text-sm">Únete a la comunidad solidaria de Colombia</p>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'donante' ? (
              <>
                <Field label="Nombre completo" value={donante.nombre} onChange={v => setD('nombre', v)} placeholder="Tu nombre" />
                <Field label="Correo electrónico" type="email" value={donante.email} onChange={v => setD('email', v)} placeholder="tu@correo.com" />
                <Field label="Contraseña" type="password" value={donante.password} onChange={v => setD('password', v)} placeholder="Mínimo 8 caracteres" />
                <Field label="Confirmar contraseña" type="password" value={donante.confirm} onChange={v => setD('confirm', v)} placeholder="Repite la contraseña" />
              </>
            ) : (
              <>
                <Field label="Nombre de la fundación" value={fund.nombre} onChange={v => setF('nombre', v)} placeholder="Ej: Fundación Semillas de Amor" />
                <Field label="NIT" value={fund.nit} onChange={v => setF('nit', v)} placeholder="Ej: 900.123.456-7" />
                <Field label="Correo institucional" type="email" value={fund.email} onChange={v => setF('email', v)} placeholder="contacto@fundacion.org" />
                <Field label="Contraseña" type="password" value={fund.password} onChange={v => setF('password', v)} placeholder="Mínimo 8 caracteres" />
                <Field label="Confirmar contraseña" type="password" value={fund.confirm} onChange={v => setF('confirm', v)} placeholder="Repite la contraseña" />
              </>
            )}

            {/* Política de datos */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
              <input
                type="checkbox"
                id="acepta"
                checked={acepta}
                onChange={e => setAcepta(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary-500 shrink-0"
              />
              <label htmlFor="acepta" className="text-sm text-gray-600 leading-relaxed">
                He leído y acepto la{' '}
                <button
                  type="button"
                  onClick={() => setShowLey(true)}
                  className="text-primary-500 font-medium hover:underline"
                >
                  Política de Tratamiento de Datos Personales
                </button>{' '}
                de conformidad con la <strong>Ley 1581 de 2012</strong>.
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
      />
    </div>
  )
}

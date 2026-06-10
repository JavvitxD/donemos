import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { categoriaMeta } from '../../data/fundaciones'

const TABS = [
  { id: 'historial',   label: 'Mis donaciones',       icon: '💚' },
  { id: 'fundaciones', label: 'Fundaciones apoyadas',  icon: '🏛️' },
]

export default function MiImpacto() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('historial')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi impacto</h1>
          <p className="text-gray-500 text-sm mt-1">Hola, {usuario?.nombre ?? 'donante'} 👋</p>
        </div>

        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 mb-8 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.id ? 'bg-primary-500 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {tab === 'historial'   && <TabHistorial   usuario={usuario} />}
        {tab === 'fundaciones' && <TabFundaciones  usuario={usuario} />}
      </div>
    </div>
  )
}

function TabHistorial({ usuario }) {
  const [donaciones, setDonaciones] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!usuario?.id) return
    supabase.from('donaciones')
      .select('*, fundaciones(nombre, categoria, foto_url), solicitudes(titulo)')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDonaciones(data ?? []); setLoading(false) })
  }, [usuario])

  if (loading) return <Spinner />

  if (donaciones.length === 0) return (
    <div className="card p-12 text-center">
      <p className="text-5xl mb-4">💚</p>
      <p className="font-semibold text-gray-700 mb-1">Aún no has realizado donaciones</p>
      <p className="text-gray-400 text-sm">Explora las fundaciones y empieza a generar impacto</p>
    </div>
  )

  const totalCOP = donaciones.filter(d => d.tipo === 'money').reduce((s, d) => s + (d.monto ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total donado" value={`$${totalCOP.toLocaleString('es-CO')}`} emoji="💵" />
        <StatCard label="Donaciones"   value={donaciones.length}                        emoji="🎁" />
        <StatCard label="Fundaciones"  value={new Set(donaciones.map(d => d.fundacion_id)).size} emoji="🏛️" />
      </div>

      {donaciones.map(d => {
        const catMeta = categoriaMeta[d.fundaciones?.categoria] ?? {}
        return (
          <div key={d.id} className="card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${catMeta.bgColor ?? 'bg-gray-100'} flex items-center justify-center text-xl shrink-0`}>
              {catMeta.emoji ?? '🏛️'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{d.fundaciones?.nombre ?? '—'}</p>
              <p className="text-xs text-gray-400 truncate">{d.solicitudes?.titulo ?? 'Donación libre'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(d.created_at).toLocaleDateString('es-CO')}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-primary-600 text-sm">
                {d.tipo === 'money' ? `$${Number(d.monto).toLocaleString()}` : d.descripcion ?? d.tipo}
              </p>
              <p className="text-xs text-gray-400 capitalize">{d.tipo}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TabFundaciones({ usuario }) {
  const [fundaciones, setFundaciones] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!usuario?.id) return
    supabase.from('donaciones')
      .select('fundaciones(id, nombre, descripcion, categoria, localidad, verificada, foto_url, web)')
      .eq('usuario_id', usuario.id)
      .then(({ data }) => {
        const unique = Object.values(
          (data ?? []).reduce((acc, d) => {
            if (d.fundaciones?.id) acc[d.fundaciones.id] = d.fundaciones
            return acc
          }, {})
        )
        setFundaciones(unique)
        setLoading(false)
      })
  }, [usuario])

  if (loading) return <Spinner />

  if (fundaciones.length === 0) return (
    <div className="card p-12 text-center">
      <p className="text-5xl mb-4">🏛️</p>
      <p className="font-semibold text-gray-700 mb-1">Aún no has apoyado ninguna fundación</p>
      <p className="text-gray-400 text-sm">Explora y dona para ver las fundaciones que has apoyado</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fundaciones.map(f => {
        const meta = categoriaMeta[f.categoria] ?? {}
        return (
          <div key={f.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl ${meta.bgColor ?? 'bg-gray-100'} flex items-center justify-center text-2xl shrink-0`}>
                {f.foto_url ? <img src={f.foto_url} alt="" className="w-full h-full object-cover rounded-xl" /> : (meta.emoji ?? '🏛️')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-snug">{f.nombre}</p>
                <p className={`text-xs font-medium mt-0.5 ${meta.textColor ?? 'text-gray-500'}`}>{meta.label ?? f.categoria}</p>
              </div>
              {f.verificada && (
                <svg className="w-4 h-4 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{f.descripcion}</p>
            {f.web && (
              <a href={`https://${f.web}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary-500 hover:underline">{f.web}</a>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, emoji }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl mb-1">{emoji}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function Spinner() {
  return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
}

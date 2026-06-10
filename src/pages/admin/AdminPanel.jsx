import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { categoriaMeta } from '../../data/fundaciones'

const TABS = [
  { id: 'fundaciones', label: 'Fundaciones',    icon: '🏛️' },
  { id: 'agregar',     label: 'Agregar',         icon: '➕' },
  { id: 'stats',       label: 'Estadísticas',    icon: '📊' },
]

export default function AdminPanel() {
  const [tab, setTab] = useState('fundaciones')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-lg">⚙️</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel administrador</h1>
            <p className="text-gray-500 text-sm">Gestión completa de Donemos</p>
          </div>
        </div>

        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 mb-8 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.id ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {tab === 'fundaciones' && <TabFundaciones />}
        {tab === 'agregar'     && <TabAgregar onCreated={() => setTab('fundaciones')} />}
        {tab === 'stats'       && <TabStats />}
      </div>
    </div>
  )
}

// ─── Tab Fundaciones ──────────────────────────────────────────────────────────
function TabFundaciones() {
  const [fundaciones, setFundaciones] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [queryError,  setQueryError]  = useState('')

  const load = async () => {
    setLoading(true)
    setQueryError('')
    const { data, error } = await supabase
      .from('fundaciones')
      .select('*')
      .order('nombre')

    if (error) {
      console.error('[AdminPanel] Error cargando fundaciones:', error.message, '| code:', error.code, '| hint:', error.hint)
      setQueryError(`Error: ${error.message} (code: ${error.code})`)
      setFundaciones([])
    } else {
      console.log('[AdminPanel] Fundaciones cargadas:', data?.length ?? 0)
      setFundaciones(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleVerificada(f) {
    const { error } = await supabase
      .from('fundaciones')
      .update({ verificada: !f.verificada })
      .eq('id', f.id)
    if (!error) setFundaciones(prev => prev.map(x => x.id === f.id ? { ...x, verificada: !x.verificada } : x))
  }

  const filtered = fundaciones.filter(f =>
    f.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (f.categoria ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      {queryError && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-700">No se pudieron cargar las fundaciones</p>
            <p className="text-xs text-red-500 mt-0.5 font-mono">{queryError}</p>
            <p className="text-xs text-red-400 mt-1">Revisa la consola del navegador para más detalles.</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-medium text-red-600 hover:underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar fundación o categoría…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <button onClick={load} className="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors" title="Recargar">
          ↺ Recargar
        </button>
        <span className="text-sm text-gray-500 shrink-0">{filtered.length} de {fundaciones.length}</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Fundación', 'Categoría', 'Localidad', 'Año', 'Verificada', 'Acción'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(f => {
              const meta = categoriaMeta[f.categoria] ?? {}
              return (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{f.nombre}</p>
                    {f.email && <p className="text-xs text-gray-400">{f.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bgColor ?? 'bg-gray-100'} ${meta.textColor ?? 'text-gray-600'}`}>
                      {meta.emoji} {meta.label ?? f.categoria ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{f.localidad ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{f.año_fundacion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.verificada ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.verificada ? '✅ Verificada' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleVerificada(f)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${f.verificada
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}>
                      {f.verificada ? 'Revocar' : 'Verificar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No se encontraron fundaciones</p>
        )}
      </div>
    </div>
  )
}

// ─── Tab Agregar Fundación ────────────────────────────────────────────────────
function TabAgregar({ onCreated }) {
  const [form, setForm] = useState({
    nombre: '', descripcion: '', categoria: '', localidad: '',
    web: '', email: '', beneficiarios: '', año_fundacion: '',
    verificada: false,
  })
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('fundaciones').insert({
      ...form,
      año_fundacion: parseInt(form.año_fundacion) || null,
    })
    setSaving(false)
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg('¡Fundación creada exitosamente!')
    setTimeout(() => { setMsg(''); onCreated() }, 1500)
  }

  return (
    <div className="card p-8 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Agregar fundación manualmente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} required />
          <AdminField label="Localidad" value={form.localidad} onChange={v => set('localidad', v)} />
          <AdminField label="Correo" value={form.email} onChange={v => set('email', v)} type="email" />
          <AdminField label="Sitio web" value={form.web} onChange={v => set('web', v)} />
          <AdminField label="Año de fundación" value={form.año_fundacion} onChange={v => set('año_fundacion', v)} type="number" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Selecciona</option>
              {Object.entries(categoriaMeta).map(([v, m]) => <option key={v} value={v}>{m.emoji} {m.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
        </div>
        <AdminField label="Beneficiarios" value={form.beneficiarios} onChange={v => set('beneficiarios', v)} />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.verificada} onChange={e => set('verificada', e.target.checked)} className="w-4 h-4 accent-primary-500" />
          <span className="text-sm font-medium text-gray-700">Marcar como verificada</span>
        </label>
        {msg && <div className={`text-sm px-4 py-3 rounded-xl ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
        <button type="submit" disabled={saving} className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Guardando…' : 'Crear fundación'}
        </button>
      </form>
    </div>
  )
}

// ─── Tab Estadísticas ─────────────────────────────────────────────────────────
function TabStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('fundaciones').select('*', { count: 'exact', head: true }),
      supabase.from('fundaciones').select('*', { count: 'exact', head: true }).eq('verificada', true),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 'donante'),
      supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('activa', true),
      supabase.from('donaciones').select('monto'),
    ]).then(([total, verif, users, donantes, solic, donaciones]) => {
      const totalDonado = (donaciones.data ?? []).reduce((s, d) => s + (d.monto ?? 0), 0)
      setStats({
        totalFundaciones: total.count      ?? 0,
        verificadas:      verif.count      ?? 0,
        totalUsuarios:    users.count      ?? 0,
        donantes:         donantes.count   ?? 0,
        solicActivas:     solic.count      ?? 0,
        totalDonado,
      })
    })
  }, [])

  if (!stats) return <Spinner />

  const items = [
    { label: 'Total fundaciones',   value: stats.totalFundaciones, emoji: '🏛️', color: 'bg-primary-50' },
    { label: 'Verificadas',         value: stats.verificadas,      emoji: '✅', color: 'bg-green-50'   },
    { label: 'Total usuarios',      value: stats.totalUsuarios,    emoji: '👥', color: 'bg-blue-50'    },
    { label: 'Donantes activos',    value: stats.donantes,         emoji: '❤️', color: 'bg-red-50'     },
    { label: 'Solicitudes activas', value: stats.solicActivas,     emoji: '📋', color: 'bg-amber-50'   },
    { label: 'Total donado (COP)',  value: `$${stats.totalDonado.toLocaleString('es-CO')}`, emoji: '💰', color: 'bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.label} className={`card p-6 ${item.color}`}>
          <p className="text-3xl mb-3">{item.emoji}</p>
          <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          <p className="text-sm text-gray-500 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

function AdminField({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
    </div>
  )
}

function Spinner() {
  return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
}

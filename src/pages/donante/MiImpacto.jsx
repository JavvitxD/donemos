import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { categoriaMeta } from '../../data/fundaciones'
import { Link, useSearchParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ─── Constantes de insignias ──────────────────────────────────────────────────
const INSIGNIAS_DEF = [
  { id: 'primer_paso',       emoji: '🌱', nombre: 'Primer paso',        desc: 'Realizaste tu primera donación en Donemos' },
  { id: 'donante_activo',    emoji: '☘️', nombre: 'Donante activo',     desc: 'Llegaste a 3 donaciones realizadas' },
  { id: 'corazon_solidario', emoji: '❤️', nombre: 'Corazón solidario',  desc: 'Completaste 5 donaciones' },
  { id: 'heroe_donemos',     emoji: '🏆', nombre: 'Héroe Donemos',      desc: '¡10 donaciones! Eres parte del núcleo de Donemos' },
  { id: 'impacto_multiple',  emoji: '🌍', nombre: 'Impacto múltiple',   desc: 'Donaste en 3 o más categorías distintas' },
  { id: 'respuesta_rapida',  emoji: '⚡', nombre: 'Respuesta rápida',   desc: 'Donaste dentro de las primeras 24h de una solicitud urgente' },
]

function calcularInsignias(donaciones) {
  if (!donaciones.length) return []
  const earned = []
  const total = donaciones.length
  const categorias = new Set(donaciones.map(d => d.fundaciones?.categoria).filter(Boolean))

  const sortedAsc = [...donaciones].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  if (total >= 1)  earned.push({ ...INSIGNIAS_DEF[0], fecha: sortedAsc[0].created_at })
  if (total >= 3)  earned.push({ ...INSIGNIAS_DEF[1], fecha: sortedAsc[2].created_at })
  if (total >= 5)  earned.push({ ...INSIGNIAS_DEF[2], fecha: sortedAsc[4].created_at })
  if (total >= 10) earned.push({ ...INSIGNIAS_DEF[3], fecha: sortedAsc[9].created_at })
  if (categorias.size >= 3) {
    // Fecha en que se alcanzó la 3ª categoría
    const seenCats = new Set()
    let fechaMultiple = null
    for (const d of sortedAsc) {
      seenCats.add(d.fundaciones?.categoria)
      if (seenCats.size >= 3) { fechaMultiple = d.created_at; break }
    }
    earned.push({ ...INSIGNIAS_DEF[4], fecha: fechaMultiple ?? sortedAsc[0].created_at })
  }
  // Respuesta rápida: donación dentro de 24h de la solicitud
  const rapida = donaciones.find(d => {
    if (!d.solicitudes?.created_at) return false
    const diff = new Date(d.created_at) - new Date(d.solicitudes.created_at)
    return diff >= 0 && diff < 86400000
  })
  if (rapida) earned.push({ ...INSIGNIAS_DEF[5], fecha: rapida.created_at })

  return earned
}

// ─── Número en letras (simplificado) ─────────────────────────────────────────
const UNIDADES = ['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
  'diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve']
const DECENAS  = ['','diez','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa']

function numeroALetras(n) {
  if (n === 0) return 'cero'
  if (n < 0)   return 'menos ' + numeroALetras(-n)
  if (n < 20)  return UNIDADES[n]
  if (n < 100) return DECENAS[Math.floor(n/10)] + (n%10 ? ' y ' + UNIDADES[n%10] : '')
  if (n < 1000) return (n === 100 ? 'cien' : UNIDADES[Math.floor(n/100)] + 'cientos') + (n%100 ? ' ' + numeroALetras(n%100) : '')
  if (n < 1000000) return (Math.floor(n/1000) === 1 ? 'mil' : numeroALetras(Math.floor(n/1000)) + ' mil') + (n%1000 ? ' ' + numeroALetras(n%1000) : '')
  return n.toLocaleString('es-CO')
}

// ─── Componente principal ─────────────────────────────────────────────────────
const TABS = [
  { id: 'resumen',    label: 'Mi impacto',        icon: '🌟' },
  { id: 'historial',  label: 'Donaciones',         icon: '💚' },
  { id: 'fundaciones',label: 'Fundaciones',         icon: '🏛️' },
  { id: 'tarjeta',    label: 'Mi tarjeta',          icon: '🎖️' },
]

export default function MiImpacto() {
  const { usuario } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab,       setTab]       = useState('resumen')
  const [donaciones,setDonaciones]= useState([])
  const [loading,   setLoading]   = useState(true)
  const [celebracion, setCelebracion] = useState(null) // { fundacion, monto, insigniaNueva }

  const load = useCallback(async () => {
    if (!usuario?.id) return
    const { data } = await supabase
      .from('donaciones')
      .select(`*, fundaciones(id, nombre, categoria, foto_url, web, nit, direccion, certificado_tributario),
               solicitudes(titulo, created_at, urgencia)`)
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
    setDonaciones(data ?? [])
    setLoading(false)
  }, [usuario])

  useEffect(() => { load() }, [load])

  // Celebración via URL param ?celebracion=1
  useEffect(() => {
    if (searchParams.get('celebracion') && donaciones.length > 0) {
      const ultima = donaciones[0]
      setCelebracion({
        fundacion: ultima.fundaciones?.nombre ?? 'la fundación',
        monto: ultima.monto,
        tipo: ultima.tipo,
      })
    }
  }, [searchParams, donaciones])

  const insignias = calcularInsignias(donaciones)
  const totalCOP  = donaciones.filter(d => d.tipo === 'money').reduce((s, d) => s + (d.monto ?? 0), 0)
  const fundacionesUnicas = [...new Set(donaciones.map(d => d.fundacion_id).filter(Boolean))]
  const categoriasFav = [...new Set(donaciones.map(d => d.fundaciones?.categoria).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Celebración modal */}
      {celebracion && (
        <CelebracionModal
          usuario={usuario}
          celebracion={celebracion}
          insignias={insignias}
          onClose={() => setCelebracion(null)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi impacto</h1>
          <p className="text-gray-500 text-sm mt-1">Hola, {usuario?.nombre ?? 'donante'} 👋</p>
        </div>

        {/* Métricas */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Total donado"       value={`$${totalCOP.toLocaleString('es-CO')}`}       emoji="💵" sub="COP" />
            <MetricCard label="Fundaciones"         value={fundacionesUnicas.length}                      emoji="🏛️" sub="apoyadas" />
            <MetricCard label="Donaciones"          value={donaciones.length}                             emoji="🎁" sub="realizadas" />
            <MetricCard label="Categorías"          value={categoriasFav.length}                          emoji="🌈" sub="distintas" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${tab === t.id ? 'bg-primary-500 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <>
            {tab === 'resumen'     && <TabResumen     donaciones={donaciones} insignias={insignias} usuario={usuario} />}
            {tab === 'historial'   && <TabHistorial   donaciones={donaciones} usuario={usuario} />}
            {tab === 'fundaciones' && <TabFundaciones donaciones={donaciones} />}
            {tab === 'tarjeta'     && <TabTarjeta     donaciones={donaciones} usuario={usuario} totalCOP={totalCOP} />}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Tab Resumen (insignias) ──────────────────────────────────────────────────
function TabResumen({ donaciones, insignias, usuario }) {
  const categoriasFav = Object.entries(
    donaciones.reduce((acc, d) => {
      const cat = d.fundaciones?.categoria
      if (cat) acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 3)

  if (donaciones.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-5xl mb-4">🌱</p>
        <p className="font-semibold text-gray-700 mb-1">Tu historia de impacto empieza aquí</p>
        <p className="text-gray-400 text-sm mb-6">Realiza tu primera donación para desbloquear insignias</p>
        <Link to="/fundaciones" className="btn-primary py-2.5 px-7">Explorar fundaciones →</Link>
      </div>
    )
  }

  const pendientes = INSIGNIAS_DEF.filter(def => !insignias.find(e => e.id === def.id))

  return (
    <div className="space-y-6">
      {/* Insignias ganadas */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Mis insignias
          <span className="ml-2 text-xs bg-primary-50 text-primary-600 font-medium px-2 py-0.5 rounded-full">
            {insignias.length} / {INSIGNIAS_DEF.length}
          </span>
        </h2>
        {insignias.length === 0 ? (
          <p className="text-sm text-gray-400">Sigue donando para desbloquear tus primeras insignias.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {insignias.map(ins => (
              <div key={ins.id} className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                <span className="text-3xl shrink-0">{ins.emoji}</span>
                <div>
                  <p className="font-semibold text-primary-800 text-sm">{ins.nombre}</p>
                  <p className="text-xs text-primary-600 mt-0.5">{ins.desc}</p>
                  <p className="text-xs text-primary-400 mt-1">
                    {new Date(ins.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Por desbloquear */}
      {pendientes.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Por desbloquear</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pendientes.map(ins => (
              <div key={ins.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl opacity-60">
                <span className="text-2xl shrink-0 grayscale">{ins.emoji}</span>
                <div>
                  <p className="font-medium text-gray-500 text-sm">{ins.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorías favoritas */}
      {categoriasFav.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tus categorías favoritas</h2>
          <div className="flex flex-wrap gap-3">
            {categoriasFav.map(([cat, count]) => {
              const m = categoriaMeta[cat] ?? {}
              return (
                <div key={cat} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${m.bgColor ?? 'bg-gray-50'} border border-gray-100`}>
                  <span className="text-lg">{m.emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${m.textColor ?? 'text-gray-700'}`}>{m.label ?? cat}</p>
                    <p className="text-xs text-gray-400">{count} donación{count !== 1 ? 'es' : ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab Historial ────────────────────────────────────────────────────────────
const TIPO_META = {
  money:        { label: 'Dinero',        color: 'bg-blue-50 text-blue-700'   },
  clothes:      { label: 'Ropa',          color: 'bg-amber-50 text-amber-700' },
  food:         { label: 'Alimentos',     color: 'bg-orange-50 text-orange-700' },
  books:        { label: 'Libros',        color: 'bg-purple-50 text-purple-700' },
  voluntariado: { label: 'Voluntariado',  color: 'bg-green-50 text-green-700' },
}

function TabHistorial({ donaciones, usuario }) {
  const [filtroTipo,  setFiltroTipo]  = useState('all')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [descargando, setDescargando] = useState(null)

  const filtered = donaciones.filter(d => {
    const matchTipo  = filtroTipo === 'all' || d.tipo === filtroTipo
    const matchFecha = !filtroFecha || d.created_at.startsWith(filtroFecha)
    return matchTipo && matchFecha
  })

  async function descargarCertificado(donacion) {
    setDescargando(donacion.id)
    await generarCertificadoPDF(donacion, usuario)
    setDescargando(null)
  }

  if (donaciones.length === 0) return (
    <div className="card p-12 text-center">
      <p className="text-5xl mb-4">💚</p>
      <p className="font-semibold text-gray-700 mb-1">Aún no has realizado donaciones</p>
      <p className="text-gray-400 text-sm mb-5">Explora las fundaciones y empieza a generar impacto</p>
      <Link to="/fundaciones" className="btn-primary py-2.5 px-7">Explorar →</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="all">Todos los tipos</option>
          {Object.entries(TIPO_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
        <input type="month" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        {(filtroTipo !== 'all' || filtroFecha) && (
          <button onClick={() => { setFiltroTipo('all'); setFiltroFecha('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">
            × Limpiar filtros
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} donación{filtered.length !== 1 ? 'es' : ''}</p>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Sin resultados para los filtros seleccionados</p>
      ) : filtered.map(d => {
        const catMeta = categoriaMeta[d.fundaciones?.categoria] ?? {}
        const tipoMeta = TIPO_META[d.tipo] ?? TIPO_META.money
        const elegible = d.fundaciones?.certificado_tributario && d.tipo === 'money' && d.monto > 0
        return (
          <div key={d.id} className="card p-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${catMeta.bgColor ?? 'bg-gray-100'} flex items-center justify-center text-xl shrink-0`}>
                {catMeta.emoji ?? '🏛️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{d.fundaciones?.nombre ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.solicitudes?.titulo ?? 'Donación libre'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(d.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600 text-sm">
                      {d.tipo === 'money' ? `$${Number(d.monto).toLocaleString('es-CO')}` : d.descripcion ?? d.tipo}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${tipoMeta.color}`}>
                      {tipoMeta.label}
                    </span>
                  </div>
                </div>
                {elegible && (
                  <button
                    onClick={() => descargarCertificado(d)}
                    disabled={descargando === d.id}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {descargando === d.id
                      ? <><span className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> Generando…</>
                      : <>📜 Descargar certificado tributario</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab Fundaciones ──────────────────────────────────────────────────────────
function TabFundaciones({ donaciones }) {
  const fundacionesMap = donaciones.reduce((acc, d) => {
    if (d.fundaciones?.id) acc[d.fundaciones.id] = d.fundaciones
    return acc
  }, {})
  const fundaciones = Object.values(fundacionesMap)

  if (fundaciones.length === 0) return (
    <div className="card p-12 text-center">
      <p className="text-5xl mb-4">🏛️</p>
      <p className="font-semibold text-gray-700 mb-1">Aún no has apoyado ninguna fundación</p>
      <p className="text-gray-400 text-sm mb-5">Explora y dona para ver las organizaciones que has apoyado</p>
      <Link to="/fundaciones" className="btn-primary py-2.5 px-7">Explorar →</Link>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fundaciones.map(f => {
        const meta = categoriaMeta[f.categoria] ?? {}
        return (
          <div key={f.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl ${meta.bgColor ?? 'bg-gray-100'} flex items-center justify-center text-2xl shrink-0 overflow-hidden`}>
                {f.foto_url
                  ? <img src={f.foto_url} alt="" className="w-full h-full object-cover" />
                  : (meta.emoji ?? '🏛️')
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-snug">{f.nombre}</p>
                <p className={`text-xs font-medium mt-0.5 ${meta.textColor ?? 'text-gray-500'}`}>{meta.label ?? f.categoria}</p>
              </div>
            </div>
            <Link to={`/fundacion/${f.id}`} className="text-xs text-primary-500 hover:underline font-medium">
              Ver perfil →
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab Tarjeta de impacto ───────────────────────────────────────────────────
function TabTarjeta({ donaciones, usuario, totalCOP }) {
  const cardRef    = useRef()
  const [saving,   setSaving]  = useState(false)
  const [sharing,  setSharing] = useState(false)

  const fundacionesUnicas = new Set(donaciones.map(d => d.fundacion_id).filter(Boolean)).size
  // Estimación optimista de personas impactadas (promedio 10 por donación)
  const personas = fundacionesUnicas * 10 + donaciones.length * 5

  async function descargarTarjeta() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null })
      const url    = canvas.toDataURL('image/png')
      const a      = document.createElement('a')
      a.href       = url
      a.download   = `impacto-donemos-${usuario?.nombre ?? 'donante'}.png`
      a.click()
    } catch (e) {
      console.error('Error generando tarjeta:', e)
    }
    setSaving(false)
  }

  async function compartir() {
    const text = `He donado $${totalCOP.toLocaleString('es-CO')} COP y apoyado ${fundacionesUnicas} fundaciones en Colombia con Donemos 💚 #Donemos #Colombia`
    if (navigator.share) {
      setSharing(true)
      try { await navigator.share({ text, url: 'https://donemos.org' }) }
      catch {}
      setSharing(false)
    } else {
      await navigator.clipboard.writeText(text)
      alert('¡Texto copiado al portapapeles!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Tarjeta visual */}
      <div
        ref={cardRef}
        className="w-full max-w-md mx-auto rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1D9E75 0%, #0d6e52 100%)',
          padding: '2rem',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💚
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              Done<span style={{ color: 'rgba(255,255,255,0.7)' }}>mos</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>Tarjeta de impacto</div>
          </div>
        </div>

        {/* Nombre */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Donante
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 2 }}>
            {usuario?.nombre ?? 'Donante Donemos'}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total donado', value: `$${totalCOP.toLocaleString('es-CO')}`, sub: 'COP' },
            { label: 'Fundaciones', value: fundacionesUnicas, sub: 'apoyadas' },
            { label: 'Est. personas', value: `+${personas}`, sub: 'impactadas' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Fecha */}
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
          {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={descargarTarjeta} disabled={saving}
          className="btn-primary py-2.5 px-6 flex items-center gap-2 text-sm">
          {saving
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generando…</>
            : <>⬇️ Descargar tarjeta PNG</>
          }
        </button>
        <button onClick={compartir} disabled={sharing}
          className="btn-outline py-2.5 px-6 flex items-center gap-2 text-sm">
          {sharing ? 'Compartiendo…' : '🔗 Compartir en redes'}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        La tarjeta se descarga como imagen PNG de alta resolución
      </p>
    </div>
  )
}

// ─── Modal de celebración ─────────────────────────────────────────────────────
function CelebracionModal({ usuario, celebracion, insignias, onClose }) {
  const canvasRef = useRef()

  useEffect(() => {
    // Confetti manual con canvas
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const piezas = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 5,
      color: ['#1D9E75','#34d399','#fbbf24','#f87171','#60a5fa','#a78bfa'][Math.floor(Math.random() * 6)],
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      vr: (Math.random() - 0.5) * 0.15,
    }))

    let frame
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      piezas.forEach(p => {
        p.x  += p.vx
        p.y  += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      frame = requestAnimationFrame(tick)
    }
    tick()
    const timer = setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height) }, 3500)
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [])

  // Insignia más nueva (última ganada)
  const ultimaInsignia = insignias[insignias.length - 1] ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-60 bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Gracias, {usuario?.nombre ?? 'donante'}!</h2>
        <p className="text-gray-600 text-sm mb-6">
          Tu aporte de{' '}
          {celebracion.tipo === 'money'
            ? <strong>${Number(celebracion.monto).toLocaleString('es-CO')} COP</strong>
            : <strong>una donación en especie</strong>
          }{' '}
          ayudó a <strong>{celebracion.fundacion}</strong>. Cada granito de arena suma.
        </p>

        {ultimaInsignia && (
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6">
            <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-2">¡Insignia desbloqueada!</p>
            <div className="text-4xl mb-1">{ultimaInsignia.emoji}</div>
            <p className="font-bold text-primary-800">{ultimaInsignia.nombre}</p>
            <p className="text-xs text-primary-600 mt-1">{ultimaInsignia.desc}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-primary py-2.5">
            Ver mi impacto
          </button>
        </div>
        <button onClick={onClose} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
          Cerrar
        </button>
      </div>
    </div>
  )
}

// ─── Generador de certificado PDF ─────────────────────────────────────────────
async function generarCertificadoPDF(donacion, usuario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20

  // Fondo header
  doc.setFillColor(29, 158, 117)
  doc.rect(0, 0, W, 45, 'F')

  // Logo / nombre plataforma
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('Donemos', margin, 22)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('donemos.org  |  Colombia', margin, 30)

  // Título
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE DONACIÓN', W / 2, 40, { align: 'center' })

  // Cuerpo
  doc.setTextColor(30, 30, 30)
  let y = 60

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `La Fundación ${donacion.fundaciones?.nombre ?? '—'}, identificada con NIT ${donacion.fundaciones?.nit ?? '—'}, certifica que:`,
    margin, y, { maxWidth: W - margin * 2 }
  )
  y += 14

  // Datos donante
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del donante', margin, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre:  ${usuario?.nombre ?? '—'}`, margin + 4, y); y += 6
  doc.text(`Correo:  ${usuario?.email ?? '—'}`, margin + 4, y); y += 6
  y += 4

  // Datos fundación
  doc.setFont('helvetica', 'bold')
  doc.text('Datos de la organización receptora', margin, y); y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre:    ${donacion.fundaciones?.nombre ?? '—'}`, margin + 4, y); y += 6
  doc.text(`NIT:       ${donacion.fundaciones?.nit ?? 'No registrado'}`, margin + 4, y); y += 6
  doc.text(`Dirección: ${donacion.fundaciones?.direccion ?? 'Colombia'}`, margin + 4, y); y += 6
  y += 4

  // Detalle donación
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de la donación', margin, y); y += 7
  doc.setFont('helvetica', 'normal')
  const monto = Number(donacion.monto ?? 0)
  doc.text(`Valor en números: $${monto.toLocaleString('es-CO')} COP`, margin + 4, y); y += 6
  doc.text(`Valor en letras:  ${numeroALetras(monto)} pesos colombianos`, margin + 4, y, { maxWidth: W - margin * 2 - 4 }); y += 9
  doc.text(
    `Fecha:  ${new Date(donacion.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    margin + 4, y
  ); y += 6
  if (donacion.solicitudes?.titulo) {
    doc.text(`Solicitud: ${donacion.solicitudes.titulo}`, margin + 4, y, { maxWidth: W - margin * 2 - 4 }); y += 6
  }
  y += 6

  // Marco legal
  doc.setFillColor(240, 252, 248)
  doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, 'F')
  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(8.5)
  doc.setTextColor(15, 100, 75)
  const legal = [
    'Base legal: Artículo 125 del Estatuto Tributario colombiano.',
    'Esta donación puede ser deducible de renta hasta el 25% del valor donado,',
    'conforme al Régimen Tributario Especial. Conserve este certificado junto',
    'a su declaración de renta. Validez: año gravable de la donación.',
  ]
  doc.text(legal, margin + 4, y + 7, { maxWidth: W - margin * 2 - 8 })
  y += 36

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 4

  // Firma
  doc.line(margin, y + 20, margin + 60, y + 20)
  doc.setFontSize(9)
  doc.text('Firma Representante Legal', margin, y + 26)
  doc.text(donacion.fundaciones?.nombre ?? '—', margin, y + 32)

  doc.line(W - margin - 60, y + 20, W - margin, y + 20)
  doc.text('Sello / Firma Donemos', W - margin - 60, y + 26)

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text(
    `Generado por Donemos Colombia | donemos.org | ${new Date().toLocaleDateString('es-CO')}`,
    W / 2, 285, { align: 'center' }
  )

  doc.save(`certificado-donemos-${donacion.id}.pdf`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function MetricCard({ label, value, emoji, sub }) {
  return (
    <div className="card p-4 text-center hover:shadow-md transition-shadow">
      <p className="text-2xl mb-1.5">{emoji}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function Spinner() {
  return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
}

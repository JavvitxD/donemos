import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fundaciones as localData, categoriaMeta } from '../data/fundaciones'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function normalizeF(f, fromDb) {
  if (!fromDb) return f
  return {
    id: f.id, nombre: f.nombre, descripcion: f.descripcion,
    historia: f.historia, categoria: f.categoria, localidad: f.localidad,
    direccion: f.direccion, horario: f.horario, telefono: f.telefono,
    whatsapp: f.whatsapp, web: f.web, email: f.email,
    verificada: f.verificada, beneficiarios: f.beneficiarios,
    añoFundacion: f.año_fundacion, foto_url: f.foto_url,
    aceptaDinero: f.acepta_dinero, aceptaEspecies: f.acepta_especies,
    aceptaVoluntarios: f.acepta_voluntarios,
    certificadoTributario: f.certificado_tributario,
  }
}

const tipoLabel = {
  money: { label: 'Dinero', color: 'bg-blue-100 text-blue-700', emoji: '💵' },
  clothes: { label: 'Ropa', color: 'bg-amber-100 text-amber-700', emoji: '👕' },
  food: { label: 'Alimentos', color: 'bg-orange-100 text-orange-700', emoji: '🥫' },
  books: { label: 'Libros', color: 'bg-purple-100 text-purple-700', emoji: '📚' },
  voluntariado: { label: 'Voluntariado', color: 'bg-green-100 text-green-700', emoji: '🤝' },
}

const urgenciaColor = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-green-100 text-green-700',
}

export default function FundacionPerfil() {
  const { id } = useParams()
  const [fundacion,   setFundacion]   = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Try Supabase first
      const isUuid = /^[0-9a-f-]{36}$/i.test(id)
      const isNum  = /^\d+$/.test(id)

      let f = null
      if (isUuid || isNum) {
        const { data } = await supabase.from('fundaciones').select('*').eq('id', id).maybeSingle()
        if (data) f = normalizeF(data, true)
      }

      // Fallback to local data (local IDs are numbers)
      if (!f && isNum) {
        const local = localData.find(x => x.id === parseInt(id))
        if (local) f = local
      }

      if (!f) { setNotFound(true); setLoading(false); return }
      setFundacion(f)

      // Load active solicitudes
      if (isUuid || (isNum && !localData.find(x => x.id === parseInt(id)))) {
        const { data: sols } = await supabase
          .from('solicitudes')
          .select('*')
          .eq('fundacion_id', id)
          .eq('activa', true)
          .order('created_at', { ascending: false })
        setSolicitudes(sols ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
          <p className="text-6xl">🏛️</p>
          <h1 className="text-2xl font-bold text-gray-900">Fundación no encontrada</h1>
          <p className="text-gray-500">Esta fundación no existe o fue eliminada.</p>
          <Link to="/fundaciones" className="btn-primary py-2.5 px-6">Ver directorio</Link>
        </div>
      </>
    )
  }

  const meta = categoriaMeta[fundacion.categoria] ?? categoriaMeta.educacion

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">

        {/* Hero banner */}
        <div className={`bg-gradient-to-br from-primary-500 to-primary-700 text-white pt-12 pb-20`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/fundaciones" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-8 transition-colors">
              ← Volver al directorio
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur overflow-hidden flex items-center justify-center shrink-0">
                {fundacion.foto_url
                  ? <img src={fundacion.foto_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-4xl">{meta.emoji}</span>
                }
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{fundacion.nombre}</h1>
                  {fundacion.verificada && (
                    <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                      </svg>
                      Verificada
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white`}>
                    {meta.emoji} {meta.label}
                  </span>
                </div>
                <p className="text-white/80 max-w-2xl">{fundacion.descripcion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Columna lateral */}
            <div className="space-y-5">

              {/* Contacto */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Contacto</h2>
                <ul className="space-y-3">
                  {fundacion.localidad && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">📍</span>
                      <span>{fundacion.localidad}{fundacion.direccion ? ` — ${fundacion.direccion}` : ''}</span>
                    </li>
                  )}
                  {fundacion.horario && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">🕐</span>
                      <span>{fundacion.horario}</span>
                    </li>
                  )}
                  {fundacion.telefono && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">📞</span>
                      <a href={`tel:${fundacion.telefono}`} className="hover:text-primary-600">{fundacion.telefono}</a>
                    </li>
                  )}
                  {fundacion.whatsapp && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">💬</span>
                      <a href={`https://wa.me/${fundacion.whatsapp.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary-600">{fundacion.whatsapp}</a>
                    </li>
                  )}
                  {fundacion.email && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">✉️</span>
                      <a href={`mailto:${fundacion.email}`} className="hover:text-primary-600 break-all">{fundacion.email}</a>
                    </li>
                  )}
                  {fundacion.web && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">🌐</span>
                      <a href={fundacion.web.startsWith('http') ? fundacion.web : `https://${fundacion.web}`}
                        target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary-600 break-all">{fundacion.web}</a>
                    </li>
                  )}
                  {fundacion.añoFundacion && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">📅</span>
                      <span>Fundada en {fundacion.añoFundacion} · {new Date().getFullYear() - fundacion.añoFundacion} años</span>
                    </li>
                  )}
                  {fundacion.beneficiarios && (
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-base shrink-0">👥</span>
                      <span>{fundacion.beneficiarios}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Tipos de ayuda */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">¿Cómo puedes ayudar?</h2>
                <div className="space-y-2">
                  {fundacion.aceptaDinero          && <Badge color="bg-blue-50 text-blue-700"    icon="💵" label="Donaciones en dinero" />}
                  {fundacion.aceptaEspecies        && <Badge color="bg-amber-50 text-amber-700"  icon="📦" label="Donaciones en especies" />}
                  {fundacion.aceptaVoluntarios     && <Badge color="bg-green-50 text-green-700"  icon="🤝" label="Voluntariado" />}
                  {fundacion.certificadoTributario && <Badge color="bg-purple-50 text-purple-700" icon="📜" label="Emite certif. tributario (DIAN)" />}
                </div>
              </div>
            </div>

            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-5">

              {/* Historia */}
              {fundacion.historia && (
                <div className="card p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Nuestra historia</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{fundacion.historia}</p>
                </div>
              )}

              {/* Solicitudes activas */}
              <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-5">
                  Solicitudes activas
                  {solicitudes.length > 0 && (
                    <span className="ml-2 text-xs bg-primary-50 text-primary-600 font-medium px-2 py-0.5 rounded-full">
                      {solicitudes.length}
                    </span>
                  )}
                </h2>

                {solicitudes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-sm">Esta fundación no tiene solicitudes activas por ahora.</p>
                    <Link to={`/donar/${fundacion.id}`} className="inline-block mt-4 btn-primary text-sm py-2 px-5">
                      Donar a esta fundación
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {solicitudes.map(s => {
                      const pct  = s.meta > 0 ? Math.min(100, Math.round(((s.progreso ?? 0) / s.meta) * 100)) : 0
                      const tipo = tipoLabel[s.tipo] ?? tipoLabel.money
                      return (
                        <div key={s.id} className="border border-gray-100 rounded-2xl p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm">{s.titulo}</h3>
                              {s.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.descripcion}</p>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${urgenciaColor[s.urgencia] ?? 'bg-gray-100 text-gray-600'}`}>
                                {s.urgencia}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${tipo.color}`}>
                                {tipo.emoji} {tipo.label}
                              </span>
                            </div>
                          </div>
                          {s.meta > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span className="font-semibold text-gray-800">{pct}% alcanzado</span>
                                <span>
                                  {s.tipo === 'money'
                                    ? `$${Number(s.progreso ?? 0).toLocaleString('es-CO')} / $${Number(s.meta).toLocaleString('es-CO')}`
                                    : `${s.progreso ?? 0} / ${s.meta}`}
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}
                          <Link to={`/donar/${fundacion.id}`} className="inline-block btn-primary text-xs py-2 px-4">
                            Quiero ayudar
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function Badge({ color, icon, label }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${color}`}>
      <span>{icon}</span> {label}
    </div>
  )
}

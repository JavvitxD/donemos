import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fundaciones as localData, categoriaMeta } from '../data/fundaciones'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function normalizeF(f, fromDb) {
  if (!fromDb) return f
  return {
    id: f.id, nombre: f.nombre, descripcion: f.descripcion,
    categoria: f.categoria, localidad: f.localidad, web: f.web,
    email: f.email, verificada: f.verificada,
    beneficiarios: f.beneficiarios, añoFundacion: f.año_fundacion,
    foto_url: f.foto_url,
    aceptaDinero: f.acepta_dinero, aceptaEspecies: f.acepta_especies,
    aceptaVoluntarios: f.acepta_voluntarios,
    certificadoTributario: f.certificado_tributario,
  }
}

export default function Fundaciones() {
  const [searchParams] = useSearchParams()
  const [fundaciones, setFundaciones] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState(searchParams.get('q') ?? '')
  const [categoria, setCategoria]     = useState('all')
  const [soloVerificadas, setSoloVerificadas] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('fundaciones').select('*').order('nombre')
      if (error || !data || data.length === 0) {
        setFundaciones(localData)
      } else {
        setFundaciones(data.map(f => normalizeF(f, true)))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = fundaciones.filter(f => {
    const q = search.toLowerCase()
    const matchQ = !q ||
      f.nombre.toLowerCase().includes(q) ||
      (f.descripcion ?? '').toLowerCase().includes(q) ||
      (f.localidad ?? '').toLowerCase().includes(q) ||
      (f.categoria ?? '').toLowerCase().includes(q)
    const matchCat = categoria === 'all' || f.categoria === categoria
    const matchVer = !soloVerificadas || f.verificada
    return matchQ && matchCat && matchVer
  })

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Directorio de fundaciones</h1>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Todas las organizaciones verificadas que trabajan por Colombia
            </p>
            <div className="bg-white rounded-2xl p-2 flex items-center gap-2 max-w-xl mx-auto shadow-lg">
              <div className="flex-1 flex items-center gap-3 px-3">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Busca por nombre, causa o localidad…"
                  className="flex-1 text-gray-800 placeholder-gray-400 text-sm outline-none bg-transparent py-2"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
              <button
                onClick={() => setCategoria('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all
                  ${categoria === 'all' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'}`}
              >
                🌟 Todas ({fundaciones.length})
              </button>
              {Object.entries(categoriaMeta).map(([id, m]) => {
                const count = fundaciones.filter(f => f.categoria === id).length
                return (
                  <button key={id} onClick={() => setCategoria(id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all
                      ${categoria === id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'}`}
                  >
                    {m.emoji} {m.label} ({count})
                  </button>
                )
              })}
            </div>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={soloVerificadas} onChange={e => setSoloVerificadas(e.target.checked)}
                className="w-4 h-4 accent-primary-500" />
              <span className="text-sm font-medium text-gray-700">Solo verificadas</span>
            </label>
          </div>

          {/* Conteo */}
          <p className="text-sm text-gray-500 mb-6">
            {loading ? 'Cargando…' : `${filtered.length} fundación${filtered.length !== 1 ? 'es' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-gray-700 mb-2">Sin resultados</p>
              <p className="text-gray-400 text-sm">Intenta con otro término o categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(f => {
                const meta = categoriaMeta[f.categoria] ?? categoriaMeta.educacion
                return (
                  <div key={f.id} className="card p-5 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-14 h-14 ${meta.bgColor} rounded-2xl flex items-center justify-center shrink-0 overflow-hidden`}>
                        {f.foto_url
                          ? <img src={f.foto_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-2xl">{meta.emoji}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{f.nombre}</h3>
                          {f.verificada && (
                            <svg className="w-4 h-4 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${meta.textColor}`}>{meta.label}</span>
                        {f.localidad && <p className="text-xs text-gray-400 mt-0.5">{f.localidad}</p>}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">{f.descripcion}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {f.aceptaDinero          && <span className="text-xs bg-blue-50   text-blue-600   px-2 py-0.5 rounded-full">💵 Dinero</span>}
                      {f.aceptaEspecies        && <span className="text-xs bg-amber-50  text-amber-600  px-2 py-0.5 rounded-full">📦 Especies</span>}
                      {f.aceptaVoluntarios     && <span className="text-xs bg-green-50  text-green-600  px-2 py-0.5 rounded-full">🤝 Voluntarios</span>}
                      {f.certificadoTributario && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">📜 Cert. DIAN</span>}
                    </div>

                    <Link to={`/fundacion/${f.id}`} className="mt-auto w-full btn-outline text-xs py-2 text-center">
                      Ver perfil →
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

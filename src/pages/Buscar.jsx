import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fundaciones as localData, categoriaMeta } from '../data/fundaciones'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function normalizeF(f, fromDb) {
  if (!fromDb) return f
  return {
    id: f.id, nombre: f.nombre, descripcion: f.descripcion,
    categoria: f.categoria, localidad: f.localidad,
    verificada: f.verificada, foto_url: f.foto_url,
    aceptaDinero: f.acepta_dinero, aceptaEspecies: f.acepta_especies,
    aceptaVoluntarios: f.acepta_voluntarios,
  }
}

// Tolerancia ortográfica básica: distancia de Levenshtein simplificada
function fuzzyMatch(text, query) {
  const t = (text ?? '').toLowerCase()
  const q = query.toLowerCase()
  if (t.includes(q)) return true
  // Permite hasta 1 carácter diferente en fragmentos de ≥4 letras
  if (q.length >= 4) {
    for (let i = 0; i <= t.length - q.length + 1; i++) {
      const chunk = t.slice(i, i + q.length)
      let diff = 0
      for (let j = 0; j < q.length; j++) if (chunk[j] !== q[j]) diff++
      if (diff <= 1) return true
    }
  }
  return false
}

export default function Buscar() {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const [input,       setInput]       = useState(searchParams.get('q') ?? '')
  const [query,       setQuery]       = useState(searchParams.get('q') ?? '')
  const [fundaciones, setFundaciones] = useState([])
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setInput(q)
    setQuery(q)
  }, [searchParams])

  useEffect(() => {
    if (!query.trim()) { setFundaciones([]); return }
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('fundaciones').select('*').order('nombre')
      const source = (error || !data || data.length === 0)
        ? localData
        : data.map(f => normalizeF(f, true))
      const results = source.filter(f =>
        fuzzyMatch(f.nombre, query) ||
        fuzzyMatch(f.descripcion, query) ||
        fuzzyMatch(f.categoria, query) ||
        fuzzyMatch(f.localidad, query)
      )
      setFundaciones(results)
      setLoading(false)
    }
    load()
  }, [query])

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    navigate(`/buscar?q=${encodeURIComponent(input.trim())}`)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Barra de búsqueda */}
        <div className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Busca fundaciones, causas, localidades…"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <button type="submit" className="btn-primary py-3 px-6 shrink-0">Buscar</button>
            </form>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {!query.trim() ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-gray-700 mb-2">¿Qué causa quieres apoyar?</p>
              <p className="text-gray-400 text-sm mb-6">Busca por nombre, categoría o localidad</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(categoriaMeta).map(([id, m]) => (
                  <button key={id} onClick={() => navigate(`/buscar?q=${id}`)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {fundaciones.length === 0
                  ? `Sin resultados para "${query}"`
                  : `${fundaciones.length} resultado${fundaciones.length !== 1 ? 's' : ''} para "${query}"`}
              </p>

              {fundaciones.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">😕</p>
                  <p className="font-semibold text-gray-700 mb-2">No encontramos resultados</p>
                  <p className="text-gray-400 text-sm mb-6">Intenta con otro término o explora por categoría</p>
                  <Link to="/fundaciones" className="btn-primary py-2.5 px-6">Ver todas las fundaciones</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {fundaciones.map(f => {
                    const meta = categoriaMeta[f.categoria] ?? categoriaMeta.educacion
                    return (
                      <div key={f.id} className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 ${meta.bgColor} rounded-xl flex items-center justify-center shrink-0 overflow-hidden`}>
                          {f.foto_url
                            ? <img src={f.foto_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xl">{meta.emoji}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{f.nombre}</h3>
                            {f.verificada && (
                              <svg className="w-4 h-4 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              </svg>
                            )}
                            <span className={`text-xs font-medium ${meta.textColor}`}>{meta.label}</span>
                          </div>
                          {f.localidad && <p className="text-xs text-gray-400 mb-1">📍 {f.localidad}</p>}
                          <p className="text-xs text-gray-500 line-clamp-2">{f.descripcion}</p>
                        </div>
                        <Link to={`/fundacion/${f.id}`} className="btn-outline text-xs py-2 px-4 shrink-0 self-center">
                          Ver →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

import { Link } from 'react-router-dom'
import { categoriaMeta } from '../data/fundaciones'
import { useFundaciones } from '../hooks/useFundaciones'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function getRating(id) {
  const n = typeof id === 'string' ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : id
  return (4.5 + (n % 6) / 10).toFixed(1)
}

function getReviews(id) {
  const n = typeof id === 'string' ? id.charCodeAt(0) : id
  return 80 + (n * 23) % 280
}

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
        <div className="w-20 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
      <div className="h-3 bg-gray-100 rounded mb-1 w-1/2" />
      <div className="h-3 bg-gray-100 rounded mb-1 w-full" />
      <div className="h-3 bg-gray-100 rounded mb-4 w-4/5" />
      <div className="h-8 bg-gray-200 rounded-xl mt-auto" />
    </div>
  )
}

export default function FeaturedFoundations({ activeCategory = 'all' }) {
  const { fundaciones, loading, fromSupabase } = useFundaciones(activeCategory)
  const displayed = fundaciones.slice(0, 5)
  const activeMeta = activeCategory !== 'all' ? categoriaMeta[activeCategory] : null
  const totalCat = fundaciones.length

  return (
    <section id="fundaciones" className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeMeta
                  ? `Fundaciones de ${activeMeta.label} ${activeMeta.emoji}`
                  : 'Fundaciones destacadas'}
              </h2>
              {fromSupabase && (
                <span className="text-xs bg-primary-50 text-primary-600 font-medium px-2 py-0.5 rounded-full">
                  En vivo
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {loading
                ? 'Cargando fundaciones...'
                : activeMeta
                  ? `${totalCat} organizaciones en esta categoría`
                  : 'Organizaciones verificadas con mayor impacto en Bogotá'}
            </p>
          </div>
          <Link to="/fundaciones" className="hidden md:block text-primary-500 text-sm font-medium hover:underline">
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : displayed.length === 0
              ? (
                <div className="col-span-5 text-center py-12 text-gray-400">
                  No hay fundaciones en esta categoría aún.
                </div>
              )
              : displayed.map(f => {
                  const meta = categoriaMeta[f.categoria] ?? categoriaMeta.educacion
                  const rating = parseFloat(getRating(f.id))
                  const reviews = getReviews(typeof f.id === 'number' ? f.id : 1)
                  const yearsActive = new Date().getFullYear() - f.añoFundacion

                  return (
                    <div key={f.id} className="card p-5 flex flex-col hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${meta.bgColor} rounded-2xl flex items-center justify-center text-2xl`}>
                          {meta.emoji}
                        </div>
                        {f.verificada && (
                          <div className="flex items-center gap-1 bg-primary-50 text-primary-600 text-xs font-semibold px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            </svg>
                            Verificada
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{f.nombre}</h3>
                      <span className={`text-xs font-medium mb-2 ${meta.textColor}`}>{meta.label}</span>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">{f.descripcion}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {f.aceptaDinero          && <span className="text-xs bg-blue-50   text-blue-600   px-2 py-0.5 rounded-full">Dinero</span>}
                        {f.aceptaEspecies        && <span className="text-xs bg-amber-50  text-amber-600  px-2 py-0.5 rounded-full">Especies</span>}
                        {f.aceptaVoluntarios     && <span className="text-xs bg-green-50  text-green-600  px-2 py-0.5 rounded-full">Voluntarios</span>}
                        {f.certificadoTributario && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Cert. DIAN</span>}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={rating} />
                        <span className="text-sm font-semibold text-gray-800">{rating}</span>
                        <span className="text-xs text-gray-400">({reviews})</span>
                      </div>

                      <div className="border-t border-gray-100 pt-3 mt-auto grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Localidad</p>
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{f.localidad}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Fundada</p>
                          <p className="text-xs font-semibold text-gray-800">{f.añoFundacion} · {yearsActive}a</p>
                        </div>
                      </div>

                      <Link
                        to={`/fundacion/${f.id}`}
                        className="w-full btn-outline text-xs py-2 px-3 text-center block"
                      >
                        Ver perfil →
                      </Link>
                    </div>
                  )
                })
          }
        </div>
      </div>
    </section>
  )
}

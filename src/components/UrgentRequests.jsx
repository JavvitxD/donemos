import { Link } from 'react-router-dom'
import { categoriaMeta } from '../data/fundaciones'
import { useSolicitudesUrgentes } from '../hooks/useFundaciones'

const donationTypesMeta = {
  money:   { label: 'Dinero',    color: 'bg-blue-100 text-blue-700'    },
  clothes: { label: 'Ropa',      color: 'bg-amber-100 text-amber-700'  },
  food:    { label: 'Alimentos', color: 'bg-orange-100 text-orange-700' },
  books:   { label: 'Libros',    color: 'bg-purple-100 text-purple-700' },
}

function formatCOP(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `$${(n / 1000).toFixed(0)}K`
  return `${n}`
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-2 bg-gray-100 rounded-full" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

export default function UrgentRequests() {
  const { solicitudes, loading, fromSupabase } = useSolicitudesUrgentes()

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 text-sm font-semibold uppercase tracking-wide">Urgente</span>
              {fromSupabase && (
                <span className="text-xs bg-primary-50 text-primary-600 font-medium px-2 py-0.5 rounded-full">
                  En vivo
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Solicitudes que necesitan tu ayuda</h2>
          </div>
          <Link to="/fundaciones" className="hidden md:block text-primary-500 text-sm font-medium hover:underline">
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : solicitudes.map(req => {
                const pct     = Math.min(100, Math.round((req.raised / req.goal) * 100))
                const dtype   = donationTypesMeta[req.donationType] ?? donationTypesMeta.money
                const catMeta = categoriaMeta[req.categoria]        ?? categoriaMeta.ninez

                return (
                  <div key={req.id} className="card flex flex-col group hover:shadow-md transition-shadow duration-200">
                    <div className="relative overflow-hidden h-44 bg-gray-100">
                      <img
                        src={req.image}
                        alt={req.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {catMeta.emoji} {catMeta.label}
                        </span>
                      </div>
                      {req.daysLeft <= 5 && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {req.daysLeft}d left
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs text-gray-500 truncate">{req.foundation}</span>
                        {req.verified && (
                          <svg className="w-3.5 h-3.5 text-primary-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
                        {req.title}
                      </h3>

                      <span className={`self-start text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${dtype.color}`}>
                        {dtype.label}
                      </span>

                      <div className="mt-auto">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span className="font-semibold text-gray-800">{pct}% alcanzado</span>
                          <span>{req.donors} donantes</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                          <span>
                            Recaudado: <strong className="text-gray-800">
                              {req.donationType === 'money' ? formatCOP(req.raised) : req.raised}
                            </strong>
                          </span>
                          <span>
                            Meta: <strong className="text-gray-800">
                              {req.donationType === 'money' ? formatCOP(req.goal) : req.goal}
                            </strong>
                          </span>
                        </div>
                        <Link
                          to={`/fundacion/${req.fundacionId}`}
                          className="w-full btn-primary text-sm py-2.5 text-center block"
                        >
                          Quiero ayudar
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link to="/fundaciones" className="text-primary-500 text-sm font-medium hover:underline">
            Ver todas las solicitudes →
          </Link>
        </div>
      </div>
    </section>
  )
}

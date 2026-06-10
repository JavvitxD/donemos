import { useState } from 'react'

export default function Hero() {
  const [query, setQuery] = useState('')

  return (
    <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">

          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🇨🇴 Plataforma de donaciones en Colombia
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Conectamos corazones<br />
            <span className="text-white/80">con causas que importan</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Encuentra fundaciones verificadas y dona de forma segura. Juntos podemos transformar vidas en Colombia.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-2 flex items-center gap-2 max-w-2xl mx-auto shadow-lg">
            <div className="flex-1 flex items-center gap-3 px-3">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Busca fundaciones, causas o solicitudes..."
                className="flex-1 text-gray-800 placeholder-gray-400 text-sm md:text-base outline-none bg-transparent py-2"
              />
            </div>
            <button className="btn-primary shrink-0 text-sm md:text-base">
              Buscar
            </button>
          </div>

          {/* Quick stats below search */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-sm">
            <span>✓ <strong className="text-white">+1.200</strong> fundaciones verificadas</span>
            <span>✓ <strong className="text-white">+85.000</strong> donantes activos</span>
            <span>✓ <strong className="text-white">$4.2B COP</strong> recaudados</span>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="h-10 bg-gray-50" style={{
        clipPath: 'ellipse(55% 100% at 50% 100%)',
        marginTop: '-2px'
      }} />
    </section>
  )
}

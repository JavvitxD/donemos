const stats = [
  {
    value: '1.247',
    label: 'Fundaciones activas',
    sub: 'en todo Colombia',
    emoji: '🏛️',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    value: '85.420',
    label: 'Donantes registrados',
    sub: 'cambiando vidas',
    emoji: '❤️',
    color: 'bg-red-50 text-red-500',
  },
  {
    value: '4.832',
    label: 'Metas cumplidas',
    sub: 'en los últimos 12 meses',
    emoji: '🎯',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    value: '$4.2B',
    label: 'Pesos recaudados',
    sub: 'COP en donaciones totales',
    emoji: '💰',
    color: 'bg-amber-50 text-amber-600',
  },
]

export default function Stats() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            El impacto de nuestra comunidad
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Juntos estamos construyendo un Colombia más solidario, un corazón a la vez.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4`}>
                {s.emoji}
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">¿Tienes una fundación?</h3>
          <p className="text-white/80 mb-7 max-w-lg mx-auto">
            Únete a Donemos y conecta con miles de donantes comprometidos con el cambio social en Colombia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-white text-primary-600 font-semibold px-7 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Registrar mi fundación
            </button>
            <button className="border-2 border-white/40 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Conocer más
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

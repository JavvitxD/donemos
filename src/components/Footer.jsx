export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21C12 21 4 13.5 4 8.5C4 5.46 6.46 3 9.5 3C11.04 3 12 4 12 4C12 4 12.96 3 14.5 3C17.54 3 20 5.46 20 8.5C20 13.5 12 21 12 21Z" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Done<span className="text-primary-400">mos</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              La plataforma que conecta fundaciones verificadas con donantes comprometidos en Colombia.
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(s => (
                <a key={s} href="#" className="w-8 h-8 bg-gray-800 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Plataforma', links: ['Explorar causas', 'Fundaciones', 'Cómo funciona', 'Seguridad'] },
            { title: 'Para fundaciones', links: ['Registrarse', 'Crear solicitud', 'Panel de control', 'Verificación'] },
            { title: 'Soporte', links: ['Centro de ayuda', 'Contáctanos', 'Política de privacidad', 'Términos de uso'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2025 Donemos. Todos los derechos reservados. Hecho con ❤️ en Colombia.</p>
          <p>NIT: 901.234.567-8 | Superintendencia de Sociedades</p>
        </div>
      </div>
    </footer>
  )
}

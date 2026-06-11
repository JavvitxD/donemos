import { Link } from 'react-router-dom'

const COL_LINKS = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Explorar causas',  to: '/' },
      { label: 'Fundaciones',      to: '/fundaciones' },
      { label: 'Cómo funciona',    to: '/como-funciona' },
      { label: 'Seguridad',        to: '/seguridad' },
    ],
  },
  {
    title: 'Para fundaciones',
    links: [
      { label: 'Registrarse',      to: '/registro' },
      { label: 'Crear solicitud',  to: '/panel' },
      { label: 'Panel de control', to: '/panel' },
      { label: 'Verificación',     to: '/como-funciona' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Contáctanos',             to: '/contacto' },
      { label: 'Preguntas frecuentes',    to: '/como-funciona' },
      { label: 'Política de privacidad',  to: '/politica-de-privacidad' },
      { label: 'Términos de uso',         to: '/terminos-de-uso' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21C12 21 4 13.5 4 8.5C4 5.46 6.46 3 9.5 3C11.04 3 12 4 12 4C12 4 12.96 3 14.5 3C17.54 3 20 5.46 20 8.5C20 13.5 12 21 12 21Z" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Done<span className="text-primary-400">mos</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              La plataforma que conecta fundaciones verificadas con donantes comprometidos en Colombia.
            </p>
            <div className="flex gap-3">
              {['F', 'T', 'I', 'L'].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">{s}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COL_LINKS.map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Donemos. Todos los derechos reservados. Hecho con ❤️ en Colombia.</p>
          <div className="flex gap-4">
            <Link to="/politica-de-privacidad" className="hover:text-gray-400 transition-colors">Privacidad</Link>
            <Link to="/terminos-de-uso"        className="hover:text-gray-400 transition-colors">Términos</Link>
            <Link to="/contacto"               className="hover:text-gray-400 transition-colors">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

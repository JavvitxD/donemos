import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Seguridad() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">

        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Seguridad y confianza</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Cómo Donemos protege a donantes, fundaciones y sus datos personales
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">

          {/* Tarjetas de seguridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: '🔐', title: 'Autenticación segura', desc: 'Usamos Supabase Auth con cifrado de contraseñas mediante bcrypt. Las sesiones están protegidas con tokens JWT de corta duración y se invalidan automáticamente al cerrar sesión.' },
              { icon: '🛡️', title: 'Control de acceso (RLS)', desc: 'Implementamos Row Level Security en todas las tablas de la base de datos. Cada usuario solo puede leer y modificar sus propios datos.' },
              { icon: '🔒', title: 'Cifrado en tránsito', desc: 'Toda la comunicación entre tu navegador y nuestros servidores usa HTTPS/TLS 1.3. Los datos nunca viajan en texto plano.' },
              { icon: '📋', title: 'Ley 1581 de 2012', desc: 'Tratamos tus datos personales según la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 de Colombia. Tienes derecho de conocer, actualizar, rectificar y suprimir tus datos.' },
              { icon: '✅', title: 'Fundaciones verificadas', desc: 'Antes de publicar una fundación revisamos su NIT, certificado de existencia y representación legal ante la Cámara de Comercio o entidad competente.' },
              { icon: '📊', title: 'Transparencia de datos', desc: 'Las metas y el progreso de cada solicitud son visibles públicamente. No alteramos ni ocultamos cifras de donaciones.' },
            ].map((item, i) => (
              <div key={i} className="card p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Ley 1581 detalle */}
          <div className="card p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Protección de datos — Ley 1581 de 2012</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              En cumplimiento de la Ley 1581 de 2012 "Por la cual se dictan disposiciones generales para la protección de datos personales" y del Decreto 1377 de 2013, Donemos informa que:
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              {[
                'Los datos personales recopilados (nombre, correo electrónico, rol) son utilizados exclusivamente para el funcionamiento de la plataforma.',
                'No vendemos, arrendamos ni compartimos datos personales con terceros sin consentimiento previo y expreso del titular.',
                'Los datos se almacenan en servidores con cifrado en reposo (AES-256) gestionados por Supabase en infraestructura de AWS.',
                'Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos en cualquier momento desde tu perfil o escribiéndonos a privacidad@donemos.org.',
                'El responsable del tratamiento es Donemos Colombia S.A.S., NIT 901.234.567-8.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-primary-500 font-bold shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/politica-de-privacidad" className="btn-outline text-sm py-2 px-5">
                Ver política de privacidad completa →
              </Link>
            </div>
          </div>

          {/* Donaciones */}
          <div className="card p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">¿Cómo se protegen las donaciones?</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Donemos es una plataforma de directorio y contacto. Las donaciones monetarias se realizan directamente a las fundaciones a través de sus propios medios de pago (PSE, transferencia bancaria, PayU, etc.). Recomendamos:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                'Siempre donar a través de los canales oficiales indicados en el perfil de cada fundación.',
                'Verificar que el número de cuenta bancaria coincida con el NIT de la organización.',
                'Solicitar un comprobante o recibo de donación.',
                'Reportar cualquier actividad sospechosa a soporte@donemos.org.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-primary-500 font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">¿Tienes preguntas sobre seguridad?</p>
            <Link to="/contacto" className="btn-primary py-2.5 px-7">Contáctanos</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

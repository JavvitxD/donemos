import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PASOS = [
  {
    n: '01',
    icon: '🔍',
    title: 'Encuentra una fundación',
    desc: 'Explora nuestro directorio de organizaciones verificadas por categoría — niñez, educación, animales, adultos mayores, medio ambiente, salud o discapacidad. Usa el buscador para encontrar fundaciones cercanas a ti o a las causas que más te importan.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    n: '02',
    icon: '💚',
    title: 'Elige cómo ayudar',
    desc: 'Cada fundación acepta distintos tipos de ayuda: dinero, ropa y alimentos, libros, voluntariado o una combinación. Revisa sus solicitudes activas, mira cuánto falta para cumplir cada meta y decide cómo quieres contribuir.',
    color: 'bg-green-50 text-green-600',
  },
  {
    n: '03',
    icon: '🌟',
    title: 'Tu donación genera impacto',
    desc: 'El 100% de tu donación llega directamente a la fundación. Puedes solicitar un certificado tributario deducible de renta si la organización está habilitada por la DIAN. Seguimos el progreso de las metas en tiempo real para que veas el impacto de tu aporte.',
    color: 'bg-blue-50 text-blue-600',
  },
]

const FAQS = [
  {
    q: '¿Cómo sé que una fundación es legítima?',
    a: 'Verificamos cada fundación antes de publicarla en la plataforma. Las fundaciones con el sello ✅ Verificada han presentado su NIT, certificado de existencia y representación legal. Adicionalmente, las organizaciones habilitadas por la DIAN están marcadas con "Certif. tributario".',
  },
  {
    q: '¿Cómo se realizan las donaciones?',
    a: 'El proceso de donación se realiza directamente con la fundación a través de sus canales oficiales (PSE, transferencia bancaria, efectivo, PayU, etc.) según cada organización. Donemos facilita el contacto y la visibilidad, pero no procesa pagos directamente.',
  },
  {
    q: '¿Puedo deducir mi donación de la renta?',
    a: 'Sí, si la fundación está habilitada por la DIAN (marcada con "Cert. tributario") puedes solicitar un certificado de donación y deducir hasta el 25% del valor donado en tu declaración de renta según el artículo 125 del Estatuto Tributario.',
  },
  {
    q: '¿Qué costo tiene usar Donemos?',
    a: 'Donemos es completamente gratuito tanto para donantes como para fundaciones que quieran publicar su perfil. Nuestra misión es maximizar el impacto de cada donación.',
  },
  {
    q: '¿Cómo registro mi fundación?',
    a: 'Ve a la sección de registro, selecciona "Soy fundación" y completa el formulario. Nuestro equipo revisará tu solicitud y te contactará en un plazo de 3 a 5 días hábiles para verificar la documentación.',
  },
  {
    q: '¿Mis datos personales están protegidos?',
    a: 'Sí. Tratamos tus datos según la Ley 1581 de 2012 de Protección de Datos Personales de Colombia. Nunca compartimos tu información con terceros sin tu consentimiento. Puedes consultar nuestra política de privacidad para más detalles.',
  },
]

export default function ComoFunciona() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">¿Cómo funciona Donemos?</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Conectamos donantes con fundaciones verificadas en Colombia de forma simple, transparente y segura.
            </p>
          </div>
        </div>

        {/* Pasos */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Tres pasos para generar impacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PASOS.map((p, i) => (
              <div key={i} className="relative">
                {i < PASOS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" style={{ width: 'calc(100% - 2.5rem)', left: '100%' }} />
                )}
                <div className="card p-7 text-center relative z-10">
                  <div className={`w-16 h-16 ${p.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5`}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">{p.n}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 mb-3">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/fundaciones" className="btn-primary py-3 px-8">
              Ver fundaciones →
            </Link>
            <Link to="/registro" className="btn-outline py-3 px-8">
              Registrar mi fundación
            </Link>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Lo que nos hace confiables</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: '✅', title: 'Fundaciones verificadas', desc: 'Revisamos documentación legal antes de publicar cada organización.' },
                { icon: '🔒', title: 'Datos protegidos', desc: 'Cumplimos la Ley 1581 de 2012 de protección de datos personales.' },
                { icon: '📜', title: 'Certificados DIAN', desc: 'Identifica fácilmente qué fundaciones emiten certificados tributarios.' },
                { icon: '📊', title: 'Transparencia total', desc: 'Progreso de metas en tiempo real para cada solicitud.' },
              ].map((item, i) => (
                <div key={i} className="card p-5 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
          <div className="text-center mt-10">
            <p className="text-gray-500 text-sm mb-3">¿Tienes otra pregunta?</p>
            <Link to="/contacto" className="btn-primary py-2.5 px-7">Contáctanos</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left gap-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Contacto() {
  const [form,   setForm]   = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [sent,   setSent]   = useState(false)
  const [sending,setSending]= useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    // Simulamos envío — en producción conectar con un servicio de email (Resend, SendGrid, etc.)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setSending(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">

        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Contáctanos</h1>
            <p className="text-white/80 text-lg">Estamos aquí para ayudarte</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Info lateral */}
            <div className="space-y-5">
              {[
                { icon: '✉️', title: 'Correo', value: 'hola@donemos.org', href: 'mailto:hola@donemos.org' },
                { icon: '💬', title: 'WhatsApp', value: '+57 310 000 0000', href: 'https://wa.me/573100000000' },
                { icon: '📍', title: 'Ciudad', value: 'Bogotá D.C., Colombia', href: null },
                { icon: '🕐', title: 'Horario', value: 'Lun–Vie 8am–6pm', href: null },
              ].map((item, i) => (
                <div key={i} className="card p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.title}</p>
                    {item.href
                      ? <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-600 hover:underline">{item.value}</a>
                      : <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                    }
                  </div>
                </div>
              ))}

              <div className="card p-5 bg-primary-50">
                <p className="text-sm font-semibold text-primary-700 mb-1">¿Eres fundación?</p>
                <p className="text-xs text-primary-600 mb-3">Regístrate en la plataforma y llega a miles de donantes.</p>
                <Link to="/registro" className="btn-primary text-xs py-2 px-4 inline-block">Registrar fundación</Link>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="card p-10 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h2>
                  <p className="text-gray-500 text-sm mb-6">Te responderemos en un plazo de 24–48 horas hábiles.</p>
                  <button onClick={() => { setSent(false); setForm({ nombre:'', email:'', asunto:'', mensaje:'' }) }}
                    className="btn-outline py-2 px-6 text-sm">Enviar otro mensaje</button>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Envíanos un mensaje</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nombre completo" value={form.nombre} onChange={v => set('nombre', v)} required placeholder="Tu nombre" />
                      <Field label="Correo electrónico" type="email" value={form.email} onChange={v => set('email', v)} required placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Asunto</label>
                      <select value={form.asunto} onChange={e => set('asunto', e.target.value)} required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                        <option value="">Selecciona un asunto</option>
                        <option>Quiero registrar mi fundación</option>
                        <option>Tengo una pregunta sobre donaciones</option>
                        <option>Reportar un problema técnico</option>
                        <option>Solicitar verificación</option>
                        <option>Alianzas o patrocinios</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje</label>
                      <textarea rows={5} value={form.mensaje} onChange={e => set('mensaje', e.target.value)} required
                        placeholder="Cuéntanos en qué podemos ayudarte…"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Al enviar este formulario aceptas nuestra{' '}
                      <Link to="/politica-de-privacidad" className="text-primary-500 hover:underline">política de privacidad</Link>.
                    </p>
                    <button type="submit" disabled={sending} className="btn-primary py-2.5 px-8 flex items-center gap-2">
                      {sending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {sending ? 'Enviando…' : 'Enviar mensaje'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function Field({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
    </div>
  )
}

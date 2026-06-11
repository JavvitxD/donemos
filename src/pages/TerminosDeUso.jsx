import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FECHA = '1 de junio de 2025'

export default function TerminosDeUso() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-2">Términos y condiciones de uso</h1>
            <p className="text-white/80">Última actualización: {FECHA}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card p-8 md:p-12 space-y-8 text-gray-700">

            <Section title="1. Aceptación de los términos">
              <p className="text-sm leading-relaxed">
                Al acceder y usar Donemos (donemos.org), aceptas quedar vinculado a estos términos y condiciones. Si no estás de acuerdo, te pedimos no usar la plataforma. Donemos Colombia S.A.S. se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios con al menos 10 días hábiles de anticipación.
              </p>
            </Section>

            <Section title="2. Descripción del servicio">
              <p className="text-sm leading-relaxed">
                Donemos es una plataforma digital que conecta fundaciones sin ánimo de lucro con donantes en Colombia. El servicio incluye: directorio de fundaciones verificadas, publicación de solicitudes de donación, seguimiento de metas y herramientas de comunicación entre partes. Donemos no procesa pagos directamente ni actúa como intermediario financiero.
              </p>
            </Section>

            <Section title="3. Registro y cuentas de usuario">
              <ul className="text-sm leading-relaxed space-y-2">
                <li>• Debes tener al menos 18 años para registrarte.</li>
                <li>• La información proporcionada en el registro debe ser veraz, completa y actualizada.</li>
                <li>• Eres responsable de mantener la confidencialidad de tu contraseña.</li>
                <li>• Una cuenta por persona o entidad. Está prohibida la creación de cuentas con datos falsos.</li>
                <li>• Donemos puede suspender o eliminar cuentas que incumplan estos términos.</li>
              </ul>
            </Section>

            <Section title="4. Fundaciones — obligaciones y verificación">
              <ul className="text-sm leading-relaxed space-y-2">
                <li>• Las fundaciones deben presentar documentación legal válida para ser verificadas.</li>
                <li>• Las solicitudes de donación deben corresponder a necesidades reales y actuales.</li>
                <li>• Está prohibido crear solicitudes fraudulentas o engañosas.</li>
                <li>• Las fundaciones son responsables del uso final de las donaciones recibidas.</li>
                <li>• Donemos puede retirar la verificación o eliminar el perfil ante irregularidades.</li>
              </ul>
            </Section>

            <Section title="5. Donantes — responsabilidades">
              <ul className="text-sm leading-relaxed space-y-2">
                <li>• Las donaciones se realizan directamente entre el donante y la fundación. Donemos no interviene en este proceso.</li>
                <li>• Recomendamos verificar los datos bancarios directamente con la fundación antes de realizar cualquier transferencia.</li>
                <li>• Donemos no es responsable de donaciones realizadas a cuentas fraudulentas ajenas a la plataforma.</li>
              </ul>
            </Section>

            <Section title="6. Contenido prohibido">
              <p className="text-sm leading-relaxed mb-2">Está estrictamente prohibido:</p>
              <ul className="text-sm leading-relaxed space-y-2">
                <li>• Publicar contenido falso, engañoso o fraudulento.</li>
                <li>• Usar la plataforma para actividades ilegales, incluyendo lavado de activos.</li>
                <li>• Suplantar la identidad de otras personas u organizaciones.</li>
                <li>• Intentar acceder a cuentas o datos de terceros sin autorización.</li>
                <li>• Enviar comunicaciones no solicitadas (spam) a otros usuarios.</li>
              </ul>
            </Section>

            <Section title="7. Propiedad intelectual">
              <p className="text-sm leading-relaxed">
                El nombre Donemos, el logotipo, el diseño de la plataforma y los contenidos originales son propiedad de Donemos Colombia S.A.S. El contenido publicado por fundaciones (fotos, textos, logos) es responsabilidad de cada organización. Al subir contenido a la plataforma, otorgas a Donemos una licencia no exclusiva para mostrarlo en el servicio.
              </p>
            </Section>

            <Section title="8. Limitación de responsabilidad">
              <p className="text-sm leading-relaxed">
                Donemos actúa como intermediario de información y no garantiza ni avala el comportamiento de donantes o fundaciones. En ningún caso seremos responsables por daños directos, indirectos o incidentales derivados del uso de la plataforma o de donaciones realizadas fuera de ella.
              </p>
            </Section>

            <Section title="9. Ley aplicable y jurisdicción">
              <p className="text-sm leading-relaxed">
                Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se resolverá ante los jueces competentes de la ciudad de Bogotá D.C., Colombia.
              </p>
            </Section>

            <Section title="10. Contacto">
              <p className="text-sm leading-relaxed">
                Para preguntas sobre estos términos, escríbenos a <strong>legal@donemos.org</strong> o usa nuestro{' '}
                <Link to="/contacto" className="text-primary-600 hover:underline">formulario de contacto</Link>.
              </p>
            </Section>

          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  )
}

import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FECHA = '1 de junio de 2025'

export default function PoliticaPrivacidad() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-2">Política de tratamiento de datos personales</h1>
            <p className="text-white/80">Última actualización: {FECHA}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card p-8 md:p-12 prose prose-sm max-w-none text-gray-700 space-y-8">

            <Section title="1. Identificación del responsable del tratamiento">
              <p>
                <strong>Donemos Colombia S.A.S.</strong>, identificada con NIT 901.234.567-8, domiciliada en Bogotá D.C., Colombia, en su calidad de responsable del tratamiento de datos personales, informa que la recolección, almacenamiento, uso, circulación y supresión de datos personales se rige por la <strong>Ley 1581 de 2012</strong>, el <strong>Decreto 1377 de 2013</strong> y demás normas que los modifiquen o complementen.
              </p>
            </Section>

            <Section title="2. Marco legal">
              <p>Esta política se fundamenta en:</p>
              <ul>
                <li>Ley 1581 de 2012 — Protección de Datos Personales</li>
                <li>Decreto 1377 de 2013 — Reglamentación parcial de la Ley 1581</li>
                <li>Decreto 1074 de 2015 — Decreto Único Reglamentario del Sector Comercio</li>
                <li>Circular Externa 002 de 2015 de la Superintendencia de Industria y Comercio</li>
              </ul>
            </Section>

            <Section title="3. Datos personales recopilados">
              <p>Donemos recopila los siguientes datos personales:</p>
              <ul>
                <li><strong>Datos de registro:</strong> nombre completo, dirección de correo electrónico, rol en la plataforma (donante o fundación).</li>
                <li><strong>Datos de fundaciones:</strong> nombre de la organización, NIT, dirección, teléfono, correo electrónico institucional, sitio web, fotografía o logo.</li>
                <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas (con fines estadísticos).</li>
              </ul>
              <p>No recopilamos datos sensibles como origen racial, orientación sexual, datos de salud o información financiera personal.</p>
            </Section>

            <Section title="4. Finalidades del tratamiento">
              <p>Los datos personales son tratados para:</p>
              <ul>
                <li>Crear y gestionar la cuenta del usuario en la plataforma.</li>
                <li>Conectar donantes con fundaciones verificadas.</li>
                <li>Enviar comunicaciones relacionadas con el servicio (confirmaciones, notificaciones de seguridad).</li>
                <li>Mejorar la experiencia del usuario y las funcionalidades de la plataforma.</li>
                <li>Cumplir con obligaciones legales y reglamentarias.</li>
              </ul>
            </Section>

            <Section title="5. Derechos del titular">
              <p>Como titular de datos personales tienes derecho a:</p>
              <ul>
                <li><strong>Conocer</strong> los datos personales que tenemos sobre ti.</li>
                <li><strong>Actualizar y rectificar</strong> datos incompletos o inexactos.</li>
                <li><strong>Suprimir</strong> tus datos cuando no sean necesarios para la finalidad del tratamiento.</li>
                <li><strong>Revocar la autorización</strong> otorgada para el tratamiento de datos.</li>
                <li><strong>Acceder gratuitamente</strong> a tus datos personales al menos una vez al mes.</li>
                <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio.</li>
              </ul>
              <p>Para ejercer estos derechos, escribe a: <strong>privacidad@donemos.org</strong></p>
            </Section>

            <Section title="6. Autorización del titular">
              <p>
                Al registrarse en Donemos, el usuario otorga autorización libre, previa, expresa e informada para el tratamiento de sus datos personales conforme a esta política. Esta autorización puede ser revocada en cualquier momento sin efectos retroactivos.
              </p>
            </Section>

            <Section title="7. Seguridad de los datos">
              <p>
                Adoptamos medidas técnicas, humanas y administrativas para proteger los datos personales, incluyendo cifrado en tránsito (HTTPS/TLS), cifrado en reposo (AES-256), control de acceso basado en roles (Row Level Security) y autenticación segura mediante tokens JWT.
              </p>
            </Section>

            <Section title="8. Transferencia de datos">
              <p>
                No transferimos datos personales a terceros con fines comerciales. Los datos son procesados por Supabase Inc. (proveedor de infraestructura en la nube) bajo acuerdo de procesamiento de datos que garantiza niveles de protección equivalentes a los exigidos por la ley colombiana.
              </p>
            </Section>

            <Section title="9. Vigencia">
              <p>Esta política rige a partir del {FECHA}. Nos reservamos el derecho de modificarla. Cualquier cambio será comunicado con al menos 10 días hábiles de anticipación a través de la plataforma.</p>
            </Section>

            <Section title="10. Contacto">
              <p>Para consultas sobre esta política, escríbenos a <strong>privacidad@donemos.org</strong> o usa nuestro <Link to="/contacto" className="text-primary-600 hover:underline">formulario de contacto</Link>.</p>
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
      <div className="space-y-3">{children}</div>
    </div>
  )
}

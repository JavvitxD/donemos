export default function Ley1581Modal({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Política de Tratamiento de Datos Personales</h2>
            <p className="text-sm text-gray-500 mt-0.5">Ley 1581 de 2012 — Decreto 1377 de 2013</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 text-sm text-gray-700 space-y-4 leading-relaxed">
          <p className="font-semibold text-gray-900">1. Responsable del tratamiento</p>
          <p>
            <strong>Donemos SAS</strong>, identificada con NIT en trámite, con domicilio en la ciudad de Bogotá D.C.,
            Colombia, es la responsable del tratamiento de los datos personales recolectados a través de esta plataforma.
            Contacto: <span className="text-primary-600">privacidad@donemos.co</span>
          </p>

          <p className="font-semibold text-gray-900">2. Finalidad del tratamiento</p>
          <p>Los datos personales recolectados serán utilizados para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestionar el registro y autenticación de usuarios en la plataforma.</li>
            <li>Facilitar la conexión entre donantes y fundaciones benéficas.</li>
            <li>Procesar y registrar donaciones realizadas a través de Donemos.</li>
            <li>Enviar comunicaciones relacionadas con el servicio (confirmaciones, actualizaciones de solicitudes).</li>
            <li>Elaborar estadísticas e informes de impacto social de carácter anónimo.</li>
            <li>Cumplir con obligaciones legales y requerimientos de autoridades competentes.</li>
          </ul>

          <p className="font-semibold text-gray-900">3. Datos personales tratados</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Donantes:</strong> nombre completo, correo electrónico, historial de donaciones.</li>
            <li><strong>Fundaciones:</strong> nombre legal, NIT, representante legal, correo institucional, descripción, categoría de acción.</li>
          </ul>

          <p className="font-semibold text-gray-900">4. Derechos del titular</p>
          <p>De conformidad con la Ley 1581 de 2012, el titular de los datos personales tiene derecho a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Conocer</strong> los datos personales que Donemos tiene sobre usted.</li>
            <li><strong>Actualizar y rectificar</strong> sus datos cuando sean inexactos, incompletos o fraccionados.</li>
            <li><strong>Solicitar prueba</strong> de la autorización otorgada para el tratamiento.</li>
            <li><strong>Ser informado</strong> sobre el uso que se ha dado a sus datos personales.</li>
            <li><strong>Revocar la autorización</strong> y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.</li>
            <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
          </ul>

          <p className="font-semibold text-gray-900">5. Transferencia y transmisión de datos</p>
          <p>
            Donemos no venderá, alquilará ni cederá sus datos personales a terceros con fines comerciales.
            Los datos podrán ser compartidos con aliados tecnológicos que prestan servicios de infraestructura
            (como Supabase Inc., con sede en los Estados Unidos), quienes están obligados contractualmente a
            guardar confidencialidad y a tratar los datos únicamente para los fines autorizados.
          </p>

          <p className="font-semibold text-gray-900">6. Seguridad de la información</p>
          <p>
            Donemos implementa medidas técnicas, humanas y administrativas que son necesarias para otorgar
            seguridad a los registros evitando su adulteración, pérdida, consulta, uso o acceso no autorizado
            o fraudulento. Las contraseñas son almacenadas con cifrado bcrypt y nunca en texto plano.
          </p>

          <p className="font-semibold text-gray-900">7. Vigencia</p>
          <p>
            Esta política entra en vigor a partir del 1 de enero de 2025. Los datos personales serán conservados
            durante el tiempo que sea necesario para cumplir con las finalidades descritas y las obligaciones
            legales aplicables.
          </p>

          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Última actualización: enero de 2025 · Versión 1.0
          </p>
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-outline py-2.5"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            className="flex-1 btn-primary py-2.5"
          >
            Acepto la política de datos
          </button>
        </div>
      </div>
    </div>
  )
}

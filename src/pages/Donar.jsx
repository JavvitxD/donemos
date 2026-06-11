import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import jsPDF from 'jspdf'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ConfettiCanvas() {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 5,
      color: ['#1D9E75','#34d399','#fbbf24','#f87171','#60a5fa','#a78bfa'][Math.floor(Math.random() * 6)],
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      vr: (Math.random() - 0.5) * 0.15,
    }))
    let frame
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h)
        ctx.restore()
      })
      frame = requestAnimationFrame(tick)
    }
    tick()
    const t = setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height) }, 4000)
    return () => { cancelAnimationFrame(frame); clearTimeout(t) }
  }, [])
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-50" />
}

// ─── Número en letras ─────────────────────────────────────────────────────────
const UNIDADES = ['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
  'diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve']
const DECENAS  = ['','diez','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa']
function numLetras(n) {
  if (n === 0) return 'cero'
  if (n < 20)  return UNIDADES[n]
  if (n < 100) return DECENAS[Math.floor(n/10)] + (n%10 ? ' y '+UNIDADES[n%10] : '')
  if (n < 1000) return (n===100?'cien':UNIDADES[Math.floor(n/100)]+'cientos') + (n%100?' '+numLetras(n%100):'')
  if (n < 1000000) return (Math.floor(n/1000)===1?'mil':numLetras(Math.floor(n/1000))+' mil') + (n%1000?' '+numLetras(n%1000):'')
  return n.toLocaleString('es-CO')
}

async function descargarCertificado(donacion, usuario, fundacion) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, m = 20
  doc.setFillColor(29, 158, 117)
  doc.rect(0, 0, W, 45, 'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(22)
  doc.text('Donemos', m, 22)
  doc.setFontSize(9); doc.setFont('helvetica','normal')
  doc.text('donemos.org  |  Colombia', m, 30)
  doc.setFontSize(12); doc.setFont('helvetica','bold')
  doc.text('CERTIFICADO DE DONACIÓN', W/2, 40, { align: 'center' })
  doc.setTextColor(30,30,30)
  let y = 60
  doc.setFontSize(10); doc.setFont('helvetica','normal')
  doc.text(`La Fundación ${fundacion.nombre}, con NIT ${fundacion.nit ?? '—'}, certifica que:`, m, y, { maxWidth: W-m*2 }); y+=14
  doc.setFont('helvetica','bold'); doc.text('Datos del donante', m, y); y+=7
  doc.setFont('helvetica','normal')
  doc.text(`Nombre:  ${usuario?.nombre ?? '—'}`, m+4, y); y+=6
  doc.text(`Correo:  ${usuario?.email ?? '—'}`, m+4, y); y+=6; y+=4
  doc.setFont('helvetica','bold'); doc.text('Datos de la organización', m, y); y+=7
  doc.setFont('helvetica','normal')
  doc.text(`Nombre:    ${fundacion.nombre}`, m+4, y); y+=6
  doc.text(`NIT:       ${fundacion.nit ?? 'No registrado'}`, m+4, y); y+=6
  doc.text(`Dirección: ${fundacion.direccion ?? 'Colombia'}`, m+4, y); y+=6; y+=4
  doc.setFont('helvetica','bold'); doc.text('Detalle de la donación', m, y); y+=7
  doc.setFont('helvetica','normal')
  const monto = Number(donacion.monto ?? 0)
  doc.text(`Valor en números: $${monto.toLocaleString('es-CO')} COP`, m+4, y); y+=6
  doc.text(`Valor en letras:  ${numLetras(monto)} pesos colombianos`, m+4, y, { maxWidth: W-m*2-4 }); y+=9
  doc.text(`Fecha: ${new Date(donacion.created_at ?? Date.now()).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })}`, m+4, y); y+=10
  doc.setFillColor(240,252,248); doc.roundedRect(m, y, W-m*2, 28, 3, 3, 'F')
  doc.setFont('helvetica','bolditalic'); doc.setFontSize(8.5); doc.setTextColor(15,100,75)
  doc.text([
    'Base legal: Artículo 125 del Estatuto Tributario colombiano.',
    'Esta donación puede ser deducible hasta el 25% del valor donado. Conserve',
    'este certificado junto a su declaración de renta. Validez: año gravable.',
  ], m+4, y+7, { maxWidth: W-m*2-8 }); y+=36
  doc.setTextColor(30,30,30); doc.setFont('helvetica','normal'); doc.setFontSize(10)
  doc.line(m, y+20, m+60, y+20); doc.setFontSize(9)
  doc.text('Firma Representante Legal', m, y+26); doc.text(fundacion.nombre, m, y+32)
  doc.setFontSize(7); doc.setTextColor(150)
  doc.text(`Generado por Donemos Colombia | donemos.org | ${new Date().toLocaleDateString('es-CO')}`, W/2, 285, { align:'center' })
  doc.save(`certificado-donemos-${Date.now()}.pdf`)
}

// ─── Métodos de donación disponibles ─────────────────────────────────────────
function buildMetodos(f) {
  const metodos = []
  if (f.acepta_dinero) {
    if (f.wompi_link)             metodos.push({ id: 'wompi',        icon: '💳', label: 'Wompi (tarjeta / PSE)',   desc: 'Pago seguro en línea' })
    if (f.nequi_numero)           metodos.push({ id: 'nequi',        icon: '📱', label: 'Nequi',                  desc: `Número: ${f.nequi_numero}` })
    if (f.daviplata_numero)       metodos.push({ id: 'daviplata',    icon: '📱', label: 'Daviplata',              desc: `Número: ${f.daviplata_numero}` })
    if (f.banco_nombre)           metodos.push({ id: 'transferencia',icon: '🏦', label: 'Transferencia bancaria',  desc: f.banco_nombre })
  }
  if (f.acepta_especies)          metodos.push({ id: 'especie',      icon: '📦', label: 'Donación en especie',    desc: 'Ropa, alimentos, útiles…' })
  if (f.acepta_voluntarios)       metodos.push({ id: 'voluntariado', icon: '🤝', label: 'Voluntariado',           desc: 'Ofrece tu tiempo y habilidades' })
  return metodos
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Donar() {
  const { fundacionId } = useParams()
  const { usuario, session } = useAuth()
  const navigate = useNavigate()

  const [fundacion,   setFundacion]  = useState(null)
  const [solicitudes, setSolicitudes]= useState([])
  const [loading,     setLoading]    = useState(true)
  const [step,        setStep]       = useState(1) // 1 | 2 | 3
  const [metodo,      setMetodo]     = useState(null)
  const [donacionId,  setDonacionId] = useState(null)
  const [solicitudId, setSolicitudId]= useState('')

  useEffect(() => {
    async function load() {
      const { data: f } = await supabase.from('fundaciones').select('*').eq('id', fundacionId).maybeSingle()
      if (!f) { navigate('/fundaciones'); return }
      setFundacion(f)
      const { data: s } = await supabase.from('solicitudes').select('id,titulo,tipo')
        .eq('fundacion_id', fundacionId).eq('activa', true).order('created_at', { ascending: false })
      setSolicitudes(s ?? [])
      setLoading(false)
    }
    load()
  }, [fundacionId, navigate])

  if (loading) return <><Navbar /><Spinner /><Footer /></>
  if (!fundacion) return null

  const metodos = buildMetodos(fundacion)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to={`/fundacion/${fundacionId}`} className="hover:text-primary-500 transition-colors">
              {fundacion.nombre}
            </Link>
            <span>/</span>
            <span className="text-gray-600">Donar</span>
          </div>

          {/* Pasos indicadores */}
          {step < 3 && (
            <div className="flex items-center gap-3 mb-8">
              {[1,2].map(n => (
                <div key={n} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                    ${step >= n ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {n}
                  </div>
                  <span className={`text-sm ${step >= n ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {n === 1 ? 'Método' : 'Completar'}
                  </span>
                  {n < 2 && <div className={`h-px w-8 ${step > n ? 'bg-primary-400' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Fundación header */}
          {step < 3 && (
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-50 overflow-hidden flex items-center justify-center shrink-0">
                {fundacion.foto_url
                  ? <img src={fundacion.foto_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl">🏛️</span>
                }
              </div>
              <div>
                <p className="font-semibold text-gray-900">{fundacion.nombre}</p>
                <p className="text-xs text-gray-400">{fundacion.localidad ?? 'Colombia'}</p>
              </div>
            </div>
          )}

          {/* Selector de solicitud */}
          {step === 1 && solicitudes.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Para qué solicitud deseas donar? <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <select value={solicitudId} onChange={e => setSolicitudId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="">Donación libre (sin solicitud específica)</option>
                {solicitudes.map(s => <option key={s.id} value={s.id}>{s.titulo}</option>)}
              </select>
            </div>
          )}

          {step === 1 && (
            <PasoMetodo
              metodos={metodos}
              metodoSeleccionado={metodo}
              onSelect={m => { setMetodo(m); setStep(2) }}
              fundacion={fundacion}
            />
          )}

          {step === 2 && metodo && (
            <PasoCompletar
              metodo={metodo}
              fundacion={fundacion}
              usuario={usuario}
              solicitudId={solicitudId}
              onVolver={() => setStep(1)}
              onDonado={(id) => { setDonacionId(id); setStep(3) }}
            />
          )}

          {step === 3 && (
            <PasoConfirmacion
              fundacion={fundacion}
              usuario={usuario}
              metodo={metodo}
              donacionId={donacionId}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

// ─── Paso 1: Elegir método ────────────────────────────────────────────────────
function PasoMetodo({ metodos, onSelect, fundacion }) {
  if (metodos.length === 0) return (
    <div className="card p-10 text-center">
      <p className="text-4xl mb-4">⚙️</p>
      <p className="font-semibold text-gray-700 mb-1">Esta fundación aún no tiene métodos de donación configurados</p>
      <p className="text-gray-400 text-sm">El administrador de la fundación debe configurar sus métodos de pago</p>
    </div>
  )

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo quieres ayudar?</h2>
      <div className="space-y-3">
        {metodos.map(m => (
          <button key={m.id} onClick={() => onSelect(m)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary-400 hover:shadow-sm transition-all text-left group">
            <span className="text-3xl shrink-0">{m.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
            </div>
            <span className="text-gray-300 group-hover:text-primary-400 text-xl transition-colors">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Paso 2: Completar según método ──────────────────────────────────────────
function PasoCompletar({ metodo, fundacion, usuario, solicitudId, onVolver, onDonado }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const comprobanteRef = useRef()
  const [comprobante,    setComprobante]    = useState(null)
  const [comprobanteUrl, setComprobanteUrl] = useState('')

  // Formularios específicos por método
  const [monto,          setMonto]          = useState('')
  const [descripcion,    setDescripcion]    = useState('')
  const [cantidad,       setCantidad]       = useState('')
  const [fechaEntrega,   setFechaEntrega]   = useState('')
  const [direccionEntreg,setDireccionEntreg]= useState('')
  const [habilidades,    setHabilidades]    = useState('')
  const [disponibilidad, setDisponibilidad] = useState('')
  const [mensaje,        setMensaje]        = useState('')

  async function handleComprobante(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobante(file)
    setComprobanteUrl(URL.createObjectURL(file))
  }

  async function subirComprobante(donacionId) {
    if (!comprobante) return null
    const ext  = comprobante.name.split('.').pop()
    const path = `comprobantes/${donacionId}.${ext}`
    const { error } = await supabase.storage.from('fotos-perfil').upload(path, comprobante, { upsert: true })
    if (error) return null
    return supabase.storage.from('fotos-perfil').getPublicUrl(path).data.publicUrl
  }

  async function registrar(extras = {}) {
    setSaving(true); setError('')
    const tipo = ['especie','voluntariado'].includes(metodo.id) ? metodo.id : 'money'

    const payload = {
      fundacion_id: fundacion.id,
      usuario_id:   usuario?.id  ?? null,
      solicitud_id: solicitudId  || null,
      tipo,
      monto:        tipo === 'money' ? (parseFloat(monto) || null) : null,
      descripcion:  descripcion || extras.descripcion || null,
      metodo_pago:  metodo.id,
      estado:       'pendiente',
      ...extras,
    }

    const { data: don, error: err } = await supabase.from('donaciones').insert(payload).select().single()
    if (err) { setError(err.message); setSaving(false); return }

    // Subir comprobante si hay
    const urlComp = await subirComprobante(don.id)
    if (urlComp) {
      await supabase.from('donaciones').update({ comprobante_url: urlComp }).eq('id', don.id)
    }

    // Notificación a la fundación
    await supabase.from('notificaciones').insert({
      fundacion_id: fundacion.id,
      usuario_id:   usuario?.id ?? null,
      tipo:         'nueva_donacion',
      mensaje:      `Nueva donación vía ${metodo.label}${monto ? ` por $${Number(monto).toLocaleString('es-CO')}` : ''} — estado: pendiente`,
    })

    setSaving(false)
    onDonado(don.id)
  }

  const fieldCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'

  // ── Wompi ──
  if (metodo.id === 'wompi') return (
    <div className="space-y-5">
      <button onClick={onVolver} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">← Volver</button>
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">💳 Pago con Wompi</h2>
        <PanelInput label="Monto a donar (COP)" value={monto} onChange={setMonto} type="number" placeholder="Ej: 50000" />
        <p className="text-xs text-gray-400 mt-3 mb-4">Al hacer clic se abrirá el portal de pago de la fundación en una nueva pestaña.</p>
        <a href={fundacion.wompi_link} target="_blank" rel="noopener noreferrer"
          className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 mb-6">
          💳 Ir a pagar con Wompi ↗
        </a>
        <ComprobanteUpload ref={comprobanteRef} onChange={handleComprobante} previewUrl={comprobanteUrl} />
      </div>
      {error && <ErrorBox msg={error} />}
      <div className="flex gap-3">
        <button onClick={onVolver} className="btn-outline py-2.5 px-5">Atrás</button>
        <button onClick={() => registrar()} disabled={saving || !monto} className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <Spin />} {saving ? 'Registrando…' : 'Ya pagué, registrar donación'}
        </button>
      </div>
    </div>
  )

  // ── Nequi / Daviplata ──
  if (metodo.id === 'nequi' || metodo.id === 'daviplata') {
    const numero = metodo.id === 'nequi' ? fundacion.nequi_numero : fundacion.daviplata_numero
    return (
      <div className="space-y-5">
        <button onClick={onVolver} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">← Volver</button>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{metodo.icon} Transferencia por {metodo.label}</h2>
          <div className="bg-primary-50 rounded-2xl p-4 mb-5 text-center">
            <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">Número {metodo.label}</p>
            <p className="text-2xl font-bold text-primary-700 tracking-widest">{numero}</p>
            <p className="text-xs text-primary-500 mt-1">A nombre de: {fundacion.nombre}</p>
          </div>
          <ol className="text-sm text-gray-600 space-y-2 mb-5 list-decimal list-inside">
            <li>Abre tu app de {metodo.label}</li>
            <li>Envía al número <strong>{numero}</strong></li>
            <li>Sube el comprobante de pago abajo</li>
            <li>Haz clic en "Ya transferí"</li>
          </ol>
          <PanelInput label="Monto transferido (COP)" value={monto} onChange={setMonto} type="number" placeholder="Ej: 50000" />
          <div className="mt-4">
            <ComprobanteUpload ref={comprobanteRef} onChange={handleComprobante} previewUrl={comprobanteUrl} />
          </div>
        </div>
        {error && <ErrorBox msg={error} />}
        <div className="flex gap-3">
          <button onClick={onVolver} className="btn-outline py-2.5 px-5">Atrás</button>
          <button onClick={() => registrar()} disabled={saving || !monto} className="btn-primary py-2.5 px-8 flex items-center gap-2">
            {saving && <Spin />} {saving ? 'Registrando…' : 'Ya transferí'}
          </button>
        </div>
      </div>
    )
  }

  // ── Transferencia bancaria ──
  if (metodo.id === 'transferencia') return (
    <div className="space-y-5">
      <button onClick={onVolver} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">← Volver</button>
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🏦 Datos bancarios</h2>
        <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2.5">
          {[
            ['Banco',         fundacion.banco_nombre],
            ['Tipo de cuenta',fundacion.banco_tipo_cuenta],
            ['Número',        fundacion.banco_numero_cuenta],
            ['Titular',       fundacion.banco_titular],
            ['NIT / Cédula',  fundacion.banco_nit],
          ].filter(([,v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-400">{k}</span>
              <span className="font-semibold text-gray-800">{v}</span>
            </div>
          ))}
        </div>
        <PanelInput label="Monto transferido (COP)" value={monto} onChange={setMonto} type="number" placeholder="Ej: 500000" />
        <div className="mt-4">
          <ComprobanteUpload ref={comprobanteRef} onChange={handleComprobante} previewUrl={comprobanteUrl} />
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <div className="flex gap-3">
        <button onClick={onVolver} className="btn-outline py-2.5 px-5">Atrás</button>
        <button onClick={() => registrar()} disabled={saving || !monto} className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <Spin />} {saving ? 'Registrando…' : 'Ya hice la transferencia'}
        </button>
      </div>
    </div>
  )

  // ── Especie ──
  if (metodo.id === 'especie') return (
    <div className="space-y-5">
      <button onClick={onVolver} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">← Volver</button>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 mb-2">📦 Donación en especie</h2>
        <PanelInput label="¿Qué vas a donar?" value={descripcion} onChange={setDescripcion} placeholder="Ej: Ropa de niño talla 4–8, libros de primaria…" />
        <PanelInput label="Cantidad" value={cantidad} onChange={setCantidad} placeholder="Ej: 15 prendas, 3 cajas, 30 kg…" />
        {fundacion.direccion && (
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
            <strong>Dirección de entrega:</strong> {fundacion.direccion}
          </div>
        )}
        <PanelInput label="Fecha de entrega" value={fechaEntrega} onChange={setFechaEntrega} type="date" />
        <PanelInput label="Tu dirección (para coordinar recogida, opcional)" value={direccionEntreg} onChange={setDireccionEntreg} placeholder="Opcional si prefieres que la fundación recoja" required={false} />
      </div>
      {error && <ErrorBox msg={error} />}
      <div className="flex gap-3">
        <button onClick={onVolver} className="btn-outline py-2.5 px-5">Atrás</button>
        <button onClick={() => registrar({ descripcion: `${descripcion} — ${cantidad}`, fecha_entrega: fechaEntrega || null, direccion_entrega: direccionEntreg || null })}
          disabled={saving || !descripcion || !cantidad}
          className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <Spin />} {saving ? 'Registrando…' : 'Confirmar donación en especie'}
        </button>
      </div>
    </div>
  )

  // ── Voluntariado ──
  if (metodo.id === 'voluntariado') return (
    <div className="space-y-5">
      <button onClick={onVolver} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">← Volver</button>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 mb-2">🤝 Ofrecer voluntariado</h2>
        <PanelInput label="¿Qué habilidades o servicios ofreces?" value={habilidades} onChange={setHabilidades}
          placeholder="Ej: Clases de matemáticas, atención médica, carpintería…" />
        <PanelInput label="Disponibilidad" value={disponibilidad} onChange={setDisponibilidad}
          placeholder="Ej: Sábados 9am–1pm, 4 horas por semana" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje (opcional)</label>
          <textarea rows={3} value={mensaje} onChange={e => setMensaje(e.target.value)}
            placeholder="Cuéntanos por qué quieres ser voluntario en esta fundación…"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <div className="flex gap-3">
        <button onClick={onVolver} className="btn-outline py-2.5 px-5">Atrás</button>
        <button onClick={() => registrar({ descripcion: `Habilidades: ${habilidades} | Disponibilidad: ${disponibilidad}${mensaje ? ' | '+mensaje : ''}` })}
          disabled={saving || !habilidades || !disponibilidad}
          className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <Spin />} {saving ? 'Enviando…' : 'Enviar oferta de voluntariado'}
        </button>
      </div>
    </div>
  )

  return null
}

// ─── Paso 3: Celebración ──────────────────────────────────────────────────────
function PasoConfirmacion({ fundacion, usuario, metodo, donacionId }) {
  const [donacion, setDonacion] = useState(null)
  const [descargando, setDescargando] = useState(false)
  const dinero = !['especie','voluntariado'].includes(metodo?.id)

  useEffect(() => {
    if (!donacionId) return
    supabase.from('donaciones').select('*').eq('id', donacionId).maybeSingle()
      .then(({ data }) => setDonacion(data))
  }, [donacionId])

  async function handleCertificado() {
    if (!donacion) return
    setDescargando(true)
    await descargarCertificado(donacion, usuario, fundacion)
    setDescargando(false)
  }

  return (
    <div className="text-center">
      <ConfettiCanvas />
      <div className="card p-10 max-w-md mx-auto">
        <div className="text-6xl mb-4">{metodo?.id === 'voluntariado' ? '🤝' : '🎉'}</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {metodo?.id === 'voluntariado' ? '¡Gracias por ofrecerte!' : '¡Gracias por donar!'}
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {metodo?.id === 'voluntariado'
            ? <>Tu oferta de voluntariado fue enviada a <strong>{fundacion.nombre}</strong>. Se pondrán en contacto contigo pronto.</>
            : <>Tu donación fue registrada y está <strong>pendiente de confirmación</strong> por parte de <strong>{fundacion.nombre}</strong>. Recibirás una actualización cuando la confirmen.</>
          }
        </p>

        {fundacion.certificado_tributario && dinero && (
          <button onClick={handleCertificado} disabled={descargando}
            className="w-full btn-primary py-2.5 mb-3 flex items-center justify-center gap-2">
            {descargando
              ? <><Spin /> Generando…</>
              : <>📜 Descargar certificado tributario</>
            }
          </button>
        )}

        <Link to="/mi-impacto" className="w-full btn-outline py-2.5 block mb-3">
          Ver mi impacto
        </Link>
        <Link to={`/fundacion/${fundacion.id}`} className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
          Volver al perfil de la fundación
        </Link>
      </div>
    </div>
  )
}

// ─── Sub-componentes auxiliares ───────────────────────────────────────────────
function PanelInput({ label, value, onChange, type = 'text', placeholder = '', required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
    </div>
  )
}

function ComprobanteUpload({ onChange, previewUrl }) {
  const ref = useRef()
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Comprobante de pago <span className="text-gray-400 font-normal">(opcional pero recomendado)</span>
      </label>
      <div className="flex items-center gap-4">
        {previewUrl && (
          <img src={previewUrl} alt="Comprobante" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
        )}
        <button type="button" onClick={() => ref.current?.click()}
          className="btn-outline text-sm py-2 px-4">
          {previewUrl ? 'Cambiar imagen' : '📷 Subir comprobante'}
        </button>
        <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden" onChange={onChange} />
      </div>
      {previewUrl && <p className="text-xs text-green-600 mt-1.5">✓ Comprobante listo para subir</p>}
    </div>
  )
}

function ErrorBox({ msg }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{msg}</div>
}

function Spin() {
  return <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
}

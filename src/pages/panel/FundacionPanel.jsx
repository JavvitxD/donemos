import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const TABS = [
  { id: 'perfil',      label: 'Mi perfil',           icon: '👤' },
  { id: 'solicitudes', label: 'Mis solicitudes',      icon: '📋' },
  { id: 'pagos',       label: 'Métodos de pago',      icon: '💳' },
  { id: 'pendientes',  label: 'Donaciones pendientes',icon: '🔔' },
  { id: 'donaciones',  label: 'Historial',            icon: '💚' },
]

const CATEGORIAS = [
  ['ninez',         'Niñez'],
  ['educacion',     'Educación'],
  ['animales',      'Animales'],
  ['adultosMayores','Adultos Mayores'],
  ['medioAmbiente', 'Medio Ambiente'],
  ['salud',         'Salud'],
  ['discapacidad',  'Discapacidad'],
]

export default function FundacionPanel() {
  const { usuario, refreshUsuario } = useAuth()
  const [tab, setTab] = useState('perfil')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel de fundación</h1>
          <p className="text-gray-500 text-sm mt-1">
            {usuario?.fundaciones?.nombre ?? usuario?.nombre ?? 'Mi fundación'}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${tab === t.id ? 'bg-primary-500 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'perfil'      && <TabPerfil       usuario={usuario} onSave={refreshUsuario} />}
        {tab === 'solicitudes' && <TabSolicitudes   usuario={usuario} />}
        {tab === 'pagos'       && <TabMetodosPago   usuario={usuario} />}
        {tab === 'pendientes'  && <TabPendientes    usuario={usuario} />}
        {tab === 'donaciones'  && <TabDonaciones    usuario={usuario} />}
      </div>
    </div>
  )
}

// ─── Tab Perfil ───────────────────────────────────────────────────────────────
function TabPerfil({ usuario, onSave }) {
  const fileRef = useRef()
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [form, setForm] = useState({
    nombre: '', descripcion: '', historia: '',
    categoria: '', localidad: '', direccion: '', horario: '',
    telefono: '', whatsapp: '', web: '', email: '',
    beneficiarios: '', año_fundacion: '',
    acepta_dinero: true, acepta_especies: false,
    acepta_voluntarios: false, certificado_tributario: false,
  })

  useEffect(() => {
    if (!usuario?.fundacion_id) return
    supabase.from('fundaciones').select('*').eq('id', usuario.fundacion_id).maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setFotoUrl(data.foto_url ?? '')
        setForm({
          nombre:               data.nombre               ?? '',
          descripcion:          data.descripcion          ?? '',
          historia:             data.historia             ?? '',
          categoria:            data.categoria            ?? '',
          localidad:            data.localidad            ?? '',
          direccion:            data.direccion            ?? '',
          horario:              data.horario              ?? '',
          telefono:             data.telefono             ?? '',
          whatsapp:             data.whatsapp             ?? '',
          web:                  data.web                  ?? '',
          email:                data.email                ?? '',
          beneficiarios:        data.beneficiarios        ?? '',
          año_fundacion:        data.año_fundacion        ?? '',
          acepta_dinero:        data.acepta_dinero        ?? true,
          acepta_especies:      data.acepta_especies      ?? false,
          acepta_voluntarios:   data.acepta_voluntarios   ?? false,
          certificado_tributario: data.certificado_tributario ?? false,
        })
      })
  }, [usuario])

  async function handleFoto(e) {
    const file = e.target.files?.[0]
    if (!file || !usuario) return
    const ext  = file.name.split('.').pop()
    const path = `${usuario.id}/perfil.${ext}`
    const { error } = await supabase.storage.from('fotos-perfil').upload(path, file, { upsert: true })
    if (error) { setMsg('Error subiendo foto: ' + error.message); return }
    const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path)
    await supabase.from('fundaciones').update({ foto_url: data.publicUrl }).eq('id', usuario.fundacion_id)
    setFotoUrl(data.publicUrl)
    flash('Foto actualizada.')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!usuario?.fundacion_id) { setMsg('Error: cuenta no vinculada a ninguna fundación.'); return }
    setSaving(true)
    const { error } = await supabase.from('fundaciones').update({
      nombre:               form.nombre,
      descripcion:          form.descripcion,
      historia:             form.historia || null,
      categoria:            form.categoria || null,
      localidad:            form.localidad || null,
      direccion:            form.direccion || null,
      horario:              form.horario   || null,
      telefono:             form.telefono  || null,
      whatsapp:             form.whatsapp  || null,
      web:                  form.web       || null,
      email:                form.email     || null,
      beneficiarios:        form.beneficiarios || null,
      año_fundacion:        parseInt(form.año_fundacion) || null,
      acepta_dinero:        form.acepta_dinero,
      acepta_especies:      form.acepta_especies,
      acepta_voluntarios:   form.acepta_voluntarios,
      certificado_tributario: form.certificado_tributario,
    }).eq('id', usuario.fundacion_id)
    setSaving(false)
    if (error) { flash('Error: ' + error.message); return }
    flash('¡Perfil actualizado correctamente!')
    onSave()
  }

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 4000)
  }

  const set   = (k, v)    => setForm(f => ({ ...f, [k]: v }))
  const check = (k, bool) => setForm(f => ({ ...f, [k]: bool }))

  return (
    <div className="card p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Información del perfil</h2>

      {/* Foto / logo */}
      <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-primary-50 overflow-hidden flex items-center justify-center shrink-0">
          {fotoUrl
            ? <img src={fotoUrl} alt="Logo" className="w-full h-full object-cover" />
            : <span className="text-4xl">🏛️</span>
          }
        </div>
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-sm py-2">
            Cambiar foto / logo
          </button>
          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG o WEBP · máx. 2 MB</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Datos básicos */}
        <Section title="Datos básicos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PanelField label="Nombre de la fundación" value={form.nombre} onChange={v => set('nombre', v)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
              <select
                value={form.categoria}
                onChange={e => set('categoria', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <PanelField label="Correo de contacto" value={form.email}         onChange={v => set('email', v)} type="email" required={false} />
            <PanelField label="Sitio web"          value={form.web}           onChange={v => set('web', v)} placeholder="ej: mifundacion.org" required={false} />
            <PanelField label="Año de fundación"   value={form.año_fundacion} onChange={v => set('año_fundacion', v)} type="number" placeholder="ej: 2010" required={false} />
            <PanelField label="Beneficiarios"      value={form.beneficiarios} onChange={v => set('beneficiarios', v)} placeholder="ej: +300 familias en Soacha" required={false} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción corta</label>
            <textarea
              rows={2}
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Resumen breve de la misión (aparece en tarjetas de la página principal)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Historia completa</label>
            <textarea
              rows={6}
              value={form.historia}
              onChange={e => set('historia', e.target.value)}
              placeholder="Cuéntanos la historia de tu fundación: cómo nació, qué los inspira, sus logros y proyectos…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>
        </Section>

        {/* Contacto y ubicación */}
        <Section title="Contacto y ubicación">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PanelField label="Localidad" value={form.localidad} onChange={v => set('localidad', v)} required={false} />
            <PanelField label="Dirección" value={form.direccion} onChange={v => set('direccion', v)} placeholder="ej: Cra 7 # 32-45, Bogotá" required={false} />
            <PanelField label="Teléfono"  value={form.telefono}  onChange={v => set('telefono', v)} placeholder="ej: 601 234 5678" required={false} />
            <PanelField label="WhatsApp"  value={form.whatsapp}  onChange={v => set('whatsapp', v)} placeholder="ej: +57 310 000 0000" required={false} />
            <div className="md:col-span-2">
              <PanelField label="Horario de atención" value={form.horario} onChange={v => set('horario', v)} placeholder="ej: Lun–Vie 8am–5pm" required={false} />
            </div>
          </div>
        </Section>

        {/* Tipos de ayuda */}
        <Section title="¿Qué tipo de ayuda acepta tu fundación?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ['acepta_dinero',          'Acepta donaciones en dinero'],
              ['acepta_especies',        'Acepta donaciones en especies (ropa, alimentos, etc.)'],
              ['acepta_voluntarios',     'Acepta voluntarios'],
              ['certificado_tributario', 'Emite certificado tributario para donantes'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={e => check(key, e.target.checked)}
                  className="w-4 h-4 accent-primary-500 rounded"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </Section>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {msg}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

// ─── Tab Solicitudes ──────────────────────────────────────────────────────────
function TabSolicitudes({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [closingId,   setClosingId]   = useState(null)

  const load = async () => {
    if (!usuario?.fundacion_id) return
    setLoading(true)
    const { data } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('fundacion_id', usuario.fundacion_id)
      .order('created_at', { ascending: false })
    setSolicitudes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [usuario])

  async function cerrarSolicitud(id) {
    setClosingId(id)
    await supabase.from('solicitudes').update({ activa: false }).eq('id', id)
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, activa: false } : s))
    setClosingId(null)
  }

  async function reabrirSolicitud(id) {
    setClosingId(id)
    await supabase.from('solicitudes').update({ activa: true }).eq('id', id)
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, activa: true } : s))
    setClosingId(null)
  }

  const urgenciaColor = { alta: 'bg-red-100 text-red-700', media: 'bg-amber-100 text-amber-700', baja: 'bg-green-100 text-green-700' }
  const tipoLabel     = { money: 'Dinero', clothes: 'Ropa', food: 'Alimentos', books: 'Libros', voluntariado: 'Voluntariado' }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
        </h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className={showForm ? 'btn-outline py-2 px-5 text-sm' : 'btn-primary py-2 px-5 text-sm'}
        >
          {showForm ? '✕ Cancelar' : '+ Nueva solicitud'}
        </button>
      </div>

      {/* Formulario inline */}
      {showForm && (
        <div className="card p-6 border-2 border-primary-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Crear nueva solicitud</h3>
          <NuevaSolicitudForm usuario={usuario} onCreated={() => { setShowForm(false); load() }} />
        </div>
      )}

      {/* Lista vacía */}
      {solicitudes.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-semibold text-gray-700 mb-1">Sin solicitudes aún</p>
          <p className="text-gray-400 text-sm">Crea tu primera solicitud de donación con el botón de arriba</p>
        </div>
      )}

      {/* Tarjetas */}
      {solicitudes.map(s => {
        const pct = s.meta > 0 ? Math.min(100, Math.round(((s.progreso ?? 0) / s.meta) * 100)) : 0
        return (
          <div key={s.id} className={`card p-5 transition-opacity ${!s.activa ? 'opacity-60' : ''}`}>
            <div className="flex gap-4">
              {s.imagen_url && (
                <img src={s.imagen_url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{s.titulo}</h3>
                    {s.descripcion && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{s.descripcion}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgenciaColor[s.urgencia] ?? 'bg-gray-100 text-gray-600'}`}>
                      {s.urgencia}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.activa ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.activa ? 'Activa' : 'Cerrada'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    {tipoLabel[s.tipo] ?? s.tipo}
                  </span>
                  {s.fecha_limite && <span>Límite: {new Date(s.fecha_limite).toLocaleDateString('es-CO')}</span>}
                  {s.meta > 0 && (
                    <span>Meta: {s.tipo === 'money' ? `$${Number(s.meta).toLocaleString('es-CO')}` : s.meta}</span>
                  )}
                </div>

                {s.meta > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-gray-800">{pct}% alcanzado</span>
                      <span>
                        {s.tipo === 'money'
                          ? `$${Number(s.progreso ?? 0).toLocaleString('es-CO')} / $${Number(s.meta).toLocaleString('es-CO')}`
                          : `${s.progreso ?? 0} / ${s.meta}`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                {s.activa ? (
                  <button
                    onClick={() => cerrarSolicitud(s.id)}
                    disabled={closingId === s.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {closingId === s.id ? 'Cerrando…' : 'Marcar como completada / cerrar'}
                  </button>
                ) : (
                  <button
                    onClick={() => reabrirSolicitud(s.id)}
                    disabled={closingId === s.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50"
                  >
                    {closingId === s.id ? 'Reabriendo…' : 'Reabrir solicitud'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Formulario nueva solicitud (inline) ─────────────────────────────────────
function NuevaSolicitudForm({ usuario, onCreated }) {
  const imgRef = useRef()
  const [form, setForm] = useState({
    titulo: '', descripcion: '', tipo: 'money', urgencia: 'media',
    meta: '', fecha_limite: '',
  })
  const [imgFile,    setImgFile]    = useState(null)
  const [imgPreview, setImgPreview] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleImg(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!usuario?.fundacion_id) { setError('Tu cuenta no está vinculada a ninguna fundación.'); return }
    if (!form.titulo.trim())    { setError('El título es obligatorio.'); return }
    setSaving(true)
    setError('')

    let imagen_url = null
    if (imgFile) {
      const ext  = imgFile.name.split('.').pop()
      const path = `solicitudes/${usuario.fundacion_id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('fotos-perfil').upload(path, imgFile, { upsert: true })
      if (upErr) { setError('Error subiendo imagen: ' + upErr.message); setSaving(false); return }
      const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path)
      imagen_url = data.publicUrl
    }

    const { error: insErr } = await supabase.from('solicitudes').insert({
      fundacion_id: usuario.fundacion_id,
      titulo:       form.titulo.trim(),
      descripcion:  form.descripcion.trim() || null,
      tipo:         form.tipo,
      urgencia:     form.urgencia,
      meta:         parseFloat(form.meta) || null,
      fecha_limite: form.fecha_limite || null,
      imagen_url,
      activa:       true,
    })
    setSaving(false)
    if (insErr) { setError(insErr.message); return }
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PanelField label="Título" value={form.titulo} onChange={v => set('titulo', v)} required placeholder="Ej: Kits escolares para 60 niños" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
        <textarea rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
          placeholder="Describe la necesidad, quiénes se benefician y cómo se usarán las donaciones"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de donación</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="money">💵 Dinero</option>
            <option value="clothes">👕 Ropa / Especies</option>
            <option value="food">🥫 Alimentos</option>
            <option value="books">📚 Libros / Útiles</option>
            <option value="voluntariado">🤝 Voluntariado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgencia</label>
          <select value={form.urgencia} onChange={e => set('urgencia', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="alta">🔴 Alta</option>
            <option value="media">🟡 Media</option>
            <option value="baja">🟢 Baja</option>
          </select>
        </div>
        <PanelField label="Meta" value={form.meta} onChange={v => set('meta', v)} type="number" required={false}
          placeholder={form.tipo === 'money' ? 'Ej: 5000000 (pesos)' : 'Ej: 300 (unidades)'} />
        <PanelField label="Fecha límite" value={form.fecha_limite} onChange={v => set('fecha_limite', v)} type="date" required={false} />
      </div>

      {/* Imagen opcional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto de la solicitud (opcional)</label>
        <div className="flex items-center gap-4">
          {imgPreview && (
            <img src={imgPreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
          )}
          <button type="button" onClick={() => imgRef.current?.click()} className="btn-outline text-sm py-2 px-4">
            {imgPreview ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <button type="submit" disabled={saving} className="btn-primary py-2.5 px-8 flex items-center gap-2">
        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {saving ? 'Publicando…' : 'Publicar solicitud'}
      </button>
    </form>
  )
}

// ─── Tab Métodos de pago ──────────────────────────────────────────────────────
function TabMetodosPago({ usuario }) {
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')
  const [form, setForm] = useState({
    wompi_link: '', nequi_numero: '', daviplata_numero: '',
    banco_nombre: '', banco_tipo_cuenta: '', banco_numero_cuenta: '',
    banco_titular: '', banco_nit: '',
  })

  useEffect(() => {
    if (!usuario?.fundacion_id) return
    supabase.from('fundaciones').select(
      'wompi_link,nequi_numero,daviplata_numero,banco_nombre,banco_tipo_cuenta,banco_numero_cuenta,banco_titular,banco_nit'
    ).eq('id', usuario.fundacion_id).maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setForm({
          wompi_link:           data.wompi_link           ?? '',
          nequi_numero:         data.nequi_numero         ?? '',
          daviplata_numero:     data.daviplata_numero     ?? '',
          banco_nombre:         data.banco_nombre         ?? '',
          banco_tipo_cuenta:    data.banco_tipo_cuenta    ?? '',
          banco_numero_cuenta:  data.banco_numero_cuenta  ?? '',
          banco_titular:        data.banco_titular        ?? '',
          banco_nit:            data.banco_nit            ?? '',
        })
      })
  }, [usuario])

  async function handleSave(e) {
    e.preventDefault()
    if (!usuario?.fundacion_id) return
    setSaving(true)
    const { error } = await supabase.from('fundaciones').update({
      wompi_link:           form.wompi_link           || null,
      nequi_numero:         form.nequi_numero         || null,
      daviplata_numero:     form.daviplata_numero     || null,
      banco_nombre:         form.banco_nombre         || null,
      banco_tipo_cuenta:    form.banco_tipo_cuenta    || null,
      banco_numero_cuenta:  form.banco_numero_cuenta  || null,
      banco_titular:        form.banco_titular        || null,
      banco_nit:            form.banco_nit            || null,
    }).eq('id', usuario.fundacion_id)
    setSaving(false)
    flash(error ? 'Error: ' + error.message : '¡Métodos de pago actualizados!')
  }

  function flash(text) { setMsg(text); setTimeout(() => setMsg(''), 4000) }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="card p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Métodos de pago</h2>
      <p className="text-sm text-gray-400 mb-6">
        Configura cómo quieres recibir donaciones. Solo los métodos configurados aparecerán en tu página pública.
      </p>
      <form onSubmit={handleSave} className="space-y-6">
        <Section title="💳 Wompi">
          <PanelField label="Link de pago Wompi" value={form.wompi_link} onChange={v => set('wompi_link', v)}
            placeholder="https://checkout.wompi.io/l/..." required={false} />
          <p className="text-xs text-gray-400">Obtén tu link en el panel de Wompi → Cobros → Crear link de pago</p>
        </Section>
        <Section title="📱 Nequi y Daviplata">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PanelField label="Número Nequi"     value={form.nequi_numero}     onChange={v => set('nequi_numero', v)}     placeholder="+57 300 000 0000" required={false} />
            <PanelField label="Número Daviplata" value={form.daviplata_numero} onChange={v => set('daviplata_numero', v)} placeholder="+57 300 000 0000" required={false} />
          </div>
        </Section>
        <Section title="🏦 Transferencia bancaria">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PanelField label="Banco"            value={form.banco_nombre}        onChange={v => set('banco_nombre', v)}        placeholder="Ej: Bancolombia" required={false} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de cuenta</label>
              <select value={form.banco_tipo_cuenta} onChange={e => set('banco_tipo_cuenta', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="">Seleccionar…</option>
                <option value="Ahorros">Ahorros</option>
                <option value="Corriente">Corriente</option>
              </select>
            </div>
            <PanelField label="Número de cuenta" value={form.banco_numero_cuenta} onChange={v => set('banco_numero_cuenta', v)} placeholder="Ej: 123-456789-00" required={false} />
            <PanelField label="Titular"           value={form.banco_titular}       onChange={v => set('banco_titular', v)}       placeholder="Nombre o razón social" required={false} />
            <PanelField label="NIT / Cédula"      value={form.banco_nit}           onChange={v => set('banco_nit', v)}           placeholder="Ej: 900.123.456-1" required={false} />
          </div>
        </Section>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {msg}
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary py-2.5 px-8 flex items-center gap-2">
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? 'Guardando…' : 'Guardar métodos de pago'}
        </button>
      </form>
    </div>
  )
}

// ─── Tab Donaciones pendientes ────────────────────────────────────────────────
function TabPendientes({ usuario }) {
  const [donaciones, setDonaciones] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [procesando, setProcesando] = useState(null)

  const load = async () => {
    if (!usuario?.fundacion_id) return
    setLoading(true)
    const { data } = await supabase
      .from('donaciones')
      .select('*, usuarios(nombre, email), solicitudes(titulo, tipo, meta, progreso)')
      .eq('fundacion_id', usuario.fundacion_id)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })
    setDonaciones(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [usuario])

  async function confirmar(id, donacion) {
    setProcesando(id)
    await supabase.from('donaciones').update({ estado: 'completada' }).eq('id', id)

    // Actualizar progreso de la solicitud si aplica
    if (donacion.solicitud_id && donacion.tipo === 'money' && donacion.monto) {
      const { data: sol } = await supabase.from('solicitudes').select('progreso').eq('id', donacion.solicitud_id).maybeSingle()
      if (sol) {
        await supabase.from('solicitudes').update({ progreso: (sol.progreso ?? 0) + donacion.monto }).eq('id', donacion.solicitud_id)
      }
    }

    // Notificación al donante (si tiene usuario)
    if (donacion.usuario_id) {
      await supabase.from('notificaciones').insert({
        usuario_id:   donacion.usuario_id,
        fundacion_id: usuario.fundacion_id,
        tipo:         'donacion_confirmada',
        mensaje:      `¡Tu donación a ${usuario?.fundaciones?.nombre ?? 'la fundación'} fue confirmada!`,
      })
    }

    setProcesando(null)
    load()
  }

  async function rechazar(id) {
    setProcesando(id)
    await supabase.from('donaciones').update({ estado: 'rechazada' }).eq('id', id)
    setProcesando(null)
    load()
  }

  const METODO_META = {
    wompi:        { icon: '💳', label: 'Wompi' },
    nequi:        { icon: '📱', label: 'Nequi' },
    daviplata:    { icon: '📱', label: 'Daviplata' },
    transferencia:{ icon: '🏦', label: 'Transferencia' },
    especie:      { icon: '📦', label: 'En especie' },
    voluntariado: { icon: '🤝', label: 'Voluntariado' },
  }

  if (loading) return <Spinner />

  if (donaciones.length === 0) return (
    <div className="card p-12 text-center">
      <p className="text-4xl mb-4">✅</p>
      <p className="font-semibold text-gray-700 mb-1">Sin donaciones pendientes</p>
      <p className="text-gray-400 text-sm">Cuando alguien done, aparecerá aquí para confirmar o rechazar</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
        <span>⏳</span>
        <span><strong>{donaciones.length}</strong> donación{donaciones.length !== 1 ? 'es' : ''} esperando confirmación</span>
      </div>

      {donaciones.map(d => {
        const mm = METODO_META[d.metodo_pago] ?? METODO_META.transferencia
        return (
          <div key={d.id} className="card p-5">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl shrink-0">{mm.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900">{d.usuarios?.nombre ?? 'Donante anónimo'}</p>
                    {d.usuarios?.email && <p className="text-xs text-gray-400">{d.usuarios.email}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(d.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      {d.tipo === 'money' && d.monto ? `$${Number(d.monto).toLocaleString('es-CO')} COP` : mm.label}
                    </p>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendiente</span>
                  </div>
                </div>
                {d.solicitudes?.titulo && (
                  <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                    📋 {d.solicitudes.titulo}
                  </p>
                )}
                {d.descripcion && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{d.descripcion}</p>
                )}
              </div>
            </div>

            {/* Comprobante */}
            {d.comprobante_url && (
              <div className="mb-4">
                <a href={d.comprobante_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline bg-primary-50 px-3 py-1.5 rounded-lg">
                  📎 Ver comprobante adjunto ↗
                </a>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={() => confirmar(d.id, d)}
                disabled={procesando === d.id}
                className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2">
                {procesando === d.id
                  ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando…</>
                  : '✓ Confirmar recibida'
                }
              </button>
              <button
                onClick={() => rechazar(d.id)}
                disabled={procesando === d.id}
                className="flex-1 py-2 text-sm font-medium rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                ✕ Rechazar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab Donaciones ───────────────────────────────────────────────────────────
function TabDonaciones({ usuario }) {
  const [donaciones, setDonaciones] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!usuario?.fundacion_id) return
    supabase.from('donaciones')
      .select('*, usuarios(nombre, email), solicitudes(titulo)')
      .eq('fundacion_id', usuario.fundacion_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDonaciones(data ?? []); setLoading(false) })
  }, [usuario])

  if (loading) return <Spinner />

  if (donaciones.length === 0) return (
    <div className="card p-12 text-center">
      <p className="text-4xl mb-4">💚</p>
      <p className="font-semibold text-gray-700 mb-1">Aún no has recibido donaciones</p>
      <p className="text-gray-400 text-sm">Las donaciones de tus solicitudes aparecerán aquí</p>
    </div>
  )

  const totalDinero    = donaciones.reduce((s, d) => s + (d.monto ?? 0), 0)
  const totalEspecies  = donaciones.filter(d => d.tipo !== 'money').length
  const totalDonantes  = new Set(donaciones.map(d => d.usuarios?.email).filter(Boolean)).size

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-primary-50">
          <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">Total en dinero</p>
          <p className="text-2xl font-bold text-primary-700">${totalDinero.toLocaleString('es-CO')}</p>
          <p className="text-xs text-primary-500 mt-0.5">COP recibido</p>
        </div>
        <div className="card p-5 bg-blue-50">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">En especie / voluntariado</p>
          <p className="text-2xl font-bold text-blue-700">{totalEspecies}</p>
          <p className="text-xs text-blue-500 mt-0.5">donaciones no monetarias</p>
        </div>
        <div className="card p-5 bg-gray-50">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Donantes únicos</p>
          <p className="text-2xl font-bold text-gray-800">{totalDonantes}</p>
          <p className="text-xs text-gray-400 mt-0.5">de {donaciones.length} donaciones totales</p>
        </div>
      </div>

      {/* Lista */}
      {donaciones.map(d => (
        <div key={d.id} className="card p-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">{d.usuarios?.nombre ?? 'Donante anónimo'}</p>
            {d.usuarios?.email && <p className="text-xs text-gray-400 truncate">{d.usuarios.email}</p>}
            <p className="text-xs text-gray-400 mt-0.5">{d.solicitudes?.titulo ?? 'Donación libre'}</p>
            <p className="text-xs text-gray-300 mt-0.5">
              {new Date(d.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-primary-600 text-sm">
              {d.monto ? `$${Number(d.monto).toLocaleString('es-CO')}` : d.descripcion ?? '—'}
            </p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{d.tipo}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function PanelField({ label, value, onChange, type = 'text', placeholder = '', required = true }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
      />
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fundaciones as localData, solicitudesUrgentes as localSolicitudes } from '../data/fundaciones'

export function useFundaciones(categoria = 'all') {
  const [fundaciones, setFundaciones] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [fromSupabase, setFromSupabase] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      let query = supabase.from('fundaciones').select('*').order('año_fundacion', { ascending: true })
      if (categoria !== 'all') query = query.eq('categoria', categoria)

      const { data, error: sbError } = await query

      if (cancelled) return

      if (sbError || !data || data.length === 0) {
        // Supabase no disponible o sin tablas: usar datos locales
        const local = categoria === 'all'
          ? localData
          : localData.filter(f => f.categoria === categoria)
        // Normalizar campos snake_case ↔ camelCase para compatibilidad
        setFundaciones(local.map(normalizeLocal))
        setFromSupabase(false)
      } else {
        setFundaciones(data.map(normalizeSupabase))
        setFromSupabase(true)
      }
      setError(sbError?.message ?? null)
      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [categoria])

  return { fundaciones, loading, error, fromSupabase }
}

export function useSolicitudesUrgentes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading]         = useState(true)
  const [fromSupabase, setFromSupabase] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*, fundaciones(nombre, verificada)')
        .eq('activa', true)
        .order('urgencia', { ascending: false })
        .limit(4)

      if (cancelled) return

      if (error || !data || data.length === 0) {
        setSolicitudes(localSolicitudes)
        setFromSupabase(false)
      } else {
        setSolicitudes(data.map(s => ({
          id:           s.id,
          fundacionId:  s.fundacion_id,
          foundation:   s.fundaciones?.nombre ?? '—',
          verified:     s.fundaciones?.verificada ?? false,
          title:        s.titulo,
          categoria:    s.tipo_categoria ?? 'ninez',
          donationType: s.tipo ?? 'money',
          goal:         s.meta,
          raised:       s.progreso,
          donors:       s.donantes_count ?? 0,
          daysLeft:     s.fecha_limite
            ? Math.max(0, Math.ceil((new Date(s.fecha_limite) - new Date()) / 86400000))
            : 99,
          image: s.imagen_url ?? defaultImage(s.tipo),
        })))
        setFromSupabase(true)
      }
      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  return { solicitudes, loading, fromSupabase }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultImage(tipo) {
  const map = {
    money:   'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=220&fit=crop',
    clothes: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=220&fit=crop',
    food:    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=220&fit=crop',
    books:   'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=220&fit=crop',
  }
  return map[tipo] ?? map.money
}

// Supabase devuelve snake_case → normalizar a la forma que usan los componentes
function normalizeSupabase(f) {
  return {
    id:                    f.id,
    nombre:                f.nombre,
    descripcion:           f.descripcion,
    categoria:             f.categoria,
    localidad:             f.localidad,
    web:                   f.web,
    email:                 f.email,
    aceptaDinero:          f.acepta_dinero,
    aceptaEspecies:        f.acepta_especies,
    aceptaVoluntarios:     f.acepta_voluntarios,
    certificadoTributario: f.certificado_tributario,
    verificada:            f.verificada,
    beneficiarios:         f.beneficiarios,
    añoFundacion:          f.año_fundacion,
  }
}

// Datos locales ya están en camelCase; solo asegura que existan los campos
function normalizeLocal(f) {
  return {
    id:                    f.id,
    nombre:                f.nombre,
    descripcion:           f.descripcion,
    categoria:             f.categoria,
    localidad:             f.localidad,
    web:                   f.web,
    email:                 f.email,
    aceptaDinero:          f.aceptaDinero,
    aceptaEspecies:        f.aceptaEspecies,
    aceptaVoluntarios:     f.aceptaVoluntarios,
    certificadoTributario: f.certificadoTributario,
    verificada:            f.verificada,
    beneficiarios:         f.beneficiarios,
    añoFundacion:          f.añoFundacion,
  }
}

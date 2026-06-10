/**
 * Script de setup: crea tablas y migra datos a Supabase.
 * Ejecutar una sola vez: node scripts/setup-db.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uboswvsijbddwygypkic.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ChhkhoWBnaCJ9VbBGD4qRQ_NmgImn5K'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── DDL: crear tablas ────────────────────────────────────────────────────────
const SQL_TABLES = `
CREATE TABLE IF NOT EXISTS fundaciones (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre               text NOT NULL,
  descripcion          text,
  categoria            text,
  localidad            text,
  web                  text,
  email                text,
  acepta_dinero        boolean DEFAULT false,
  acepta_especies      boolean DEFAULT false,
  acepta_voluntarios   boolean DEFAULT false,
  certificado_tributario boolean DEFAULT false,
  verificada           boolean DEFAULT false,
  beneficiarios        text,
  año_fundacion        integer,
  foto_url             text,
  created_at           timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fundacion_id  uuid REFERENCES fundaciones(id),
  titulo        text NOT NULL,
  descripcion   text,
  tipo          text,
  urgencia      text,
  meta          numeric,
  progreso      numeric DEFAULT 0,
  fecha_limite  date,
  activa        boolean DEFAULT true,
  created_at    timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text UNIQUE NOT NULL,
  nombre       text,
  rol          text DEFAULT 'donante',
  fundacion_id uuid REFERENCES fundaciones(id),
  created_at   timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donaciones (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id    uuid REFERENCES usuarios(id),
  fundacion_id  uuid REFERENCES fundaciones(id),
  solicitud_id  uuid REFERENCES solicitudes(id),
  tipo          text,
  monto         numeric,
  descripcion   text,
  created_at    timestamp DEFAULT now()
);
`

// ─── Datos a migrar ───────────────────────────────────────────────────────────
const fundaciones = [
  { nombre: "Fundación PLAN Colombia", descripcion: "Más de 60 años promoviendo derechos de la niñez en situación de vulnerabilidad extrema.", categoria: "ninez", localidad: "Bogotá", web: "plan.org.co", email: "info@plan.org.co", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Miles de niños en 6 departamentos", año_fundacion: 1964 },
  { nombre: "Fundación Niñas de Luz", descripcion: "Acompaña niñas y adolescentes en Bogotá para fortalecer su liderazgo y proyectos de vida.", categoria: "ninez", localidad: "Bogotá", web: "funiluz.org", email: "info@funiluz.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Niñas y adolescentes", año_fundacion: 2013 },
  { nombre: "Fundación Sentires", descripcion: "Trabaja con 60 niños en Ciudad Bolívar. Recibe útiles, alimentos y voluntarios.", categoria: "ninez", localidad: "Ciudad Bolívar", web: "fundacionsentires.org", email: "info@fundacionsentires.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+300 niños y familias", año_fundacion: 2010 },
  { nombre: "Fundación Ecosueños", descripcion: "Internado ICBF para niños y adolescentes cuyos derechos han sido vulnerados en Bogotá.", categoria: "ninez", localidad: "Bogotá", web: "fundacionecosuenos.org", email: "info@fundacionecosuenos.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Niños en protección ICBF", año_fundacion: 2014 },
  { nombre: "Fundación Casa de Colombia", descripcion: "Salud y educación para niños. Facilita acceso a tratamientos médicos especializados.", categoria: "ninez", localidad: "Bogotá", web: "casadecolombia.co", email: "info@casadecolombia.co", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Niños con enfermedades", año_fundacion: 2005 },
  { nombre: "Fundación Laudes Infantis", descripcion: "Beneficia 300 familias con roperos comunitarios y refrigerios para niños y adultos mayores.", categoria: "ninez", localidad: "Bogotá", web: "laudesinfantis.org", email: "info@laudesinfantis.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+300 familias", año_fundacion: 2008 },
  { nombre: "Fundación Levántate y Anda", descripcion: "Educación, recreación y acompañamiento a niños y adolescentes vulnerables en Bogotá.", categoria: "ninez", localidad: "Bogotá", web: "fundacionlevantateyanda.org", email: "info@fundacionlevantateyanda.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Niños y adolescentes", año_fundacion: 2005 },
  { nombre: "Fundación Líderes Monarca", descripcion: "Educación y protección a niños y jóvenes vulnerables en Bogotá. Acepta voluntarios.", categoria: "educacion", localidad: "Bogotá", web: "fundacionlideresmonarca.org", email: "info@fundacionlideresmonarca.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Jóvenes en vulnerabilidad", año_fundacion: 2012 },
  { nombre: "Fundación Fundevi", descripcion: "10 años apoyando educación, salud y necesidades básicas. Más de 500 beneficiarios.", categoria: "educacion", localidad: "Bogotá", web: "fundacionfundevi.org", email: "info@fundacionfundevi.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+500 personas", año_fundacion: 2014 },
  { nombre: "Fundación Asómate", descripcion: "Entrega ropa a más de 900 personas en Ciudad Bolívar, Usme y Santa Fe cada mes.", categoria: "educacion", localidad: "Ciudad Bolívar", web: "asomate.org", email: "info@asomate.org", acepta_dinero: false, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+900 personas mensuales", año_fundacion: 2018 },
  { nombre: "Fundación Eudes", descripcion: "ONG en Bogotá que atiende población vulnerable. Expide certificados de donación tributarios.", categoria: "educacion", localidad: "Engativá", web: "fundacioneudes.co", email: "direccionadministrativa@fundacioneudes.co", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Familias vulnerables", año_fundacion: 2003 },
  { nombre: "Colitas Felices", descripcion: "Rescata perros en situación de maltrato. Esterilizaciones por $80.000. Acepta PSE y tarjeta.", categoria: "animales", localidad: "Chocontá / Bogotá", web: "colitasfelices.org", email: "info@colitasfelices.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+1.100 animales", año_fundacion: 2018 },
  { nombre: "Fundación Gatitus", descripcion: "Rescate y adopción de gatos abandonados. Aprobada DIAN. Donantes deducen 25% en renta.", categoria: "animales", localidad: "Bogotá", web: "fundaciongatitusuv.org", email: "info@fundaciongatitusuv.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Gatos rescatados", año_fundacion: 2018 },
  { nombre: "Fundación Mil Bigotes", descripcion: "Más de 2.000 gatos impactados desde 2016. Meta: 300 rescates, esterilizaciones y adopciones anuales.", categoria: "animales", localidad: "Bogotá", web: "milbigotes.com", email: "info@milbigotes.com", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+2.000 gatos", año_fundacion: 2016 },
  { nombre: "Fundación TEPA", descripcion: "Rescate y adopción responsable de animales. Recibe alimentos, medicinas y cobijas.", categoria: "animales", localidad: "Bogotá", web: "fundaciontepa.org", email: "info@fundaciontepa.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Perros y gatos rescatados", año_fundacion: 2010 },
  { nombre: "Asoanimales Colombia", descripcion: "Rescata perros y gatos abandonados, les da atención integral en salud y los da en adopción.", categoria: "animales", localidad: "Bogotá", web: "asoanimales.org", email: "info@asoanimales.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Animales rescatados", año_fundacion: 2003 },
  { nombre: "Fundación La Manuelita", descripcion: "Desde 1915 ofrece vida digna a adultos mayores en pobreza. 50 residentes y 80 voluntarios.", categoria: "adultosMayores", localidad: "Cajicá / Bogotá", web: "lamanuelita.org", email: "info@lamanuelita.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "50 adultos mayores", año_fundacion: 1915 },
  { nombre: "FUNDAMA", descripcion: "Desde 1977. Cinco sedes en Bogotá con 320 apartamentos para mayores de 65 años.", categoria: "adultosMayores", localidad: "Suba / Usaquén", web: "fundama.com.co", email: "info@fundama.com.co", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "320 adultos mayores", año_fundacion: 1977 },
  { nombre: "Fundación Juan Pablo II", descripcion: "Desde 1978 en Bogotá. Cuida adultos mayores vulnerables con programas de bienestar.", categoria: "adultosMayores", localidad: "Bogotá", web: "fundacionjuanpabloii.com", email: "info@fundacionjuanpabloii.com", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Adultos mayores vulnerables", año_fundacion: 1978 },
  { nombre: "Fundación Provida Colombia", descripcion: "Nutrición, educación y acompañamiento a adultos mayores. Red Solidaria con voluntariado.", categoria: "adultosMayores", localidad: "Bogotá", web: "fundacionprovida.org", email: "info@fundacionprovida.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Adultos mayores", año_fundacion: 2000 },
  { nombre: "Fundación Humedales Bogotá", descripcion: "Más de 30.000 árboles sembrados en 6 años. Certificados tributarios. Jornadas de reforestación.", categoria: "medioAmbiente", localidad: "Bogotá", web: "humedalesbogota.com", email: "info@humedalesbogota.com", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Ecosistemas bogotanos", año_fundacion: 2015 },
  { nombre: "Fundación Natura Colombia", descripcion: "ONG ambiental líder. Conservación de ecosistemas, reforestación y áreas protegidas en Colombia.", categoria: "medioAmbiente", localidad: "Bogotá", web: "natura.org.co", email: "info@natura.org.co", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Ecosistemas naturales", año_fundacion: 1984 },
  { nombre: "Trébola Ecológica", descripcion: "Educación ambiental desde 2004. Más de 120.000 personas capacitadas en Bogotá en reciclaje.", categoria: "medioAmbiente", localidad: "Bogotá", web: "trebola.org", email: "info@trebola.org", acepta_dinero: false, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "+120.000 personas", año_fundacion: 2004 },
  { nombre: "Banco de Alimentos de Bogotá", descripcion: "Redistribuye alimentos a comunidades vulnerables. Red ABACO. Certificados tributarios.", categoria: "medioAmbiente", localidad: "Bogotá", web: "abaco.org.co", email: "info@abaco.org.co", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Miles de familias", año_fundacion: 1990 },
  { nombre: "Fundación Santa Fe de Bogotá", descripcion: "Décadas de trayectoria en salud. Reinvierte cada recurso. Expide certificados de donación.", categoria: "salud", localidad: "Usaquén", web: "fundacionsantafedebogota.com", email: "donaciones@fsfb.org.co", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Pacientes y comunidad", año_fundacion: 1972 },
  { nombre: "Fundación CIREC", descripcion: "Rehabilitación integral para personas con discapacidad. Metodología de Sanación Integral.", categoria: "salud", localidad: "Bogotá", web: "fundacioncirec.org", email: "info@fundacioncirec.org", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Personas con discapacidad", año_fundacion: 1990 },
  { nombre: "Fundación ICAL", descripcion: "Salud y rehabilitación en Bogotá. Acepta voluntarios según sus saberes y disponibilidad.", categoria: "salud", localidad: "Bogotá", web: "icalcolombia.org", email: "info@icalcolombia.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Pacientes en rehabilitación", año_fundacion: 1995 },
  { nombre: "Fundación Saldarriaga Concha", descripcion: "50 años construyendo una Colombia inclusiva para personas con discapacidad y adultos mayores.", categoria: "discapacidad", localidad: "Bogotá", web: "saldarriagaconcha.org", email: "info@saldarriagaconcha.org", acepta_dinero: true, acepta_especies: false, acepta_voluntarios: true, certificado_tributario: true, verificada: true, beneficiarios: "Personas con discapacidad", año_fundacion: 1973 },
  { nombre: "Fundación Manos al Cielo", descripcion: "Apoya personas con discapacidad y sus cuidadores con talleres, cursos y nutrición comunitaria.", categoria: "discapacidad", localidad: "Bogotá", web: "fundacionmanosalcielo.org", email: "info@fundacionmanosalcielo.org", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Personas con discapacidad", año_fundacion: 2015 },
  { nombre: "Fundación CREINSER", descripcion: "Inclusión laboral, educativa y social de personas con discapacidad en Bogotá y Cundinamarca.", categoria: "discapacidad", localidad: "Bogotá", web: "fundacioncreinser.com", email: "info@fundacioncreinser.com", acepta_dinero: true, acepta_especies: true, acepta_voluntarios: true, certificado_tributario: false, verificada: true, beneficiarios: "Personas con discapacidad", año_fundacion: 2008 },
]

// ─── Solicitudes urgentes ─────────────────────────────────────────────────────
const solicitudesBase = [
  { nombreFundacion: "Fundación Sentires",        titulo: "Útiles escolares para 60 niños en Ciudad Bolívar",    tipo: "money",   urgencia: "alta",  meta: 4500000, progreso: 3240000, fecha_limite: "2026-06-14", activa: true },
  { nombreFundacion: "Fundación Humedales Bogotá",titulo: "Jornada de reforestación: 500 árboles nativos",        tipo: "money",   urgencia: "media", meta: 6000000, progreso: 2750000, fecha_limite: "2026-06-20", activa: true },
  { nombreFundacion: "Fundación La Manuelita",    titulo: "Ropa de abrigo para 50 adultos mayores",              tipo: "clothes", urgencia: "alta",  meta: 200,     progreso: 130,     fecha_limite: "2026-06-13", activa: true },
  { nombreFundacion: "Fundación Fundevi",         titulo: "Dotación de libros para biblioteca comunitaria",      tipo: "books",   urgencia: "media", meta: 400,     progreso: 260,     fecha_limite: "2026-06-17", activa: true },
]

// ─── Runner ───────────────────────────────────────────────────────────────────
async function run() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║     Donemos — Setup de base de datos     ║')
  console.log('╚══════════════════════════════════════════╝\n')

  // 1. Crear tablas via RPC exec_sql (requiere service_role en producción)
  //    Si falla, instrucciones para hacerlo manual en el SQL Editor de Supabase.
  console.log('▶ Intentando crear tablas...')
  const { error: sqlError } = await supabase.rpc('exec_sql', { sql: SQL_TABLES })

  if (sqlError) {
    console.warn('⚠  No se pudieron crear las tablas automáticamente.')
    console.warn('   El anon key no tiene permisos DDL. Sigue estos pasos:\n')
    console.warn('   1. Ve a https://supabase.com/dashboard/project/uboswvsijbddwygypkic/sql/new')
    console.warn('   2. Pega y ejecuta el SQL de CREATE TABLE del archivo scripts/create-tables.sql')
    console.warn('   3. Vuelve a correr este script para migrar los datos.\n')

    // Escribir el SQL a un archivo separado para copiarlo fácilmente
    import('fs').then(({ writeFileSync }) => {
      writeFileSync('./scripts/create-tables.sql', SQL_TABLES.trim())
      console.log('   ✓ SQL guardado en scripts/create-tables.sql\n')
    })
  } else {
    console.log('✓ Tablas creadas correctamente.\n')
  }

  // 2. Verificar si la tabla fundaciones ya tiene datos
  const { data: existing, error: checkError } = await supabase
    .from('fundaciones')
    .select('id')
    .limit(1)

  if (checkError) {
    console.error('✗ No se puede acceder a la tabla "fundaciones".')
    console.error('  Asegúrate de haber creado las tablas primero y vuelve a correr este script.')
    console.error('  Error:', checkError.message)
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log('ℹ  La tabla "fundaciones" ya tiene datos. Saltando migración.')
    console.log('   Elimina los registros manualmente si quieres re-migrar.\n')
  } else {
    // 3. Insertar fundaciones
    console.log('▶ Migrando 30 fundaciones...')
    const { data: inserted, error: insertError } = await supabase
      .from('fundaciones')
      .insert(fundaciones)
      .select('id, nombre, categoria')

    if (insertError) {
      console.error('✗ Error al insertar fundaciones:', insertError.message)
      process.exit(1)
    }
    console.log(`✓ ${inserted.length} fundaciones insertadas.\n`)

    // 4. Insertar solicitudes vinculando por nombre de fundación
    console.log('▶ Migrando solicitudes urgentes...')
    for (const sol of solicitudesBase) {
      const fund = inserted.find(f => f.nombre === sol.nombreFundacion)
      if (!fund) { console.warn(`  ⚠ No encontré fundación: ${sol.nombreFundacion}`); continue }
      const { error: solError } = await supabase.from('solicitudes').insert({
        fundacion_id: fund.id,
        titulo:       sol.titulo,
        tipo:         sol.tipo,
        urgencia:     sol.urgencia,
        meta:         sol.meta,
        progreso:     sol.progreso,
        fecha_limite: sol.fecha_limite,
        activa:       sol.activa,
      })
      if (solError) console.warn(`  ⚠ Error en solicitud "${sol.titulo}":`, solError.message)
      else          console.log(`  ✓ ${sol.titulo}`)
    }
    console.log()
  }

  // 5. Resumen final
  const { count: totalFund } = await supabase.from('fundaciones').select('*', { count: 'exact', head: true })
  const { count: totalSol  } = await supabase.from('solicitudes').select('*', { count: 'exact', head: true })
  console.log('══════════════════════════════════════════')
  console.log(`  Fundaciones en Supabase : ${totalFund ?? '?'}`)
  console.log(`  Solicitudes en Supabase : ${totalSol  ?? '?'}`)
  console.log('══════════════════════════════════════════')
  console.log('\n✅ Setup completado.\n')
}

run().catch(err => { console.error('Error inesperado:', err); process.exit(1) })

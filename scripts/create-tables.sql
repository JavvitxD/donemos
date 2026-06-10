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
-- ============================================================
-- Donemos — Auth policies + trigger + storage
-- Ejecutar en: https://supabase.com/dashboard/project/uboswvsijbddwygypkic/sql/new
-- ============================================================

-- 1. Trigger: crea registro en usuarios automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre',
    COALESCE(new.raw_user_meta_data->>'rol', 'donante')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Usuarios: políticas RLS
DROP POLICY IF EXISTS "Users can read own record"     ON usuarios;
DROP POLICY IF EXISTS "Users can update own record"   ON usuarios;
DROP POLICY IF EXISTS "Admins full access to usuarios" ON usuarios;

CREATE POLICY "Users can read own record"
  ON usuarios FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON usuarios FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins full access to usuarios"
  ON usuarios FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 3. Fundaciones: políticas RLS
DROP POLICY IF EXISTS "Authenticated can insert fundaciones"  ON fundaciones;
DROP POLICY IF EXISTS "Fundacion owners can update"           ON fundaciones;
DROP POLICY IF EXISTS "Admins full access to fundaciones"     ON fundaciones;

CREATE POLICY "Authenticated can insert fundaciones"
  ON fundaciones FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Fundacion owners can update"
  ON fundaciones FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND fundacion_id = fundaciones.id)
  );

CREATE POLICY "Admins full access to fundaciones"
  ON fundaciones FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 4. Solicitudes: políticas RLS
DROP POLICY IF EXISTS "Fundacion owners can manage solicitudes" ON solicitudes;
DROP POLICY IF EXISTS "Admins full access to solicitudes"       ON solicitudes;

CREATE POLICY "Fundacion owners can manage solicitudes"
  ON solicitudes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND fundacion_id = solicitudes.fundacion_id
    )
  );

CREATE POLICY "Admins full access to solicitudes"
  ON solicitudes FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 5. Donaciones: políticas RLS
DROP POLICY IF EXISTS "Donantes can insert own donaciones"   ON donaciones;
DROP POLICY IF EXISTS "Users can read relevant donaciones"   ON donaciones;
DROP POLICY IF EXISTS "Admins full access to donaciones"     ON donaciones;

CREATE POLICY "Donantes can insert own donaciones"
  ON donaciones FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can read relevant donaciones"
  ON donaciones FOR SELECT USING (
    auth.uid() = usuario_id OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND fundacion_id = donaciones.fundacion_id
    )
  );

CREATE POLICY "Admins full access to donaciones"
  ON donaciones FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 6. Storage: bucket público para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-perfil', 'fotos-perfil', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read profile photos"          ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users update own photos"             ON storage.objects;
DROP POLICY IF EXISTS "Users delete own photos"             ON storage.objects;

CREATE POLICY "Public read profile photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'fotos-perfil');

CREATE POLICY "Authenticated upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fotos-perfil' AND auth.role() = 'authenticated');

CREATE POLICY "Users update own photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'fotos-perfil' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'fotos-perfil' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. Verificar
SELECT 'Trigger creado: ' || trigger_name AS resultado
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

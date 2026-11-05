-- Autorizado para publicar solo lectura de las tres tablas del ejemplo.
-- Se conserva RLS; no se crean politicas de escritura.
BEGIN;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.plan_mps, public.recetas,
  public.requerimientos_mrp TO anon;

CREATE POLICY lectura_demo_mps ON public.plan_mps
  FOR SELECT TO anon USING (true);
CREATE POLICY lectura_demo_recetas ON public.recetas
  FOR SELECT TO anon USING (true);
CREATE POLICY lectura_demo_mrp ON public.requerimientos_mrp
  FOR SELECT TO anon USING (true);
COMMIT;

SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('plan_mps', 'recetas', 'requerimientos_mrp');

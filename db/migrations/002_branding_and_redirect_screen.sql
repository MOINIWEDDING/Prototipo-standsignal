-- ============================================================
-- Migración 002 — perfil del restaurante, marca del dashboard,
-- y pantalla de redirección personalizable.
-- Ejecutar en el SQL Editor de Supabase (una sola vez).
-- ============================================================

-- El campo `timezone` ya existía en el schema original pero no se usaba
-- en ninguna consulta — ahora sí se usa para calcular "hora pico" en la
-- zona horaria real del restaurante, no en UTC (que es donde corre el
-- servidor). Si por algún motivo no existe todavía, esto lo agrega:
alter table restaurants add column if not exists timezone text default 'America/Santo_Domingo';

-- Perfil del restaurante
alter table restaurants add column if not exists logo_url text;

-- Pantalla de redirección personalizable
alter table restaurants add column if not exists redirect_bg_color text default '#111827';
alter table restaurants add column if not exists redirect_bg_image_url text;
alter table restaurants add column if not exists redirect_bg_video_url text;

-- ---------------------------------------------------------
-- STORAGE: bucket público para logos y fondos de la pantalla
-- de redirección. Público porque /tap lo ve gente sin sesión.
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

-- Cualquiera puede LEER (necesario: /tap es una pantalla pública)
drop policy if exists "Lectura pública de restaurant-assets" on storage.objects;
create policy "Lectura pública de restaurant-assets"
  on storage.objects for select
  using (bucket_id = 'restaurant-assets');

-- Cada dueño solo puede subir/editar/borrar DENTRO de su propia carpeta,
-- nombrada con su propio user id: restaurant-assets/<auth.uid()>/archivo.ext
drop policy if exists "Dueños suben a su carpeta" on storage.objects;
create policy "Dueños suben a su carpeta"
  on storage.objects for insert
  with check (bucket_id = 'restaurant-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Dueños actualizan su carpeta" on storage.objects;
create policy "Dueños actualizan su carpeta"
  on storage.objects for update
  using (bucket_id = 'restaurant-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Dueños borran su carpeta" on storage.objects;
create policy "Dueños borran su carpeta"
  on storage.objects for delete
  using (bucket_id = 'restaurant-assets' and (storage.foldername(name))[1] = auth.uid()::text);

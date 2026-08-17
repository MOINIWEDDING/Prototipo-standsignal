-- ============================================================
-- STANDSIGNAL — esquema de producción
-- Ejecutar completo en el SQL editor de Supabase (una sola vez)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- RESTAURANTES (tenants)
-- ---------------------------------------------------------
create table restaurants (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references auth.users(id) not null,
    name text not null,
    menu_url text not null,
    menu_url_updated_at timestamptz default now(),
    plan text default 'free',
    timezone text default 'America/Santo_Domingo',
    is_active boolean default true,
    created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- MESAS (lógicas, las que el dueño nombra desde el panel)
-- ---------------------------------------------------------
create table tables (
    id uuid primary key default gen_random_uuid(),
    restaurant_id uuid references restaurants(id) on delete cascade not null,
    label text not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    unique(restaurant_id, label)
);
create index idx_tables_restaurant on tables(restaurant_id);

-- ---------------------------------------------------------
-- STANDS (identidad física real: el UID del chip NFC o el
-- code corto del QR — nunca se escribe a mano, se genera solo)
-- ---------------------------------------------------------
create table stands (
    id uuid primary key default gen_random_uuid(),
    physical_code text unique not null,       -- {UID} del NFC o {code} del QR
    kind text not null check (kind in ('nfc', 'qr')),
    restaurant_id uuid references restaurants(id) on delete set null,
    table_id uuid references tables(id) on delete set null,
    paired_at timestamptz,
    created_at timestamptz default now()
);
create index idx_stands_code on stands(physical_code);

-- ---------------------------------------------------------
-- EVENTOS DE ESCANEO (alto volumen)
-- ---------------------------------------------------------
create table scan_events (
    id bigserial primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    table_id uuid references tables(id) on delete set null,
    stand_id uuid references stands(id) on delete set null,
    medium text not null check (medium in ('nfc', 'qr')),
    device_os text check (device_os in ('ios', 'android', 'other')),
    user_agent_raw text,
    scanned_at timestamptz not null default now()
);
create index idx_scan_restaurant_date on scan_events(restaurant_id, scanned_at desc);
create index idx_scan_table on scan_events(table_id, scanned_at desc);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY — el dueño solo ve SU negocio
-- ---------------------------------------------------------
alter table restaurants enable row level security;
alter table tables enable row level security;
alter table stands enable row level security;
alter table scan_events enable row level security;

create policy "Dueños ven su restaurante"
    on restaurants for all
    using (owner_id = auth.uid());

create policy "Dueños ven sus mesas"
    on tables for all
    using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

create policy "Dueños ven sus stands"
    on stands for select
    using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

create policy "Dueños ven sus escaneos"
    on scan_events for select
    using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Nota: el endpoint público /tap usa la service_role key (bypassa RLS
-- a propósito) porque no hay sesión de usuario en un escaneo anónimo.
-- Nunca expongas la service_role key en código de cliente/frontend.

-- ---------------------------------------------------------
-- AUTO-APROVISIONAMIENTO: crea el restaurante cuando el correo
-- se confirma. Cubre el caso en que Supabase exige confirmación por
-- email antes de dar sesión (entonces app/signup/page.tsx no alcanza
-- a insertar el restaurante en el mismo request). Si el usuario llega
-- con sesión inmediata (confirmación desactivada), signup ya lo hizo
-- y este trigger simplemente no encuentra nada que hacer (on conflict).
-- ---------------------------------------------------------
create or replace function public.handle_new_user_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    if not exists (select 1 from public.restaurants where owner_id = new.id) then
      insert into public.restaurants (owner_id, name, menu_url)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'restaurant_name', 'Mi restaurante'),
        'https://'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row
  execute function public.handle_new_user_confirmed();

-- ============================================================
-- GESTÃO DE CONVIDADOS v1.5 — ESQUEMA SUPABASE
-- Perfis: administrador global + casal limitado aos casamentos vinculados.
-- Execute em um projeto novo. Para atualizar v1.4, use migration_v1_4_to_v1_5.sql.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'couple' check (role in ('admin','couple')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  event_date date,
  invite_base_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, slug)
);

create table if not exists public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  access_role text not null default 'couple' check (access_role in ('couple')),
  created_at timestamptz not null default now(),
  unique(wedding_id, user_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  token text not null unique check (char_length(token) >= 20),
  display_name text not null check (char_length(display_name) between 1 and 160),
  contact_name text,
  phone text,
  seats integer not null default 1 check (seats between 1 and 50),
  category text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invitation_members (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  sort_order integer not null default 0 check (sort_order between 0 and 49),
  created_at timestamptz not null default now(),
  unique(invitation_id, name)
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.invitations(id) on delete cascade,
  attending boolean not null,
  guest_count integer not null default 0 check (guest_count between 0 and 50),
  submitted_name text,
  guest_names text[] not null default '{}',
  meal_notes text,
  message text,
  responded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists wedding_members_wedding_id_idx on public.wedding_members(wedding_id);
create index if not exists wedding_members_user_id_idx on public.wedding_members(user_id);
create index if not exists invitations_wedding_id_idx on public.invitations(wedding_id);
create index if not exists invitations_token_idx on public.invitations(token);
create index if not exists invitation_members_invitation_id_idx on public.invitation_members(invitation_id);
create index if not exists rsvps_invitation_id_idx on public.rsvps(invitation_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at before update on public.weddings for each row execute function public.set_updated_at();
drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at before update on public.invitations for each row execute function public.set_updated_at();
drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at before update on public.rsvps for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_members enable row level security;
alter table public.rsvps enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.weddings from anon, authenticated;
revoke all on table public.wedding_members from anon, authenticated;
revoke all on table public.invitations from anon, authenticated;
revoke all on table public.invitation_members from anon, authenticated;
revoke all on table public.rsvps from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select, insert, delete on table public.weddings to authenticated;
grant update (name, slug, event_date, invite_base_url) on table public.weddings to authenticated;
grant select, delete on table public.wedding_members to authenticated;
grant select, insert, update, delete on table public.invitations to authenticated;
grant select, insert, update, delete on table public.invitation_members to authenticated;
grant select, insert, update, delete on table public.rsvps to authenticated;

-- PROFILES: cada usuário lê apenas seu próprio perfil.
drop policy if exists "users_select_own_profile" on public.profiles;
create policy "users_select_own_profile" on public.profiles
for select to authenticated
using (user_id = (select auth.uid()));

-- WEDDING MEMBERS: o casal enxerga o próprio vínculo; administrador enxerga todos.
drop policy if exists "members_select_access" on public.wedding_members;
create policy "members_select_access" on public.wedding_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  )
);

drop policy if exists "admins_delete_wedding_members" on public.wedding_members;
create policy "admins_delete_wedding_members" on public.wedding_members
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  )
);

-- WEDDINGS
-- Admin vê tudo. Casal vê somente casamento vinculado. owner_id mantém compatibilidade com versões anteriores.
drop policy if exists "access_select_weddings" on public.weddings;
create policy "access_select_weddings" on public.weddings
for select to authenticated
using (
  owner_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
  or exists (select 1 from public.wedding_members wm where wm.wedding_id = id and wm.user_id = (select auth.uid()))
);

drop policy if exists "admins_insert_weddings" on public.weddings;
create policy "admins_insert_weddings" on public.weddings
for insert to authenticated
with check (
  exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists "access_update_weddings" on public.weddings;
create policy "access_update_weddings" on public.weddings
for update to authenticated
using (
  owner_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
  or exists (select 1 from public.wedding_members wm where wm.wedding_id = id and wm.user_id = (select auth.uid()))
)
with check (
  owner_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
  or exists (select 1 from public.wedding_members wm where wm.wedding_id = id and wm.user_id = (select auth.uid()))
);

drop policy if exists "admins_delete_weddings" on public.weddings;
create policy "admins_delete_weddings" on public.weddings
for delete to authenticated
using (
  exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
);

-- INVITATIONS
-- O acesso acompanha o casamento pai.
drop policy if exists "access_select_invitations" on public.invitations;
create policy "access_select_invitations" on public.invitations
for select to authenticated
using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_insert_invitations" on public.invitations;
create policy "access_insert_invitations" on public.invitations
for insert to authenticated
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_update_invitations" on public.invitations;
create policy "access_update_invitations" on public.invitations
for update to authenticated
using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
)
with check (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_delete_invitations" on public.invitations;
create policy "access_delete_invitations" on public.invitations
for delete to authenticated
using (
  exists (
    select 1 from public.weddings w
    where w.id = wedding_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

-- INVITATION MEMBERS
drop policy if exists "access_select_invitation_members" on public.invitation_members;
create policy "access_select_invitation_members" on public.invitation_members
for select to authenticated
using (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_insert_invitation_members" on public.invitation_members;
create policy "access_insert_invitation_members" on public.invitation_members
for insert to authenticated
with check (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_update_invitation_members" on public.invitation_members;
create policy "access_update_invitation_members" on public.invitation_members
for update to authenticated
using (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
)
with check (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_delete_invitation_members" on public.invitation_members;
create policy "access_delete_invitation_members" on public.invitation_members
for delete to authenticated
using (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

-- RSVPS: painel autenticado. O RSVP público continua sendo gravado pela Edge Function invite-public.
drop policy if exists "access_select_rsvps" on public.rsvps;
create policy "access_select_rsvps" on public.rsvps
for select to authenticated
using (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_insert_rsvps" on public.rsvps;
create policy "access_insert_rsvps" on public.rsvps
for insert to authenticated
with check (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_update_rsvps" on public.rsvps;
create policy "access_update_rsvps" on public.rsvps
for update to authenticated
using (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
)
with check (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

drop policy if exists "access_delete_rsvps" on public.rsvps;
create policy "access_delete_rsvps" on public.rsvps
for delete to authenticated
using (
  exists (
    select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id
    where i.id = invitation_id and (
      w.owner_id = (select auth.uid())
      or exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'admin')
      or exists (select 1 from public.wedding_members wm where wm.wedding_id = w.id and wm.user_id = (select auth.uid()))
    )
  )
);

-- IMPORTANTE: após criar o primeiro usuário no Supabase Auth, promova-o a administrador:
-- insert into public.profiles (user_id, email, display_name, role)
-- values ('UUID_DO_USUARIO', 'admin@seudominio.com', 'Administrador', 'admin')
-- on conflict (user_id) do update set role='admin', email=excluded.email, display_name=excluded.display_name;

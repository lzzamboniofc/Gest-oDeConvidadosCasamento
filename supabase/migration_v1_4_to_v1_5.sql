-- ============================================================
-- MIGRAÇÃO v1.4 -> v1.5
-- Adiciona perfis, vínculo casal/casamento e novas políticas RLS.
-- Faça backup antes de aplicar em produção.
-- ============================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'couple' check (role in ('admin','couple')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists wedding_members_wedding_id_idx on public.wedding_members(wedding_id);
create index if not exists wedding_members_user_id_idx on public.wedding_members(user_id);


drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.wedding_members enable row level security;

-- Impede que uma conta de casal altere owner_id diretamente.
revoke update on table public.weddings from authenticated;
grant update (name, slug, event_date, invite_base_url) on table public.weddings to authenticated;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.wedding_members from anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, delete on table public.wedding_members to authenticated;

drop policy if exists "users_select_own_profile" on public.profiles;
create policy "users_select_own_profile" on public.profiles for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "members_select_access" on public.wedding_members;
create policy "members_select_access" on public.wedding_members for select to authenticated using (
  user_id = (select auth.uid()) or exists (select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
);

drop policy if exists "admins_delete_wedding_members" on public.wedding_members;
create policy "admins_delete_wedding_members" on public.wedding_members for delete to authenticated using (
  exists (select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
);

-- Remove políticas antigas da v1.4.
drop policy if exists "owners_select_weddings" on public.weddings;
drop policy if exists "owners_insert_weddings" on public.weddings;
drop policy if exists "owners_update_weddings" on public.weddings;
drop policy if exists "owners_delete_weddings" on public.weddings;
drop policy if exists "owners_select_invitations" on public.invitations;
drop policy if exists "owners_insert_invitations" on public.invitations;
drop policy if exists "owners_update_invitations" on public.invitations;
drop policy if exists "owners_delete_invitations" on public.invitations;
drop policy if exists "owners_select_invitation_members" on public.invitation_members;
drop policy if exists "owners_insert_invitation_members" on public.invitation_members;
drop policy if exists "owners_update_invitation_members" on public.invitation_members;
drop policy if exists "owners_delete_invitation_members" on public.invitation_members;
drop policy if exists "owners_select_rsvps" on public.rsvps;
drop policy if exists "owners_insert_rsvps" on public.rsvps;
drop policy if exists "owners_update_rsvps" on public.rsvps;
drop policy if exists "owners_delete_rsvps" on public.rsvps;

-- WEDDINGS
drop policy if exists "access_select_weddings" on public.weddings;
create policy "access_select_weddings" on public.weddings for select to authenticated using (
  owner_id=(select auth.uid())
  or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
  or exists(select 1 from public.wedding_members wm where wm.wedding_id=id and wm.user_id=(select auth.uid()))
);

drop policy if exists "admins_insert_weddings" on public.weddings;
create policy "admins_insert_weddings" on public.weddings for insert to authenticated with check (
  exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
);

drop policy if exists "access_update_weddings" on public.weddings;
create policy "access_update_weddings" on public.weddings for update to authenticated
using (
  owner_id=(select auth.uid())
  or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
  or exists(select 1 from public.wedding_members wm where wm.wedding_id=id and wm.user_id=(select auth.uid()))
)
with check (
  owner_id=(select auth.uid())
  or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
  or exists(select 1 from public.wedding_members wm where wm.wedding_id=id and wm.user_id=(select auth.uid()))
);

drop policy if exists "admins_delete_weddings" on public.weddings;
create policy "admins_delete_weddings" on public.weddings for delete to authenticated using (
  exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
);

-- INVITATIONS
drop policy if exists "access_select_invitations" on public.invitations;
create policy "access_select_invitations" on public.invitations for select to authenticated using (
  exists(select 1 from public.weddings w where w.id=wedding_id and (
    w.owner_id=(select auth.uid())
    or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
    or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

drop policy if exists "access_insert_invitations" on public.invitations;
create policy "access_insert_invitations" on public.invitations for insert to authenticated with check (
  exists(select 1 from public.weddings w where w.id=wedding_id and (
    w.owner_id=(select auth.uid())
    or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin')
    or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

drop policy if exists "access_update_invitations" on public.invitations;
create policy "access_update_invitations" on public.invitations for update to authenticated
using (exists(select 1 from public.weddings w where w.id=wedding_id and (
  w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
)))
with check (exists(select 1 from public.weddings w where w.id=wedding_id and (
  w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
)));

drop policy if exists "access_delete_invitations" on public.invitations;
create policy "access_delete_invitations" on public.invitations for delete to authenticated using (
  exists(select 1 from public.weddings w where w.id=wedding_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

-- INVITATION MEMBERS
drop policy if exists "access_select_invitation_members" on public.invitation_members;
create policy "access_select_invitation_members" on public.invitation_members for select to authenticated using (
  exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

drop policy if exists "access_insert_invitation_members" on public.invitation_members;
create policy "access_insert_invitation_members" on public.invitation_members for insert to authenticated with check (
  exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

drop policy if exists "access_update_invitation_members" on public.invitation_members;
create policy "access_update_invitation_members" on public.invitation_members for update to authenticated
using (exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
  w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
)))
with check (exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
  w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
)));

drop policy if exists "access_delete_invitation_members" on public.invitation_members;
create policy "access_delete_invitation_members" on public.invitation_members for delete to authenticated using (
  exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

-- RSVPS
drop policy if exists "access_select_rsvps" on public.rsvps;
create policy "access_select_rsvps" on public.rsvps for select to authenticated using (
  exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

drop policy if exists "access_insert_rsvps" on public.rsvps;
create policy "access_insert_rsvps" on public.rsvps for insert to authenticated with check (
  exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

drop policy if exists "access_update_rsvps" on public.rsvps;
create policy "access_update_rsvps" on public.rsvps for update to authenticated
using (exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
  w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
)))
with check (exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
  w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
)));

drop policy if exists "access_delete_rsvps" on public.rsvps;
create policy "access_delete_rsvps" on public.rsvps for delete to authenticated using (
  exists(select 1 from public.invitations i join public.weddings w on w.id=i.wedding_id where i.id=invitation_id and (
    w.owner_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role='admin') or exists(select 1 from public.wedding_members wm where wm.wedding_id=w.id and wm.user_id=(select auth.uid()))
  ))
);

-- Depois de aplicar, crie/promova o perfil do primeiro administrador (use o UUID do Auth > Users):
-- insert into public.profiles (user_id,email,display_name,role)
-- values ('UUID_DO_ADMIN','admin@seudominio.com','Administrador','admin')
-- on conflict (user_id) do update set role='admin', email=excluded.email, display_name=excluded.display_name;

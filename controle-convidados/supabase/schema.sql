-- ============================================================
-- GESTÃO DE CONVIDADOS — ESQUEMA SUPABASE
-- Execute uma vez no SQL Editor do projeto escolhido.
-- ============================================================

create extension if not exists pgcrypto;

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

 drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at before update on public.weddings for each row execute function public.set_updated_at();
 drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at before update on public.invitations for each row execute function public.set_updated_at();
 drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at before update on public.rsvps for each row execute function public.set_updated_at();

alter table public.weddings enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_members enable row level security;
alter table public.rsvps enable row level security;

revoke all on table public.weddings from anon, authenticated;
revoke all on table public.invitations from anon, authenticated;
revoke all on table public.invitation_members from anon, authenticated;
revoke all on table public.rsvps from anon, authenticated;

grant select, insert, update, delete on table public.weddings to authenticated;
grant select, insert, update, delete on table public.invitations to authenticated;
grant select, insert, update, delete on table public.invitation_members to authenticated;
grant select, insert, update, delete on table public.rsvps to authenticated;

-- WEDDINGS
 drop policy if exists "owners_select_weddings" on public.weddings;
create policy "owners_select_weddings" on public.weddings for select to authenticated using ((select auth.uid()) = owner_id);
 drop policy if exists "owners_insert_weddings" on public.weddings;
create policy "owners_insert_weddings" on public.weddings for insert to authenticated with check ((select auth.uid()) = owner_id);
 drop policy if exists "owners_update_weddings" on public.weddings;
create policy "owners_update_weddings" on public.weddings for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
 drop policy if exists "owners_delete_weddings" on public.weddings;
create policy "owners_delete_weddings" on public.weddings for delete to authenticated using ((select auth.uid()) = owner_id);

-- INVITATIONS
 drop policy if exists "owners_select_invitations" on public.invitations;
create policy "owners_select_invitations" on public.invitations for select to authenticated using (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_insert_invitations" on public.invitations;
create policy "owners_insert_invitations" on public.invitations for insert to authenticated with check (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_update_invitations" on public.invitations;
create policy "owners_update_invitations" on public.invitations for update to authenticated using (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid()))) with check (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_delete_invitations" on public.invitations;
create policy "owners_delete_invitations" on public.invitations for delete to authenticated using (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));

-- INVITATION MEMBERS
 drop policy if exists "owners_select_invitation_members" on public.invitation_members;
create policy "owners_select_invitation_members" on public.invitation_members for select to authenticated using (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_insert_invitation_members" on public.invitation_members;
create policy "owners_insert_invitation_members" on public.invitation_members for insert to authenticated with check (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_update_invitation_members" on public.invitation_members;
create policy "owners_update_invitation_members" on public.invitation_members for update to authenticated using (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid()))) with check (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_delete_invitation_members" on public.invitation_members;
create policy "owners_delete_invitation_members" on public.invitation_members for delete to authenticated using (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));

-- RSVPS (leitura/admin apenas para o dono do casamento)
 drop policy if exists "owners_select_rsvps" on public.rsvps;
create policy "owners_select_rsvps" on public.rsvps for select to authenticated using (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_insert_rsvps" on public.rsvps;
create policy "owners_insert_rsvps" on public.rsvps for insert to authenticated with check (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_update_rsvps" on public.rsvps;
create policy "owners_update_rsvps" on public.rsvps for update to authenticated using (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid()))) with check (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));
 drop policy if exists "owners_delete_rsvps" on public.rsvps;
create policy "owners_delete_rsvps" on public.rsvps for delete to authenticated using (exists (select 1 from public.invitations i join public.weddings w on w.id = i.wedding_id where i.id = invitation_id and w.owner_id = (select auth.uid())));

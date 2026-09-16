-- Migração v1.2 -> v1.3
-- Execute somente se o schema da v1.2 já foi aplicado.

create table if not exists public.invitation_members (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  sort_order integer not null default 0 check (sort_order between 0 and 49),
  created_at timestamptz not null default now(),
  unique(invitation_id, name)
);

create index if not exists invitation_members_invitation_id_idx on public.invitation_members(invitation_id);

alter table public.invitation_members enable row level security;
revoke all on table public.invitation_members from anon, authenticated;
grant select, insert, update, delete on table public.invitation_members to authenticated;

drop policy if exists "owners_select_invitation_members" on public.invitation_members;
create policy "owners_select_invitation_members" on public.invitation_members for select to authenticated
using (exists (
  select 1 from public.invitations i
  join public.weddings w on w.id = i.wedding_id
  where i.id = invitation_id and w.owner_id = (select auth.uid())
));

drop policy if exists "owners_insert_invitation_members" on public.invitation_members;
create policy "owners_insert_invitation_members" on public.invitation_members for insert to authenticated
with check (exists (
  select 1 from public.invitations i
  join public.weddings w on w.id = i.wedding_id
  where i.id = invitation_id and w.owner_id = (select auth.uid())
));

drop policy if exists "owners_update_invitation_members" on public.invitation_members;
create policy "owners_update_invitation_members" on public.invitation_members for update to authenticated
using (exists (
  select 1 from public.invitations i
  join public.weddings w on w.id = i.wedding_id
  where i.id = invitation_id and w.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.invitations i
  join public.weddings w on w.id = i.wedding_id
  where i.id = invitation_id and w.owner_id = (select auth.uid())
));

drop policy if exists "owners_delete_invitation_members" on public.invitation_members;
create policy "owners_delete_invitation_members" on public.invitation_members for delete to authenticated
using (exists (
  select 1 from public.invitations i
  join public.weddings w on w.id = i.wedding_id
  where i.id = invitation_id and w.owner_id = (select auth.uid())
));

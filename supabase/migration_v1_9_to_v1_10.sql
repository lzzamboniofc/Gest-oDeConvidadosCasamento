-- ============================================================
-- MIGRAÇÃO v1.9 -> v1.10
-- Corrige a política RLS de acesso do casal à tabela weddings.
-- O `id` não qualificado dentro da subquery era resolvido como
-- wedding_members.id, impedindo o vínculo por wedding_id.
-- ============================================================

drop policy if exists "access_select_weddings" on public.weddings;
create policy "access_select_weddings" on public.weddings
for select to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  )
  or exists (
    select 1 from public.wedding_members wm
    where wm.wedding_id = weddings.id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists "access_update_weddings" on public.weddings;
create policy "access_update_weddings" on public.weddings
for update to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  )
  or exists (
    select 1 from public.wedding_members wm
    where wm.wedding_id = weddings.id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  )
  or exists (
    select 1 from public.wedding_members wm
    where wm.wedding_id = weddings.id
      and wm.user_id = (select auth.uid())
  )
);

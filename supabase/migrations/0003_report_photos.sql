-- Civico - Fase C (3): foto delle segnalazioni su Storage
--
-- Aggiunge la colonna photo_url alle segnalazioni e crea il bucket Storage
-- "report-photos" (pubblico in lettura). Le foto vere vengono caricate qui;
-- la colonna photo resta come placeholder grafico per il seed/demo.
--
-- Da eseguire una volta nel SQL Editor, dopo 0002_reports.sql.

alter table public.reports add column if not exists photo_url text;

-- Ricrea la vista pubblica includendo photo_url (in coda, come richiede
-- create or replace view).
create or replace view public.reports_public with (security_invoker = off) as
select
  r.id,
  r.cat,
  r.title,
  r.note,
  r.where_label,
  r.lat,
  r.lng,
  r.photo,
  r.anon,
  r.status,
  r.created_at,
  case when r.anon then null else r.author_label end as author_label,
  r.base_confirms         + coalesce(c.confirms, 0)          as confirms,
  r.base_recent6h         + coalesce(c.recent6h, 0)          as recent6h,
  r.base_resolution_votes + coalesce(c.resolution_votes, 0)  as resolution_votes,
  r.photo_url
from public.reports r
left join lateral (
  select
    count(*) filter (where kind in ('visto', 'peggiorata'))                                                  as confirms,
    count(*) filter (where kind in ('visto', 'peggiorata') and created_at > now() - interval '6 hours')      as recent6h,
    count(*) filter (where kind = 'risolta')                                                                 as resolution_votes
  from public.confirmations
  where report_id = r.id
) c on true;

grant select on public.reports_public to anon, authenticated;

-- ── Storage bucket per le foto (pubblico in lettura) ────────────────────────
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

-- Lettura pubblica degli oggetti del bucket.
drop policy if exists "report_photos_read" on storage.objects;
create policy "report_photos_read" on storage.objects
  for select using (bucket_id = 'report-photos');

-- Upload consentito agli utenti autenticati nel bucket.
drop policy if exists "report_photos_insert" on storage.objects;
create policy "report_photos_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'report-photos');

-- Ognuno puo' eliminare i propri file caricati.
drop policy if exists "report_photos_delete" on storage.objects;
create policy "report_photos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'report-photos' and owner = auth.uid());

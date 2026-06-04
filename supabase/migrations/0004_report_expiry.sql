-- Civico - Fase C (4): scadenza reale delle segnalazioni
--
-- Le segnalazioni hanno una vita (come l'etichetta "Attiva ancora X giorni"):
--   disservizi 4 giorni, sicurezza 7 giorni, risolte 14 giorni,
--   estesa di 30 minuti per ogni conferma, fino a un massimo di 30 giorni.
-- Quando la superano vengono ARCHIVIATE (non cancellate: resta memoria), e la
-- vista pubblica le esclude, quindi spariscono dall'app.
--
-- Lo scheduling e' lato DB con pg_cron (nessun servizio esterno).
-- Da eseguire una volta nel SQL Editor, dopo 0003_report_photos.sql.

-- 1) Consenti lo stato 'archiviata'.
alter table public.reports drop constraint if exists reports_status_check;
alter table public.reports
  add constraint reports_status_check check (status in ('attiva', 'risolta', 'archiviata'));

-- 2) Funzione che archivia le segnalazioni scadute (definer: bypassa la RLS).
create or replace function public.archive_expired_reports()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  with vita as (
    select
      r.id,
      r.created_at
        + least(
            case
              when r.cat = 'risolto' then interval '14 days'
              when r.cat in ('furtoAuto', 'furtoCasa', 'vandalismo') then interval '7 days'
              else interval '4 days'
            end
            + (
                r.base_confirms
                + coalesce((
                    select count(*) from public.confirmations c
                    where c.report_id = r.id and c.kind in ('visto', 'peggiorata')
                  ), 0)
              ) * interval '30 minutes',
            interval '30 days'
          ) as scade_il
    from public.reports r
    where r.status <> 'archiviata'
  )
  update public.reports
  set status = 'archiviata'
  where id in (select id from vita where now() > scade_il);

  get diagnostics n = row_count;
  return n;
end;
$$;

-- 3) La vista pubblica esclude le archiviate (spariscono dall'app).
create or replace view public.reports_public with (security_invoker = off) as
select
  r.id, r.cat, r.title, r.note, r.where_label, r.lat, r.lng, r.photo, r.anon, r.status, r.created_at,
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
) c on true
where r.status <> 'archiviata';

grant select on public.reports_public to anon, authenticated;

-- 4) Schedulazione giornaliera con pg_cron (03:00 UTC).
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('archive-expired-reports');
exception when others then
  null; -- il job non esisteva ancora
end $$;

select cron.schedule(
  'archive-expired-reports',
  '0 3 * * *',
  $$ select public.archive_expired_reports(); $$
);

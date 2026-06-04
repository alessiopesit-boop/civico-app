-- Civico - Fase C (5): profili pubblici (vista limitata)
--
-- Permette di toccare l'autore di una segnalazione (non anonima) e vederne un
-- profilo PUBBLICO con i soli campi sicuri: "Nome C." e da quando e' iscritto.
-- Mai email, mai data di nascita, mai il cognome intero.
--
-- - reports_public ora espone author_id SOLO per le segnalazioni non anonime
--   (le anonime restano non tracciabili).
-- - public_profiles: vista (security definer) coi soli campi safe dei profili.
--
-- Da eseguire una volta nel SQL Editor, dopo 0004_report_expiry.sql.

create or replace view public.reports_public with (security_invoker = off) as
select
  r.id, r.cat, r.title, r.note, r.where_label, r.lat, r.lng, r.photo, r.anon, r.status, r.created_at,
  case when r.anon then null else r.author_label end as author_label,
  r.base_confirms         + coalesce(c.confirms, 0)          as confirms,
  r.base_recent6h         + coalesce(c.recent6h, 0)          as recent6h,
  r.base_resolution_votes + coalesce(c.resolution_votes, 0)  as resolution_votes,
  r.photo_url,
  case when r.anon then null else r.author_id end as author_id
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

-- Profilo pubblico: solo campi sicuri.
create or replace view public.public_profiles with (security_invoker = off) as
select
  p.id,
  p.nome || ' ' || upper(left(p.cognome, 1)) || '.' as display_name,
  p.created_at as member_since
from public.profiles p;

grant select on public.public_profiles to anon, authenticated;

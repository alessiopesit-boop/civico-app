-- Civico - Fase C (2): segnalazioni reali e condivise
--
-- Modello:
--  - reports: la segnalazione. id numerico (bigint) per restare compatibile con
--    l'app che usa id numerici ovunque. author_id punta al profilo.
--  - confirmations: le reazioni (visto/peggiorata/risolta), una riga per
--    (segnalazione, utente, tipo) cosi' non si conferma due volte.
--  - reports_public: VISTA pubblica (security definer) che espone a tutti gli
--    utenti SOLO i campi sicuri (niente author_id; etichetta autore nascosta se
--    anonima) + i contatori aggregati. E' da qui che l'app legge l'elenco.
--
-- Privacy: la tabella reports lascia leggere via RLS solo le PROPRIE righe;
-- gli altri vedono le segnalazioni solo attraverso la vista, che non espone mai
-- chi le ha scritte se anonime.
--
-- Da eseguire una volta nel SQL Editor di Supabase, dopo 0001_profiles.sql.

create table if not exists public.reports (
  id                    bigint generated always as identity primary key,
  author_id             uuid references public.profiles (id) on delete set null,
  author_label          text,                       -- "Marco T." denormalizzato (null se anonima)
  cat                   text not null,
  title                 text not null check (char_length(title) between 1 and 120),
  note                  text,
  where_label           text,
  lat                   double precision,
  lng                   double precision,
  photo                 text,                        -- placeholder finche' non c'e' lo Storage (#29)
  anon                  boolean not null default false,
  status                text not null default 'attiva' check (status in ('attiva', 'risolta')),
  -- baseline per i dati demo: i contatori reali si sommano a questi
  base_confirms         integer not null default 0,
  base_recent6h         integer not null default 0,
  base_resolution_votes integer not null default 0,
  created_at            timestamptz not null default now()
);

create table if not exists public.confirmations (
  id          bigint generated always as identity primary key,
  report_id   bigint not null references public.reports (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('visto', 'peggiorata', 'risolta')),
  created_at  timestamptz not null default now(),
  unique (report_id, user_id, kind)
);

create index if not exists idx_confirmations_report on public.confirmations (report_id);

-- ── RLS sulle tabelle base ────────────────────────────────────────────────
alter table public.reports enable row level security;
alter table public.confirmations enable row level security;

-- reports: leggi solo le tue righe in chiaro (gli altri passano dalla vista),
-- inserisci solo a tuo nome, elimina solo le tue.
drop policy if exists "reports_select_proprie" on public.reports;
create policy "reports_select_proprie" on public.reports
  for select using (auth.uid() = author_id);

drop policy if exists "reports_insert_proprie" on public.reports;
create policy "reports_insert_proprie" on public.reports
  for insert with check (auth.uid() = author_id);

drop policy if exists "reports_delete_proprie" on public.reports;
create policy "reports_delete_proprie" on public.reports
  for delete using (auth.uid() = author_id);

-- confirmations: leggi solo le tue (per sapere cosa hai gia' votato),
-- inserisci solo a tuo nome.
drop policy if exists "conf_select_proprie" on public.confirmations;
create policy "conf_select_proprie" on public.confirmations
  for select using (auth.uid() = user_id);

drop policy if exists "conf_insert_proprie" on public.confirmations;
create policy "conf_insert_proprie" on public.confirmations
  for insert with check (auth.uid() = user_id);

-- ── Vista pubblica (security definer): elenco condiviso, niente dati autore ──
create or replace view public.reports_public
with (security_invoker = off) as
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
  r.base_confirms
    + coalesce(c.confirms, 0)            as confirms,
  r.base_recent6h
    + coalesce(c.recent6h, 0)            as recent6h,
  r.base_resolution_votes
    + coalesce(c.resolution_votes, 0)    as resolution_votes
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

-- ── Seed: le 9 segnalazioni demo come contenuto della community ──────────────
insert into public.reports
  (author_label, cat, title, note, where_label, lat, lng, photo, anon, status, base_confirms, base_recent6h, base_resolution_votes, created_at)
values
  ('Marco T.',  'buca',       'Buca profonda all''incrocio',        null, 'Via Garibaldi, 42', 41.8896, 12.4695, 'asphalt', false, 'attiva',  47, 23, 0, now() - interval '12 minutes'),
  (null,        'furtoAuto',  'Tentato furto Fiat Panda',           null, 'P.za Mazzini',      41.8872, 12.4661, 'night',   true,  'attiva',  23, 18, 0, now() - interval '34 minutes'),
  ('Sofia R.',  'risolto',    'Lampione riparato, finalmente',      null, 'Via Roma, 12',      41.8910, 12.4720, 'street',  false, 'risolta', 89, 12, 5, now() - interval '2 hours'),
  ('Luca B.',   'albero',     'Ramo grosso pericolante',            null, 'Viale dei Pini',    41.8920, 12.4650, 'tree',    false, 'attiva',  31, 14, 1, now() - interval '3 hours'),
  (null,        'vandalismo', 'Panchine parco rotte stanotte',      null, 'Parco Verdi',       41.8885, 12.4738, 'park',    true,  'attiva',  56, 31, 0, now() - interval '5 hours'),
  ('Andrea V.', 'lampione',   'Tre lampioni spenti da giovedi',     null, 'Via dei Mille',     41.8860, 12.4705, 'dark',    false, 'attiva',  19,  4, 2, now() - interval '8 hours'),
  (null,        'furtoCasa',  'Tentativo scasso piano terra',       null, 'Via San Marco',     41.8902, 12.4670, 'door',    true,  'attiva',  71,  3, 0, now() - interval '1 day'),
  ('Giulia M.', 'risolto',    'Buca asfaltata in Piazza',           null, 'P.za del Popolo',   41.8908, 12.4760, 'fixed',   false, 'risolta', 112, 0, 8, now() - interval '1 day'),
  ('Chiara P.', 'rifiuti',    'Sacchi accumulati da 4 giorni',      null, 'Via dei Banchi',    41.8878, 12.4688, 'asphalt', false, 'attiva',  28,  6, 0, now() - interval '1 day');

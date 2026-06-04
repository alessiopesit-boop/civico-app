-- Civico - Fase C (1): tabella profili
-- Una riga per utente, collegata a auth.users. Nome e cognome sono privati
-- (agli altri si mostra solo "Nome C."), la data di nascita serve al cancello
-- dei 14 anni e non viene mai esposta ad altri utenti.
--
-- Da eseguire una volta nel SQL Editor di Supabase.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null check (char_length(trim(nome)) between 1 and 60),
  cognome     text not null check (char_length(trim(cognome)) between 1 and 60),
  birth_date  date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row Level Security: ognuno vede e modifica solo il proprio profilo.
alter table public.profiles enable row level security;

drop policy if exists "profili_select_proprio" on public.profiles;
create policy "profili_select_proprio" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profili_insert_proprio" on public.profiles;
create policy "profili_insert_proprio" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profili_update_proprio" on public.profiles;
create policy "profili_update_proprio" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cancello dei 14 anni + data di nascita non modificabile dopo il primo
-- salvataggio. Sta nel DB (trigger), quindi non e' aggirabile dal frontend.
-- (current_date non e' immutable: serve un trigger, non un CHECK constraint.)
create or replace function public.profiles_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.birth_date <> old.birth_date then
    raise exception 'La data di nascita non puo essere modificata.'
      using errcode = 'check_violation';
  end if;

  if new.birth_date > (current_date - interval '14 years') then
    raise exception 'Devi avere almeno 14 anni per usare Civico.'
      using errcode = 'check_violation';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
  before insert or update on public.profiles
  for each row execute function public.profiles_guard();

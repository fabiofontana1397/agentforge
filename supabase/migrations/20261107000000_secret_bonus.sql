-- Campionato cene: BONUS SEGRETO X2
-- Schema minimale + sicurezza del bonus segreto.
-- Le categorie "normali" (ambiente, servizio, originalita) sono segnaposto: adattale.

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid not null references auth.users(id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  host_couple_id uuid not null references public.couples(id),
  title text,
  starts_at timestamptz not null
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  voter_id uuid not null default auth.uid() references auth.users(id),
  category text not null check (category in
    ('ambiente','servizio','originalita','antipasto','primo','secondo','dolce')),
  score int not null check (score between 1 and 10),
  unique (event_id, voter_id, category)
);

alter table public.couples enable row level security;
alter table public.events enable row level security;
alter table public.votes enable row level security;

create policy couples_read on public.couples for select to authenticated using (true);
create policy events_read on public.events for select to authenticated using (true);

-- I voti si inseriscono a cena iniziata, non dall'ospitante. Nessuno legge i voti altrui.
create policy votes_insert on public.votes for insert to authenticated
  with check (
    voter_id = auth.uid()
    and exists (select 1 from public.events e join public.couples c on c.id = e.host_couple_id
                where e.id = event_id and e.starts_at <= now() and c.user_id <> auth.uid())
  );
create policy votes_own_read on public.votes for select to authenticated
  using (voter_id = auth.uid());

-- ───────────── Bonus segreto ─────────────
create table public.event_secret_bonus (
  event_id uuid primary key references public.events(id),
  course text not null check (course in ('antipasto','primo','secondo','dolce')),
  locked_at timestamptz not null default now()
);

-- RLS attiva, NESSUNA policy, nessun grant: invisibile a tutti i client (admin incluso).
alter table public.event_secret_bonus enable row level security;
revoke all on public.event_secret_bonus from anon, authenticated;

-- Scelta congelata: niente update/delete, mai.
create function public.block_bonus_mutation() returns trigger
language plpgsql as $$ begin raise exception 'Il bonus segreto e'' congelato'; end $$;
create trigger secret_bonus_frozen before update or delete on public.event_secret_bonus
  for each row execute function public.block_bonus_mutation();

create function public.set_secret_bonus(p_event uuid, p_course text) returns void
language plpgsql security definer set search_path = public as $$
declare v_start timestamptz;
begin
  select e.starts_at into v_start
    from events e join couples c on c.id = e.host_couple_id
    where e.id = p_event and c.user_id = auth.uid();
  if v_start is null then raise exception 'Non sei la coppia ospitante'; end if;
  if now() >= v_start then raise exception 'La cena e'' iniziata: scelta non piu'' possibile'; end if;
  begin
    insert into event_secret_bonus(event_id, course) values (p_event, p_course);
  exception when unique_violation then
    raise exception 'Bonus gia'' scelto e congelato';
  end;
end $$;

-- Dice solo SE il bonus e' stato scelto (mai quale), solo all'ospitante.
create function public.has_secret_bonus(p_event uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from event_secret_bonus b
    join events e on e.id = b.event_id join couples c on c.id = e.host_couple_id
    where b.event_id = p_event and c.user_id = auth.uid());
$$;

-- ───────────── Final Night ─────────────
-- step: 0 chiusa, 1 busta+nome, 2 categorie normali, 3 le 4 portate, 4 suspense,
--       5 rivela portata bonus, 6 raddoppio, 7 totale
create table public.final_night_state (
  id int primary key check (id = 1),
  event_id uuid references public.events(id),
  step int not null default 0 check (step between 0 and 7),
  updated_at timestamptz not null default now()
);
insert into public.final_night_state(id) values (1);
alter table public.final_night_state enable row level security;
create policy fn_state_read on public.final_night_state for select to authenticated using (true);
alter publication supabase_realtime add table public.final_night_state;

create function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- Solo l'admin fa avanzare la cerimonia, un passo alla volta.
create function public.advance_final_night(p_event uuid) returns void
language plpgsql security definer set search_path = public as $$
declare st final_night_state;
begin
  if not is_admin() then raise exception 'Solo admin'; end if;
  select * into st from final_night_state where id = 1 for update;
  if st.event_id is distinct from p_event then
    update final_night_state set event_id = p_event, step = 1, updated_at = now() where id = 1;
  elsif st.step < 7 then
    update final_night_state set step = st.step + 1, updated_at = now() where id = 1;
  end if;
end $$;

-- Dati della busta, filtrati per passo: il bonus esce solo da step >= 5.
create function public.get_envelope(p_event uuid) returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare
  st final_night_state; r jsonb; v_bonus text;
  v_normal jsonb; v_courses jsonb; v_normal_sum int; v_courses_sum int; v_bonus_pts int;
begin
  if auth.uid() is null then raise exception 'Non autenticato'; end if;
  select * into st from final_night_state where id = 1;
  r := jsonb_build_object('step', st.step, 'updated_at', st.updated_at);
  if st.event_id is distinct from p_event or st.step < 1 then
    return jsonb_build_object('step', 0);
  end if;

  select jsonb_build_object('couple', c.name) into v_normal
    from events e join couples c on c.id = e.host_couple_id where e.id = p_event;
  r := r || v_normal;

  select coalesce(jsonb_agg(jsonb_build_object('category', category, 'points', pts)), '[]'),
         coalesce(sum(pts), 0)
    into v_normal, v_normal_sum
    from (select category, sum(score)::int pts from votes
          where event_id = p_event and category in ('ambiente','servizio','originalita')
          group by category) t;
  if st.step >= 2 then r := r || jsonb_build_object('normal', v_normal); end if;

  select coalesce(jsonb_agg(jsonb_build_object('course', category, 'points', pts)), '[]'),
         coalesce(sum(pts), 0)
    into v_courses, v_courses_sum
    from (select category, sum(score)::int pts from votes
          where event_id = p_event and category in ('antipasto','primo','secondo','dolce')
          group by category) t;
  if st.step >= 3 then r := r || jsonb_build_object('courses', v_courses); end if;

  select course into v_bonus from event_secret_bonus where event_id = p_event;
  if st.step >= 5 and v_bonus is not null then
    select coalesce(sum(score), 0)::int into v_bonus_pts
      from votes where event_id = p_event and category = v_bonus;
    r := r || jsonb_build_object('bonus_course', v_bonus);
    if st.step >= 7 then
      r := r || jsonb_build_object('total', v_normal_sum + v_courses_sum + v_bonus_pts);
    end if;
  elsif st.step >= 7 then
    r := r || jsonb_build_object('total', v_normal_sum + v_courses_sum);
  end if;
  return r;
end $$;

revoke all on function public.set_secret_bonus, public.has_secret_bonus,
  public.advance_final_night, public.get_envelope from public, anon;
grant execute on function public.set_secret_bonus, public.has_secret_bonus,
  public.advance_final_night, public.get_envelope to authenticated;

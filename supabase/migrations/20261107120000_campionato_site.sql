-- Sito del campionato: ogni utente registra la propria coppia e le proprie cene.
-- Nota: events NON ha policy di update, quindi la data d'inizio (e il congelamento del bonus) non e' modificabile.

create unique index couples_one_per_user on public.couples(user_id);

create policy couples_insert on public.couples for insert to authenticated
  with check (user_id = auth.uid());

create policy events_insert on public.events for insert to authenticated
  with check (
    starts_at > now()
    and exists (select 1 from public.couples c where c.id = host_couple_id and c.user_id = auth.uid())
  );

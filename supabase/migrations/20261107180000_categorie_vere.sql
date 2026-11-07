-- Categorie vere del campionato.
-- Normali: mise_en_place, budget, tempistiche. Portate: antipasto, primo, secondo, dolce.

-- Converte eventuali voti di prova gia' inseriti con le categorie segnaposto.
update public.votes set category = case category
  when 'ambiente' then 'mise_en_place'
  when 'servizio' then 'budget'
  when 'originalita' then 'tempistiche'
  else category end;

alter table public.votes drop constraint votes_category_check;
alter table public.votes add constraint votes_category_check check (category in
  ('mise_en_place','antipasto','primo','secondo','dolce','budget','tempistiche'));

create or replace function public.get_envelope(p_event uuid) returns jsonb
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
          where event_id = p_event and category in ('mise_en_place','budget','tempistiche')
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

revoke all on function public.get_envelope(uuid) from public, anon;
grant execute on function public.get_envelope(uuid) to authenticated;

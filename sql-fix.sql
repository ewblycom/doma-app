create or replace function public.create_household(p_name text default 'Дом')
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
  row_h public.households;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'already in a household';
  end if;
  loop
    code := lpad((100000 + floor(random() * 900000))::int::text, 6, '0');
    exit when not exists (select 1 from public.households where invite_code = code);
  end loop;
  insert into public.households (name, invite_code)
  values (coalesce(nullif(trim(p_name), ''), 'Дом'), code)
  returning * into row_h;
  insert into public.profiles (id, household_id, slot, display_name, kcal, protein, height, weight)
  values (auth.uid(), row_h.id, 'me', 'Я', 2000, 160, 182, 80);
  return row_h;
end;
$$;

create or replace function public.join_household(p_code text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  row_h public.households;
  clean text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'already in a household';
  end if;
  clean := upper(regexp_replace(trim(p_code), '[^0-9A-Z]', '', 'g'));
  select * into row_h from public.households
  where invite_code = clean or invite_code = p_code or invite_code = upper(trim(p_code));
  if row_h.id is null then
    raise exception 'invalid invite code';
  end if;
  if exists (select 1 from public.profiles where household_id = row_h.id and slot = 'partner') then
    raise exception 'household is full';
  end if;
  insert into public.profiles (id, household_id, slot, display_name, kcal, protein, height, weight)
  values (auth.uid(), row_h.id, 'partner', 'Жена', 1600, 140, 168, 75);
  return row_h;
end;
$$;

grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;

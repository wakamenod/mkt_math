-- 方針: 閲覧は誰でも可（anon 含む）、書き込みは認証済みのオーナーのみ。
-- 併せて Supabase ダッシュボードで新規サインアップを無効化すること。
-- それにより「authenticated = オーナー本人」が成立する。

alter table public.categories    enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.sessions      enable row level security;

create policy "public read categories"    on public.categories    for select to anon, authenticated using (true);
create policy "public read exercise_sets" on public.exercise_sets for select to anon, authenticated using (true);
create policy "public read sessions"      on public.sessions      for select to anon, authenticated using (true);

create policy "owner write categories"    on public.categories    for all to authenticated using (true) with check (true);
create policy "owner write exercise_sets" on public.exercise_sets for all to authenticated using (true) with check (true);

create policy "owner insert sessions" on public.sessions for insert to authenticated
  with check (created_by = auth.uid());
create policy "owner update sessions" on public.sessions for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "owner delete sessions" on public.sessions for delete to authenticated
  using (created_by = auth.uid());

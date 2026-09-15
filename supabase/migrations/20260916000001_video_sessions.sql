-- 講義ビデオの視聴記録。
-- sessions とは別テーブルにしているのは、正答率の統計にビデオが混ざらないようにするため。
-- sessions 側の「problem_count_snapshot > 0」「correct_count <= problem_count_snapshot」
-- という不変条件を崩さずに済む。
-- ビデオは学習時間・連続学習日数・草グラフには数えるが、正答率には一切関わらない。
create table public.video_sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null,
  ended_at   timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  note text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- sessions と同じく JST で日付を確定させる
  study_date date generated always as
    (((started_at at time zone 'Asia/Tokyo'))::date) stored,
  constraint video_sessions_time_order check (ended_at >= started_at)
);

create index video_sessions_started_at_idx on public.video_sessions (started_at desc);
create index video_sessions_study_date_idx on public.video_sessions (study_date);

create trigger video_sessions_touch before update on public.video_sessions
  for each row execute function public.touch_updated_at();

-- RLS は sessions と同じ方針: 閲覧は誰でも、書き込みは認証済みオーナーのみ
alter table public.video_sessions enable row level security;

create policy "public read video_sessions" on public.video_sessions
  for select to anon, authenticated using (true);
create policy "owner insert video_sessions" on public.video_sessions
  for insert to authenticated with check (created_by = auth.uid());
create policy "owner update video_sessions" on public.video_sessions
  for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "owner delete video_sessions" on public.video_sessions
  for delete to authenticated using (created_by = auth.uid());

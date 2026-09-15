-- 大分類（代数1〜3, 幾何1〜4）
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 練習問題。problem_count はマスタ属性としてここに持つ。
create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  number integer not null check (number > 0),
  title text,
  problem_count integer not null check (problem_count between 1 and 200),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, number)
);

-- 1回の学習（スタート→ストップ→正解数入力）
-- problem_count_snapshot を持つのは、後からマスタの問題数を修正しても
-- 過去の正答率が遡って変わらないようにするため。統計は必ずこの列を使う。
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  exercise_set_id uuid not null references public.exercise_sets(id) on delete restrict,
  started_at timestamptz not null,
  ended_at   timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  correct_count integer not null check (correct_count >= 0),
  problem_count_snapshot integer not null check (problem_count_snapshot > 0),
  note text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- ストリーク・ヒートマップの集計基準を JST でサーバ側に固定する
  study_date date generated always as
    (((started_at at time zone 'Asia/Tokyo'))::date) stored,
  constraint sessions_correct_le_total check (correct_count <= problem_count_snapshot),
  constraint sessions_time_order check (ended_at >= started_at)
);

create index sessions_started_at_idx    on public.sessions (started_at desc);
create index sessions_exercise_set_idx  on public.sessions (exercise_set_id, started_at);
create index sessions_study_date_idx    on public.sessions (study_date);
create index exercise_sets_category_idx on public.exercise_sets (category_id, number);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

create trigger categories_touch    before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger exercise_sets_touch before update on public.exercise_sets
  for each row execute function public.touch_updated_at();
create trigger sessions_touch      before update on public.sessions
  for each row execute function public.touch_updated_at();

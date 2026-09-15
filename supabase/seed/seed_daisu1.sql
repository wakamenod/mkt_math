-- 大分類。代数2以降は練習問題が未登録（管理画面から追加する）。
insert into public.categories (name, sort_order) values
  ('代数1', 1), ('代数2', 2), ('代数3', 3),
  ('幾何1', 4), ('幾何2', 5), ('幾何3', 6), ('幾何4', 7)
on conflict (name) do nothing;

-- 代数1の練習問題 22件（合計 101 問）
insert into public.exercise_sets (category_id, number, problem_count)
select c.id, v.number, v.cnt
from public.categories c,
  (values
    (1,5),(2,5),(3,5),(4,6),(5,5),(6,11),(7,5),(8,5),(9,6),(10,5),(11,5),
    (12,3),(13,1),(14,7),(15,1),(16,2),(17,7),(18,2),(19,4),(20,6),(21,3),(22,2)
  ) as v(number, cnt)
where c.name = '代数1'
on conflict (category_id, number) do update set problem_count = excluded.problem_count;

-- 検証: 101 が返ること
-- select sum(problem_count) from public.exercise_sets es
--   join public.categories c on c.id = es.category_id where c.name = '代数1';

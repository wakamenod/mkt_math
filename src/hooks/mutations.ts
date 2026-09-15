import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "../lib/queryClient";
import * as categoriesApi from "../api/categories";
import * as setsApi from "../api/exerciseSets";
import * as sessionsApi from "../api/sessions";
import * as videoApi from "../api/videoSessions";
import type {
  Category,
  ExerciseSet,
  NewSession,
  NewVideoSession,
  Session,
} from "../types/domain";

/**
 * 保存頻度が低いので楽観更新はせず、成功時に invalidate するだけにする。
 * セッションを書き換えればダッシュボードの全統計が再計算される。
 */
function useInvalidating<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  keys: readonly (readonly string[])[],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      for (const key of keys) qc.invalidateQueries({ queryKey: key });
    },
  });
}

export const useCreateSession = () =>
  useInvalidating(
    (input: NewSession) => sessionsApi.createSession(input),
    [qk.sessions],
  );

export const useUpdateSession = () =>
  useInvalidating(
    (v: { id: string; patch: Partial<Session> }) =>
      sessionsApi.updateSession(v.id, v.patch),
    [qk.sessions],
  );

export const useDeleteSession = () =>
  useInvalidating((id: string) => sessionsApi.deleteSession(id), [qk.sessions]);

export const useCreateVideoSession = () =>
  useInvalidating(
    (input: NewVideoSession) => videoApi.createVideoSession(input),
    [qk.videoSessions],
  );

export const useDeleteVideoSession = () =>
  useInvalidating(
    (id: string) => videoApi.deleteVideoSession(id),
    [qk.videoSessions],
  );

export const useCreateCategory = () =>
  useInvalidating(
    (input: { name: string; sort_order: number }) =>
      categoriesApi.createCategory(input),
    [qk.categories, qk.exerciseSets],
  );

export const useUpdateCategory = () =>
  useInvalidating(
    (v: { id: string; patch: Partial<Category> }) =>
      categoriesApi.updateCategory(v.id, v.patch),
    [qk.categories, qk.exerciseSets, qk.sessions],
  );

export const useDeleteCategory = () =>
  useInvalidating(
    (id: string) => categoriesApi.deleteCategory(id),
    [qk.categories, qk.exerciseSets, qk.sessions],
  );

export const useCreateExerciseSet = () =>
  useInvalidating(
    (input: {
      category_id: string;
      number: number;
      problem_count: number;
      title?: string | null;
    }) => setsApi.createExerciseSet(input),
    [qk.exerciseSets],
  );

export const useUpdateExerciseSet = () =>
  useInvalidating(
    (v: { id: string; patch: Partial<ExerciseSet> }) =>
      setsApi.updateExerciseSet(v.id, v.patch),
    [qk.exerciseSets, qk.sessions],
  );

export const useDeleteExerciseSet = () =>
  useInvalidating(
    (id: string) => setsApi.deleteExerciseSet(id),
    [qk.exerciseSets],
  );

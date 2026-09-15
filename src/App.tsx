import { Suspense, lazy } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { RequireAuth } from "./auth/RequireAuth";
import { AppShell } from "./components/layout/AppShell";
import { queryClient } from "./lib/queryClient";
import { missingEnvVars } from "./lib/env";
import { EnvSetupNotice } from "./components/layout/EnvSetupNotice";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ManagePage } from "./pages/ManagePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudyPage } from "./pages/StudyPage";
import { Spinner } from "./components/ui";

// グラフ（Recharts）はバンドルが大きい。毎日使うのは学習タブなので、
// チャートを使うページだけ遅延読み込みにしてスマホの初回表示を軽くする。
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const CategoryDetailPage = lazy(() =>
  import("./pages/CategoryDetailPage").then((m) => ({
    default: m.CategoryDetailPage,
  })),
);
const ExerciseSetDetailPage = lazy(() =>
  import("./pages/ExerciseSetDetailPage").then((m) => ({
    default: m.ExerciseSetDetailPage,
  })),
);

export default function App() {
  // 接続情報がなければ何も動かないので、原因の分かる画面を出して止める。
  const missing = missingEnvVars();
  if (missing.length > 0)
    return (
      <ThemeProvider>
        <EnvSetupNotice missing={missing} />
      </ThemeProvider>
    );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* GitHub Pages に SPA フォールバックがないので HashRouter を使う */}
          <HashRouter>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route
                    path="categories/:categoryId"
                    element={<CategoryDetailPage />}
                  />
                  <Route
                    path="sets/:setId"
                    element={<ExerciseSetDetailPage />}
                  />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route
                    path="study"
                    element={
                      <RequireAuth>
                        <StudyPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="manage"
                    element={
                      <RequireAuth>
                        <ManagePage />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

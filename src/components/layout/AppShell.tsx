import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { missingEnvVars } from '../../lib/env'
import { PendingSessionBanner } from './PendingSessionBanner'

const NAV = [
  { to: '/', label: 'ホーム', icon: '📊', end: true },
  { to: '/study', label: '学習', icon: '⏱', authOnly: true },
  { to: '/history', label: '履歴', icon: '📝' },
  { to: '/manage', label: '設定', icon: '⚙️', authOnly: true },
]

function EnvWarning() {
  const missing = missingEnvVars()
  if (missing.length === 0) return null
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
      環境変数が未設定です: {missing.join(', ')}（.env.local を確認してください）
    </div>
  )
}

export function AppShell() {
  const { user, signOut } = useAuth()
  const items = NAV.filter((n) => !n.authOnly || user)

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <EnvWarning />

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-base font-bold">
            数学の記録
          </Link>

          <nav className="hidden gap-1 md:flex">
            {items.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-900">
              ログアウト
            </button>
          ) : (
            <Link to="/login" className="text-xs font-semibold text-slate-900">
              ログイン
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-4 pb-24 md:pb-8">
        <PendingSessionBanner />
        <Outlet />
      </main>

      {/* モバイルは下部タブ */}
      <nav
        className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`
              }
            >
              <span className="text-lg leading-none">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

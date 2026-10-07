import { Header } from './header'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-emerald-50 p-1 sm:p-3 md:p-4 lg:p-6 font-sans">
      <div className="mx-auto max-w-[1600px] rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100">
        <Header />
        {children}
      </div>
    </div>
  )
}

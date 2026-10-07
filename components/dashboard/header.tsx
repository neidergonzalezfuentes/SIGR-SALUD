"use client"

import { Search, Bell, Shield, LayoutDashboard, Grid3X3, AlertTriangle, ClipboardList, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Matriz de Riesgos', href: '/matriz-riesgos', icon: Grid3X3 },
  { label: 'Eventos', href: '/eventos', icon: AlertTriangle },
  { label: 'Planes de Acción', href: '/planes-accion', icon: ClipboardList },
  { label: 'Auditorías', href: '/auditorias', icon: FileCheck },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="mb-3 sm:mb-4 lg:mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-600">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <Link href="/" className="text-sm sm:text-base font-bold text-gray-900 hover:opacity-80 transition-opacity leading-tight">
            SIGR-IPS
          </Link>
          <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight">Sistema Integrado de Gestión de Riesgos</span>
        </div>
      </div>

      <nav className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden md:inline">{item.label}</span>
              <span className="md:hidden">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
        </button>
        <button className="relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-gray-300">
          <div className="h-7 w-7 sm:h-9 sm:w-9 overflow-hidden rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-700">JG</span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-[11px] font-medium text-gray-900 leading-tight">Juan García</span>
            <span className="text-[9px] text-gray-500 leading-tight">Coord. Calidad</span>
          </div>
        </div>
      </div>
    </header>
  )
}

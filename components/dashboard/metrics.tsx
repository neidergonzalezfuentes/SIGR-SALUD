export function MetricRow({ number, label, value, color }: { number: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="w-3 text-[10px] sm:text-xs font-medium text-gray-600">{number}</span>
      <span className="flex-1 text-[10px] sm:text-xs text-black">{label}</span>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className="h-1.5 w-10 sm:w-12 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full ${color}`} style={{ width: value }} />
        </div>
        <span className="w-7 sm:w-8 text-right text-[10px] sm:text-xs font-semibold text-black">{value}</span>
      </div>
    </div>
  )
}

export function ReportCircle({ iconType, label }: { iconType: 'chart' | 'list' | 'book'; label: string }) {
  const renderIcon = () => {
    switch (iconType) {
      case 'chart':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 10v7M12 7v10M16 13v4" />
          </svg>
        )
      case 'list':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
            <rect x="3" y="5" width="18" height="4" rx="1" />
            <rect x="3" y="11" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="18" height="4" rx="1" />
          </svg>
        )
      case 'book':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M12 6v8M9 10h6" />
          </svg>
        )
    }
  }

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-1.5 sm:mb-2 flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeDasharray={`${0.75 * 283} ${0.25 * 283}`}
          />
        </svg>
        <div className="relative z-10 flex h-10 w-10 sm:h-11 sm:w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-white shadow-sm">
          {renderIcon()}
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] font-medium text-gray-600">{label}</span>
    </div>
  )
}

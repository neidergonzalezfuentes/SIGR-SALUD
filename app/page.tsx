import { DashboardShell } from "@/components/dashboard/shell"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  ArrowRight,
  Shield,
  Activity,
  Heart,
  DollarSign,
  Settings,
  Scale,
  Leaf,
  Calculator,
} from "lucide-react"
import Link from "next/link"
import {
  sampleDashboardMetrics,
  sampleEvents,
  sampleActionPlans,
  sampleComplianceStatus,
} from "@/lib/data"
import {
  RISK_CATEGORY_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  FRAMEWORK_LABELS,
  type RiskCategory,
} from "@/lib/types"

const categoryIcons: Record<RiskCategory, React.ElementType> = {
  clinico: Heart,
  administrativo: FileText,
  ambiental: Leaf,
  legal: Scale,
  financiero: DollarSign,
  operacional: Settings,
  actuarial: Calculator,
  mercado: TrendingUp,
}

export default function DashboardPage() {
  const metrics = sampleDashboardMetrics
  const recentEvents = sampleEvents.slice(0, 3)
  const overdueActions = sampleActionPlans.filter((p) => p.status === "vencido")
  const compliance = sampleComplianceStatus

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* Welcome Card */}
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 sm:p-5 text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-1">Bienvenido al SIGR</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mb-3">
              IPS Salud Integral S.A.S.
            </p>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-emerald-200">
              <Calendar className="h-3 w-3" />
              <span>Último reporte: Hoy, 10:30 AM</span>
            </div>
          </div>

          {/* Global Risk Score */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Índice de Riesgo Global
            </h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={metrics.globalRiskScore >= 70 ? "#22c55e" : metrics.globalRiskScore >= 50 ? "#eab308" : "#ef4444"}
                  strokeWidth="12"
                  strokeDasharray={`${metrics.globalRiskScore * 2.83} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {metrics.globalRiskScore}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">de 100</span>
              </div>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2">
              Nivel de control: <span className="font-semibold text-emerald-600">Aceptable</span>
            </p>
          </div>

          {/* Risk by Category */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Riesgos por Categoría
            </h3>
            <div className="space-y-2">
              {metrics.risksByCategory.slice(0, 6).map((cat) => {
                const Icon = categoryIcons[cat.category]
                return (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
                        <Icon className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {RISK_CATEGORY_LABELS[cat.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                        {cat.count}
                      </span>
                      {cat.criticalCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                          {cat.criticalCount} crítico
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl bg-white border border-gray-100 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-[9px] text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> -12%
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.totalRisks}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Total Riesgos</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-[9px] text-red-500 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +1
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.criticalRisks}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Riesgos Críticos</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="text-[9px] text-gray-500">Este mes</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.eventsThisMonth}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Eventos Reportados</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                {metrics.overdueActions > 0 && (
                  <span className="text-[9px] text-red-500">Atención</span>
                )}
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.overdueActions}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Planes Vencidos</p>
            </div>
          </div>

          {/* Recent Events */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                Eventos Recientes
              </h3>
              <Link
                href="/eventos"
                className="text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${EVENT_TYPE_COLORS[event.type]}20` }}
                  >
                    <AlertCircle
                      className="h-4 w-4"
                      style={{ color: EVENT_TYPE_COLORS[event.type] }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-xs font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500">
                      {EVENT_TYPE_LABELS[event.type]} - {event.area}
                    </p>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">
                    {new Date(event.reportedAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-4">
              Tendencia Semanal
            </h3>
            <div className="flex items-end justify-between gap-2 h-32 sm:h-40">
              {metrics.weeklyTrend.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div
                      className="w-full max-w-[24px] bg-amber-400 rounded-t"
                      style={{ height: `${Math.max(day.events * 20, 4)}px` }}
                    />
                    <div
                      className="w-full max-w-[24px] bg-emerald-500 rounded-b"
                      style={{ height: `${Math.max(day.risks * 20, 4)}px` }}
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] sm:text-[10px] text-gray-500">Eventos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] sm:text-[10px] text-gray-500">Riesgos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* Quick Actions */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/eventos?nuevo=true"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
              >
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-[10px] sm:text-xs font-medium text-red-700">
                  Reportar Evento
                </span>
              </Link>
              <Link
                href="/matriz-riesgos?nuevo=true"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors group"
              >
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] sm:text-xs font-medium text-emerald-700">
                  Nueva Evaluación
                </span>
              </Link>
              <Link
                href="/auditorias"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] sm:text-xs font-medium text-blue-700">
                  Ver Auditorías
                </span>
              </Link>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Cumplimiento Normativo
            </h3>
            <div className="space-y-3">
              {compliance.slice(0, 4).map((comp) => (
                <div key={comp.framework}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] sm:text-[10px] text-gray-600 truncate max-w-[140px]">
                      {FRAMEWORK_LABELS[comp.framework].replace("NTC-", "").replace(":2015", "").replace(":2018", "").replace(" de 2019", "").replace(" de 2021", "")}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                      {comp.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${comp.percentage}%`,
                        backgroundColor:
                          comp.percentage >= 90
                            ? "#22c55e"
                            : comp.percentage >= 70
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Actions Alert */}
          {overdueActions.length > 0 && (
            <div className="rounded-xl sm:rounded-2xl bg-red-50 border border-red-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-4 w-4 text-red-600" />
                <h3 className="text-xs sm:text-sm font-semibold text-red-700">
                  Planes Vencidos
                </h3>
              </div>
              <div className="space-y-2">
                {overdueActions.slice(0, 2).map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2 rounded-lg bg-white border border-red-100"
                  >
                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 truncate">
                      {plan.title}
                    </p>
                    <p className="text-[9px] text-red-600">
                      Vencido: {new Date(plan.dueDate).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/planes-accion?filter=vencido"
                className="mt-3 flex items-center justify-center gap-1 text-[10px] sm:text-xs text-red-600 hover:text-red-700"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Recent Activity */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Actividad Reciente
            </h3>
            <div className="space-y-2">
              {metrics.recentActivity.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2">
                  <div
                    className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                      activity.type === "event"
                        ? "bg-amber-500"
                        : activity.type === "risk"
                        ? "bg-red-500"
                        : activity.type === "action"
                        ? "bg-emerald-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-700 leading-tight">
                      {activity.description}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {new Date(activity.timestamp).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

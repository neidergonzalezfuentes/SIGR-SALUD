"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  FileSearch,
  ClipboardList,
  ArrowRight,
  Building2,
  User,
  Calendar,
} from "lucide-react"
import { sampleEvents, ipsAreas } from "@/lib/data"
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  type EventType,
  type EventStatus,
} from "@/lib/types"

const eventTypeIcons: Record<EventType, React.ElementType> = {
  evento_adverso: AlertTriangle,
  incidente: AlertCircle,
  casi_incidente: Info,
  evento_centinela: Zap,
}

const statusLabels: Record<EventStatus, string> = {
  reportado: "Reportado",
  en_investigacion: "En Investigación",
  analizado: "Analizado",
  con_plan: "Con Plan",
  cerrado: "Cerrado",
}

const statusColors: Record<EventStatus, string> = {
  reportado: "#6b7280",
  en_investigacion: "#3b82f6",
  analizado: "#8b5cf6",
  con_plan: "#f59e0b",
  cerrado: "#22c55e",
}

export default function EventosPage() {
  const [selectedType, setSelectedType] = useState<EventType | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEvents = sampleEvents.filter((event) => {
    const matchesType = selectedType === "all" || event.type === selectedType
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.area.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  // Event counts by type
  const eventCounts = {
    evento_adverso: sampleEvents.filter((e) => e.type === "evento_adverso").length,
    incidente: sampleEvents.filter((e) => e.type === "incidente").length,
    casi_incidente: sampleEvents.filter((e) => e.type === "casi_incidente").length,
    evento_centinela: sampleEvents.filter((e) => e.type === "evento_centinela").length,
  }

  // Funnel data
  const funnelData = [
    { status: "reportado", count: sampleEvents.filter((e) => e.status === "reportado").length },
    {
      status: "en_investigacion",
      count: sampleEvents.filter((e) => e.status === "en_investigacion").length,
    },
    { status: "analizado", count: sampleEvents.filter((e) => e.status === "analizado").length },
    { status: "con_plan", count: sampleEvents.filter((e) => e.status === "con_plan").length },
    { status: "cerrado", count: sampleEvents.filter((e) => e.status === "cerrado").length },
  ]

  // Events by area
  const eventsByArea = ipsAreas
    .map((area) => ({
      area,
      count: sampleEvents.filter((e) => e.area === area).length,
    }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column - Summary */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* Event Type Summary */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Resumen de Eventos
            </h3>
            <div className="space-y-2">
              {(Object.keys(eventCounts) as EventType[]).map((type) => {
                const Icon = eventTypeIcons[type]
                const count = eventCounts[type]
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? "all" : type)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                      selectedType === type
                        ? "bg-white shadow-sm ring-1 ring-emerald-500"
                        : "bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${EVENT_TYPE_COLORS[type]}15` }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: EVENT_TYPE_COLORS[type] }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {EVENT_TYPE_LABELS[type]}
                      </span>
                    </div>
                    <span
                      className="text-sm sm:text-base font-bold"
                      style={{ color: EVENT_TYPE_COLORS[type] }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Funnel Chart */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Funnel de Gestión
            </h3>
            <div className="space-y-2">
              {funnelData.map((item, index) => {
                const maxCount = Math.max(...funnelData.map((d) => d.count))
                const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] sm:text-[10px] text-gray-600">
                          {statusLabels[item.status as EventStatus]}
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${width}%`,
                            backgroundColor: statusColors[item.status as EventStatus],
                          }}
                        />
                      </div>
                    </div>
                    {index < funnelData.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-gray-300 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-amber-800 mb-3">
              Recomendaciones
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] sm:text-[10px] text-gray-700">
                  Hay 1 evento centinela pendiente de análisis causa raíz. Requiere atención
                  prioritaria.
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white">
                <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[9px] sm:text-[10px] text-gray-700">
                  2 eventos llevan más de 48h sin actualización de estado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Event List */}
        <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Eventos e Incidentes
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] sm:text-xs font-medium hover:bg-red-700 transition-colors">
                <Plus className="h-3 w-3" />
                Reportar Evento
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium hover:bg-gray-200 transition-colors">
                <Download className="h-3 w-3" />
                Exportar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as EventStatus | "all")}
                className="appearance-none pl-3 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Event Cards */}
          <div className="space-y-2">
            {filteredEvents.map((event) => {
              const Icon = eventTypeIcons[event.type]
              return (
                <div
                  key={event.id}
                  className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${EVENT_TYPE_COLORS[event.type]}15` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: EVENT_TYPE_COLORS[event.type] }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="text-[9px] font-mono text-gray-400 block">
                            {event.code}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                            {event.title}
                          </h4>
                        </div>
                        <span
                          className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-medium"
                          style={{
                            backgroundColor: `${statusColors[event.status]}15`,
                            color: statusColors[event.status],
                          }}
                        >
                          {event.status === "cerrado" && <CheckCircle2 className="h-3 w-3" />}
                          {event.status === "en_investigacion" && (
                            <FileSearch className="h-3 w-3" />
                          )}
                          {event.status === "con_plan" && <ClipboardList className="h-3 w-3" />}
                          {event.status === "reportado" && <Clock className="h-3 w-3" />}
                          {event.status === "analizado" && <CheckCircle2 className="h-3 w-3" />}
                          {statusLabels[event.status]}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[9px] sm:text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{event.area}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{event.reportedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(event.reportedAt).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {event.patient && (
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100">
                              Paciente: {event.patient.age} años, {event.patient.gender}
                            </span>
                          </div>
                        )}
                      </div>
                      {event.rootCause && (
                        <div className="mt-2 p-2 rounded-lg bg-gray-50">
                          <span className="text-[9px] font-semibold text-gray-500 uppercase">
                            Causa Raíz:
                          </span>
                          <p className="text-[10px] sm:text-xs text-gray-700 mt-0.5">
                            {event.rootCause}
                          </p>
                        </div>
                      )}
                    </div>
                    <button className="shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No se encontraron eventos</p>
              <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>

        {/* Right Column - Statistics */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* KPIs */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Indicadores Clave
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] sm:text-[10px] text-gray-500">
                    Tasa de eventos / 1000 egresos
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">2.3</span>
                  <span className="text-[9px] text-green-600">Meta: {"<"}5</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] sm:text-[10px] text-gray-500">
                    Tiempo promedio de respuesta
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">18h</span>
                  <span className="text-[9px] text-yellow-600">Meta: {"<"}24h</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] sm:text-[10px] text-gray-500">
                    % con análisis causa raíz
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">75%</span>
                  <span className="text-[9px] text-green-600">Meta: {">"}70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Events by Area */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Eventos por Área
            </h3>
            <div className="space-y-2">
              {eventsByArea.map((item) => {
                const maxCount = eventsByArea[0]?.count || 1
                return (
                  <div key={item.area}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] sm:text-[10px] text-gray-600 truncate max-w-[140px]">
                        {item.area}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Distribución por Severidad
            </h3>
            <div className="flex items-end justify-between gap-2 h-24">
              {[1, 2, 3, 4].map((sev) => {
                const count = sampleEvents.filter((e) => e.severity === sev).length
                const maxCount = Math.max(
                  ...([1, 2, 3, 4] as const).map(
                    (s) => sampleEvents.filter((e) => e.severity === s).length
                  )
                )
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                const colors = ["#22c55e", "#eab308", "#f97316", "#ef4444"]
                const labels = ["Leve", "Mod.", "Grave", "Catast."]
                return (
                  <div key={sev} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-gray-700">{count}</span>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${Math.max(height, 10)}%`,
                        backgroundColor: colors[sev - 1],
                      }}
                    />
                    <span className="text-[8px] sm:text-[9px] text-gray-500">{labels[sev - 1]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Culture Index */}
          <div className="rounded-xl sm:rounded-2xl bg-emerald-600 p-4 sm:p-5 text-white">
            <h3 className="text-xs sm:text-sm font-semibold mb-2">
              Índice de Cultura de Seguridad
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="10"
                    strokeDasharray={`${0.78 * 251} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">78%</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-emerald-100">
                  Basado en reportes voluntarios y encuestas de clima de seguridad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

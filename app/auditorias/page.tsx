"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Calendar,
  FileText,
  Building2,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { sampleAudits, sampleComplianceStatus } from "@/lib/data"
import {
  AUDIT_TYPE_LABELS,
  FRAMEWORK_LABELS,
  FINDING_TYPE_LABELS,
  type AuditType,
  type AuditStatus,
  type FindingType,
} from "@/lib/types"

const statusLabels: Record<AuditStatus, string> = {
  programada: "Programada",
  en_ejecucion: "En Ejecución",
  completada: "Completada",
  cancelada: "Cancelada",
}

const statusColors: Record<AuditStatus, string> = {
  programada: "#3b82f6",
  en_ejecucion: "#f59e0b",
  completada: "#22c55e",
  cancelada: "#6b7280",
}

const findingTypeColors: Record<FindingType, string> = {
  nc_mayor: "#ef4444",
  nc_menor: "#f97316",
  observacion: "#eab308",
  oportunidad_mejora: "#22c55e",
}

const findingTypeIcons: Record<FindingType, React.ElementType> = {
  nc_mayor: XCircle,
  nc_menor: AlertTriangle,
  observacion: AlertCircle,
  oportunidad_mejora: Lightbulb,
}

export default function AuditoriasPage() {
  const [selectedType, setSelectedType] = useState<AuditType | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const filteredAudits = sampleAudits.filter((audit) => {
    const matchesType = selectedType === "all" || audit.type === selectedType
    const matchesSearch =
      audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Stats
  const programadas = sampleAudits.filter((a) => a.status === "programada").length
  const enEjecucion = sampleAudits.filter((a) => a.status === "en_ejecucion").length
  const completadas = sampleAudits.filter((a) => a.status === "completada").length
  const totalHallazgos = sampleAudits.reduce((acc, a) => acc + a.findings.length, 0)
  const hallazgosAbiertos = sampleAudits.reduce(
    (acc, a) => acc + a.findings.filter((f) => f.status !== "cerrado").length,
    0
  )

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const getAuditsForDay = (day: number) => {
    return sampleAudits.filter((audit) => {
      const auditDate = new Date(audit.scheduledDate)
      return (
        auditDate.getDate() === day &&
        auditDate.getMonth() === currentMonth.getMonth() &&
        auditDate.getFullYear() === currentMonth.getFullYear()
      )
    })
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column - Stats & Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-[9px] text-blue-600">Programadas</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-blue-700">{programadas}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-[9px] text-amber-600">En Ejecución</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-amber-700">{enEjecucion}</p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-100 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-[9px] text-green-600">Completadas</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-green-700">{completadas}</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-[9px] text-red-600">Hallazgos Abiertos</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-red-700">{hallazgosAbiertos}</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                Calendario de Auditorías
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
                <span className="text-[10px] sm:text-xs font-medium text-gray-700 min-w-[100px] text-center">
                  {currentMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => (
                <div
                  key={i}
                  className="h-6 flex items-center justify-center text-[9px] font-medium text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const auditsToday = getAuditsForDay(day)
                const isToday =
                  day === new Date().getDate() &&
                  currentMonth.getMonth() === new Date().getMonth() &&
                  currentMonth.getFullYear() === new Date().getFullYear()
                return (
                  <div
                    key={day}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center relative ${
                      isToday ? "bg-emerald-100 ring-1 ring-emerald-500" : "hover:bg-gray-50"
                    } ${auditsToday.length > 0 ? "cursor-pointer" : ""}`}
                    title={auditsToday.map((a) => a.title).join(", ")}
                  >
                    <span
                      className={`text-[10px] ${isToday ? "font-bold text-emerald-700" : "text-gray-600"}`}
                    >
                      {day}
                    </span>
                    {auditsToday.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {auditsToday.slice(0, 2).map((audit, idx) => (
                          <div
                            key={idx}
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: statusColors[audit.status] }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Cumplimiento Normativo
            </h3>
            <div className="space-y-3">
              {sampleComplianceStatus.map((comp) => (
                <div key={comp.framework}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] sm:text-[10px] text-gray-600 truncate max-w-[180px]">
                      {FRAMEWORK_LABELS[comp.framework]
                        .replace("NTC-", "")
                        .replace(":2015", "")
                        .replace(":2018", "")
                        .replace(" de 2019", "")
                        .replace(" de 2021", "")}
                    </span>
                    <span
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{
                        color:
                          comp.percentage >= 90
                            ? "#22c55e"
                            : comp.percentage >= 70
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    >
                      {comp.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[8px] text-gray-400">
                      Última: {comp.lastAudit ? new Date(comp.lastAudit).toLocaleDateString("es-CO", { month: "short", year: "2-digit" }) : "N/A"}
                    </span>
                    <span className="text-[8px] text-gray-400">
                      Próxima: {comp.nextAudit ? new Date(comp.nextAudit).toLocaleDateString("es-CO", { month: "short", year: "2-digit" }) : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Audit List */}
        <div className="lg:col-span-8 flex flex-col gap-3 sm:gap-4">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Auditorías
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-xs font-medium hover:bg-emerald-700 transition-colors">
                <Plus className="h-3 w-3" />
                Programar Auditoría
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
                placeholder="Buscar auditoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AuditType | "all")}
                className="appearance-none pl-3 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(AUDIT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Audit Cards */}
          <div className="space-y-3">
            {filteredAudits.map((audit) => (
              <div
                key={audit.id}
                className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-gray-400">{audit.code}</span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                        style={{
                          backgroundColor: `${statusColors[audit.status]}15`,
                          color: statusColors[audit.status],
                        }}
                      >
                        {audit.status === "completada" && <CheckCircle2 className="h-3 w-3" />}
                        {audit.status === "en_ejecucion" && <Clock className="h-3 w-3" />}
                        {audit.status === "programada" && <Calendar className="h-3 w-3" />}
                        {statusLabels[audit.status]}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                      {audit.title}
                    </h4>
                  </div>
                  <button className="shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <span className="text-[8px] text-gray-400 block">Marco</span>
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {FRAMEWORK_LABELS[audit.framework]
                          .replace("NTC-", "")
                          .replace(":2015", "")
                          .replace(":2018", "")
                          .replace(" de 2019", "")
                          .replace(" de 2021", "")
                          .slice(0, 15)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <span className="text-[8px] text-gray-400 block">Áreas</span>
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {audit.areas.length} área(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <span className="text-[8px] text-gray-400 block">Auditor Líder</span>
                      <span className="text-[10px] sm:text-xs text-gray-700 truncate max-w-[100px] block">
                        {audit.leadAuditor}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <span className="text-[8px] text-gray-400 block">Fecha</span>
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {new Date(audit.scheduledDate).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Findings Summary */}
                {audit.findings.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <h5 className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase mb-2">
                      Hallazgos ({audit.findings.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(["nc_mayor", "nc_menor", "observacion", "oportunidad_mejora"] as FindingType[]).map(
                        (type) => {
                          const count = audit.findings.filter((f) => f.type === type).length
                          if (count === 0) return null
                          const Icon = findingTypeIcons[type]
                          return (
                            <div
                              key={type}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg"
                              style={{ backgroundColor: `${findingTypeColors[type]}10` }}
                            >
                              <Icon
                                className="h-3 w-3"
                                style={{ color: findingTypeColors[type] }}
                              />
                              <span
                                className="text-[9px] font-medium"
                                style={{ color: findingTypeColors[type] }}
                              >
                                {count} {FINDING_TYPE_LABELS[type].replace("No Conformidad ", "NC ")}
                              </span>
                            </div>
                          )
                        }
                      )}
                    </div>
                    {/* Finding details */}
                    <div className="mt-2 space-y-1.5">
                      {audit.findings.slice(0, 2).map((finding) => {
                        const Icon = findingTypeIcons[finding.type]
                        return (
                          <div
                            key={finding.id}
                            className="flex items-start gap-2 p-2 rounded-lg bg-gray-50"
                          >
                            <Icon
                              className="h-3.5 w-3.5 shrink-0 mt-0.5"
                              style={{ color: findingTypeColors[finding.type] }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs text-gray-700 line-clamp-1">
                                {finding.description}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] text-gray-400">
                                  Req: {finding.requirement}
                                </span>
                                <span
                                  className={`text-[8px] px-1.5 py-0.5 rounded ${
                                    finding.status === "cerrado"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {finding.status === "cerrado" ? "Cerrado" : "Abierto"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {audit.findings.length > 2 && (
                        <button className="text-[9px] text-emerald-600 hover:text-emerald-700">
                          Ver {audit.findings.length - 2} hallazgo(s) más...
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {audit.findings.length === 0 && audit.status === "programada" && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 italic">
                      Auditoría pendiente de ejecución
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredAudits.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-gray-50">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No se encontraron auditorías</p>
              <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

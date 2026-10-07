"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  User,
  Target,
  FileText,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { sampleActionPlans } from "@/lib/data"
import {
  ACTION_TYPE_LABELS,
  ACTION_STATUS_LABELS,
  ACTION_STATUS_COLORS,
  type ActionType,
  type ActionStatus,
  type ActionOrigin,
} from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NuevoPlanForm } from "@/components/planes-accion/nuevo-plan-form"

const originLabels: Record<ActionOrigin, string> = {
  auditoria: "Auditoría",
  evento: "Evento",
  autoevaluacion: "Autoevaluación",
  queja: "PQRS",
  ronda: "Ronda",
}

const originIcons: Record<ActionOrigin, React.ElementType> = {
  auditoria: FileText,
  evento: AlertTriangle,
  autoevaluacion: Target,
  queja: FileText,
  ronda: Eye,
}

const typeColors: Record<ActionType, string> = {
  correctiva: "#ef4444",
  preventiva: "#3b82f6",
  mejora: "#22c55e",
}

export default function PlanesAccionPage() {
  const [selectedType, setSelectedType] = useState<ActionType | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [nuevoPlanOpen, setNuevoPlanOpen] = useState(false)

  const filteredPlans = sampleActionPlans.filter((plan) => {
    const matchesType = selectedType === "all" || plan.type === selectedType
    const matchesStatus = selectedStatus === "all" || plan.status === selectedStatus
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.responsible.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  // Stats
  const totalPlans = sampleActionPlans.length
  const plansThisMonth = sampleActionPlans.filter((p) => {
    const created = new Date(p.createdAt)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length
  const avgProgress = Math.round(
    sampleActionPlans.reduce((acc, p) => acc + p.progress, 0) / sampleActionPlans.length
  )
  const pendingActivities = sampleActionPlans.reduce(
    (acc, p) => acc + p.activities.filter((a) => !a.completed).length,
    0
  )

  // By type counts
  const byType = {
    correctiva: sampleActionPlans.filter((p) => p.type === "correctiva").length,
    preventiva: sampleActionPlans.filter((p) => p.type === "preventiva").length,
    mejora: sampleActionPlans.filter((p) => p.type === "mejora").length,
  }

  // By status counts
  const byStatus = {
    pendiente: sampleActionPlans.filter((p) => p.status === "pendiente").length,
    en_curso: sampleActionPlans.filter((p) => p.status === "en_curso").length,
    vencido: sampleActionPlans.filter((p) => p.status === "vencido").length,
    completado: sampleActionPlans.filter((p) => p.status === "completado").length,
  }

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column - Stats */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{totalPlans}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Total Planes</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{plansThisMonth}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Este Mes</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{avgProgress}%</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Cumplimiento</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{pendingActivities}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Act. Pendientes</p>
            </div>
          </div>

          {/* By Type */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Por Tipo</h3>
            <div className="space-y-2">
              {(Object.keys(byType) as ActionType[]).map((type) => {
                const count = byType[type]
                const total = totalPlans
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
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: typeColors[type] }}
                      />
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {ACTION_TYPE_LABELS[type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                        {count}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        ({Math.round((count / total) * 100)}%)
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* By Status */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Por Estado</h3>
            <div className="space-y-2">
              {(Object.keys(byStatus) as ActionStatus[]).map((status) => {
                const count = byStatus[status]
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(selectedStatus === status ? "all" : status)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                      selectedStatus === status
                        ? "bg-white shadow-sm ring-1 ring-emerald-500"
                        : "bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {status === "completado" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      )}
                      {status === "en_curso" && <Clock className="h-3.5 w-3.5 text-blue-600" />}
                      {status === "vencido" && <XCircle className="h-3.5 w-3.5 text-red-600" />}
                      {status === "pendiente" && <Clock className="h-3.5 w-3.5 text-gray-400" />}
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {ACTION_STATUS_LABELS[status]}
                      </span>
                    </div>
                    <span
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{ color: ACTION_STATUS_COLORS[status] }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Overdue Alert */}
          {byStatus.vencido > 0 && (
            <div className="rounded-xl sm:rounded-2xl bg-red-50 border border-red-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h3 className="text-xs sm:text-sm font-semibold text-red-700">Atención</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-red-600">
                Hay {byStatus.vencido} plan(es) de acción vencido(s) que requieren atención
                inmediata.
              </p>
            </div>
          )}
        </div>

        {/* Center & Right Columns - Plan List */}
        <div className="lg:col-span-9 flex flex-col gap-3 sm:gap-4">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Planes de Acción (CAPA)
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNuevoPlanOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Nuevo Plan
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
                placeholder="Buscar plan, código o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ActionType | "all")}
                  className="appearance-none pl-3 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ActionStatus | "all")}
                  className="appearance-none pl-3 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="all">Todos los estados</option>
                  {Object.entries(ACTION_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Plans Table */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="w-8 px-2"></th>
                    <th className="px-3 py-2 text-left text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-3 py-2 text-left text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Origen
                    </th>
                    <th className="px-3 py-2 text-left text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Avance
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPlans.map((plan) => {
                    const OriginIcon = originIcons[plan.origin]
                    const isExpanded = expandedPlan === plan.id
                    return (
                      <>
                        <tr
                          key={plan.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            isExpanded ? "bg-gray-50" : ""
                          }`}
                        >
                          <td className="px-2">
                            <button
                              onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              <ChevronRight
                                className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[10px] sm:text-xs font-mono text-gray-500">
                              {plan.code}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 max-w-[200px]">
                            <p className="text-[10px] sm:text-xs font-medium text-gray-900 truncate">
                              {plan.title}
                            </p>
                            <p className="text-[9px] text-gray-500 truncate">{plan.finding}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-medium text-white"
                              style={{ backgroundColor: typeColors[plan.type] }}
                            >
                              {ACTION_TYPE_LABELS[plan.type]}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="inline-flex items-center gap-1 text-[9px] text-gray-600">
                              <OriginIcon className="h-3 w-3" />
                              {originLabels[plan.origin]}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-3 w-3 text-gray-500" />
                              </div>
                              <span className="text-[10px] sm:text-xs text-gray-700 truncate max-w-[100px]">
                                {plan.responsible}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`text-[9px] sm:text-[10px] ${
                                plan.status === "vencido" ? "text-red-600 font-medium" : "text-gray-500"
                              }`}
                            >
                              {new Date(plan.dueDate).toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${plan.progress}%`,
                                    backgroundColor:
                                      plan.progress >= 100
                                        ? "#22c55e"
                                        : plan.progress >= 50
                                        ? "#eab308"
                                        : "#ef4444",
                                  }}
                                />
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-medium text-gray-700 w-8 text-right">
                                {plan.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                              style={{
                                backgroundColor: `${ACTION_STATUS_COLORS[plan.status]}15`,
                                color: ACTION_STATUS_COLORS[plan.status],
                              }}
                            >
                              {plan.status === "completado" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {plan.status === "en_curso" && <Clock className="h-3 w-3" />}
                              {plan.status === "vencido" && <XCircle className="h-3 w-3" />}
                              {plan.status === "pendiente" && <Clock className="h-3 w-3" />}
                              {ACTION_STATUS_LABELS[plan.status]}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                <Eye className="h-3.5 w-3.5 text-gray-500" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                <Edit3 className="h-3.5 w-3.5 text-gray-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${plan.id}-expanded`}>
                            <td colSpan={10} className="px-4 py-3 bg-gray-50">
                              <div className="ml-8">
                                <h4 className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                                  Actividades ({plan.activities.filter((a) => a.completed).length}/
                                  {plan.activities.length})
                                </h4>
                                <div className="space-y-1.5">
                                  {plan.activities.map((activity) => (
                                    <div
                                      key={activity.id}
                                      className={`flex items-center gap-3 p-2 rounded-lg ${
                                        activity.completed ? "bg-green-50" : "bg-white"
                                      }`}
                                    >
                                      <div
                                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                          activity.completed
                                            ? "border-green-500 bg-green-500"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {activity.completed && (
                                          <CheckCircle2 className="h-3 w-3 text-white" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p
                                          className={`text-[10px] sm:text-xs ${
                                            activity.completed
                                              ? "text-gray-500 line-through"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {activity.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5 text-[9px] text-gray-400">
                                          <span>{activity.responsible}</span>
                                          <span>
                                            Vence:{" "}
                                            {new Date(activity.dueDate).toLocaleDateString(
                                              "es-CO"
                                            )}
                                          </span>
                                          {activity.completedAt && (
                                            <span className="text-green-600">
                                              Completado:{" "}
                                              {new Date(activity.completedAt).toLocaleDateString(
                                                "es-CO"
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredPlans.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No se encontraron planes de acción</p>
                <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-gray-500">
              Mostrando {filteredPlans.length} de {sampleActionPlans.length} planes
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-[10px] sm:text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-1.5 text-[10px] sm:text-xs rounded-lg bg-emerald-600 text-white">
                1
              </button>
              <button className="px-3 py-1.5 text-[10px] sm:text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={nuevoPlanOpen} onOpenChange={setNuevoPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Nuevo Plan de Acción</DialogTitle>
          </DialogHeader>
          <NuevoPlanForm
            onSubmit={(values) => {
              console.log("Nuevo plan:", values)
              setNuevoPlanOpen(false)
            }}
            onCancel={() => setNuevoPlanOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

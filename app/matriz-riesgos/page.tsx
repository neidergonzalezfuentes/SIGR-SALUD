"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import {
  Plus,
  Filter,
  Download,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  FileText,
  Leaf,
  Scale,
  DollarSign,
  Settings,
  Calculator,
  TrendingUp,
} from "lucide-react"
import { sampleRisks, sampleComplianceStatus } from "@/lib/data"
import {
  RISK_CATEGORY_LABELS,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_LABELS,
  FRAMEWORK_LABELS,
  calculateRiskLevel,
  type RiskCategory,
  type RiskLevel,
} from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NuevoRiesgoForm } from "@/components/matriz-riesgos/nuevo-riesgo-form"

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

// Heat map colors based on risk score (probability x impact)
const getHeatMapColor = (probability: number, impact: number): string => {
  const score = probability * impact
  if (score >= 15) return "bg-red-500"
  if (score >= 10) return "bg-orange-500"
  if (score >= 5) return "bg-yellow-400"
  return "bg-green-500"
}

const getHeatMapColorHex = (probability: number, impact: number): string => {
  const score = probability * impact
  if (score >= 15) return "#ef4444"
  if (score >= 10) return "#f97316"
  if (score >= 5) return "#eab308"
  return "#22c55e"
}

export default function MatrizRiesgosPage() {
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [nuevoRiesgoOpen, setNuevoRiesgoOpen] = useState(false)

  const filteredRisks = sampleRisks.filter((risk) => {
    const matchesCategory = selectedCategory === "all" || risk.category === selectedCategory
    const matchesSearch =
      risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Group risks by position in heat map (residual values)
  const getRisksAtPosition = (prob: number, imp: number) => {
    return filteredRisks.filter(
      (r) => r.probabilityResidual === prob && r.impactResidual === imp
    )
  }

  // Calculate radar chart data
  const radarData = Object.keys(RISK_CATEGORY_LABELS).map((cat) => {
    const categoryRisks = sampleRisks.filter((r) => r.category === cat)
    const avgResidual =
      categoryRisks.length > 0
        ? categoryRisks.reduce(
            (acc, r) => acc + (r.probabilityResidual * r.impactResidual) / 25,
            0
          ) / categoryRisks.length
        : 0
    return {
      category: cat as RiskCategory,
      value: avgResidual * 100,
    }
  })

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column - Radar & Metrics */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* Radar Chart */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Perfil de Riesgo por Categoría
            </h3>
            <div className="relative flex items-center justify-center h-48 sm:h-56">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Radar grid */}
                {[1, 2, 3, 4, 5].map((level) => (
                  <polygon
                    key={level}
                    points={radarData
                      .map((_, i) => {
                        const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2
                        const radius = (level / 5) * 70
                        const x = 100 + radius * Math.cos(angle)
                        const y = 100 + radius * Math.sin(angle)
                        return `${x},${y}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                {/* Radar lines */}
                {radarData.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2
                  const x = 100 + 70 * Math.cos(angle)
                  const y = 100 + 70 * Math.sin(angle)
                  return (
                    <line
                      key={i}
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  )
                })}
                {/* Data polygon */}
                <polygon
                  points={radarData
                    .map((d, i) => {
                      const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2
                      const radius = (d.value / 100) * 70
                      const x = 100 + radius * Math.cos(angle)
                      const y = 100 + radius * Math.sin(angle)
                      return `${x},${y}`
                    })
                    .join(" ")}
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                {/* Labels */}
                {radarData.map((d, i) => {
                  const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2
                  const x = 100 + 85 * Math.cos(angle)
                  const y = 100 + 85 * Math.sin(angle)
                  const Icon = categoryIcons[d.category]
                  return (
                    <g key={d.category}>
                      <foreignObject x={x - 10} y={y - 10} width="20" height="20">
                        <div className="flex items-center justify-center h-5 w-5 rounded bg-white shadow-sm">
                          <Icon className="h-3 w-3 text-gray-600" />
                        </div>
                      </foreignObject>
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {radarData.slice(0, 4).map((d) => (
                <div key={d.category} className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        d.value >= 60 ? "#ef4444" : d.value >= 40 ? "#eab308" : "#22c55e",
                    }}
                  />
                  <span className="text-[9px] text-gray-600 truncate">
                    {RISK_CATEGORY_LABELS[d.category]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Summary */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Resumen de Riesgos
            </h3>
            <div className="space-y-2">
              {(["extremo", "alto", "moderado", "bajo"] as RiskLevel[]).map((level) => {
                const count = filteredRisks.filter((r) => r.levelResidual === level).length
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: RISK_LEVEL_COLORS[level] }}
                      />
                      <span className="text-[10px] sm:text-xs text-gray-700">
                        {RISK_LEVEL_LABELS[level]}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compliance Card */}
          <div className="rounded-xl sm:rounded-2xl bg-emerald-600 p-4 sm:p-5 text-white">
            <h3 className="text-xs sm:text-sm font-semibold mb-3">Marco Normativo</h3>
            <div className="space-y-2">
              {sampleComplianceStatus.slice(0, 3).map((comp) => (
                <div key={comp.framework} className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] text-emerald-100 truncate max-w-[120px]">
                    {FRAMEWORK_LABELS[comp.framework]
                      .replace("NTC-", "")
                      .replace(":2015", "")
                      .replace(":2018", "")
                      .replace(" de 2019", "")
                      .replace(" de 2021", "")}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold">
                    {comp.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Heat Map & Risk List */}
        <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Matriz de Riesgos
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNuevoRiesgoOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Nuevo Riesgo
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium hover:bg-gray-200 transition-colors">
                <Download className="h-3 w-3" />
                Exportar
              </button>
            </div>
          </div>

          {/* Heat Map */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-4">
              Mapa de Calor - Riesgo Residual
            </h3>
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                {/* Y-axis label */}
                <div className="flex">
                  <div className="w-8 sm:w-10 flex items-center justify-center">
                    <span className="text-[8px] sm:text-[10px] text-gray-500 -rotate-90 whitespace-nowrap">
                      Probabilidad
                    </span>
                  </div>
                  <div className="flex-1">
                    {/* Grid */}
                    <div className="grid grid-rows-5 gap-1">
                      {[5, 4, 3, 2, 1].map((prob) => (
                        <div key={prob} className="flex items-center gap-1">
                          <span className="w-4 text-[8px] sm:text-[10px] text-gray-500 text-right">
                            {prob}
                          </span>
                          <div className="flex-1 grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 5].map((imp) => {
                              const risksHere = getRisksAtPosition(prob, imp)
                              return (
                                <div
                                  key={imp}
                                  className={`relative h-10 sm:h-12 rounded ${getHeatMapColor(
                                    prob,
                                    imp
                                  )} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                                  title={`P:${prob} x I:${imp} = ${prob * imp}`}
                                >
                                  {risksHere.length > 0 && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] sm:text-xs font-bold text-white">
                                        {risksHere.length}
                                      </span>
                                      <span className="text-[7px] sm:text-[8px] text-white/80">
                                        riesgo{risksHere.length > 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* X-axis labels */}
                    <div className="flex items-center gap-1 mt-1 ml-5">
                      {[1, 2, 3, 4, 5].map((imp) => (
                        <div key={imp} className="flex-1 text-center">
                          <span className="text-[8px] sm:text-[10px] text-gray-500">{imp}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[8px] sm:text-[10px] text-gray-500 mt-1">
                      Impacto
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span className="text-[9px] sm:text-[10px] text-gray-600">Bajo (1-4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-yellow-400" />
                <span className="text-[9px] sm:text-[10px] text-gray-600">Moderado (5-9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-orange-500" />
                <span className="text-[9px] sm:text-[10px] text-gray-600">Alto (10-14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span className="text-[9px] sm:text-[10px] text-gray-600">Extremo (15-25)</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar riesgo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RiskCategory | "all")}
                className="appearance-none pl-3 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="all">Todas las categorías</option>
                {Object.entries(RISK_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Risk List */}
          <div className="rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-3 py-2 text-left text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-3 py-2 text-left text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Riesgo
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Inherente
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Residual
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRisks.map((risk) => {
                    const Icon = categoryIcons[risk.category]
                    return (
                      <tr key={risk.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] sm:text-xs font-mono text-gray-500">
                            {risk.code}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 max-w-[200px]">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-900 truncate">
                            {risk.name}
                          </p>
                          <p className="text-[9px] text-gray-500 truncate">{risk.area}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                            <Icon className="h-3 w-3 text-gray-600" />
                            <span className="text-[9px] text-gray-600">
                              {RISK_CATEGORY_LABELS[risk.category].slice(0, 4)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div
                            className="inline-flex items-center justify-center h-6 w-6 rounded text-[10px] font-bold text-white"
                            style={{
                              backgroundColor: getHeatMapColorHex(
                                risk.probabilityInherent,
                                risk.impactInherent
                              ),
                            }}
                          >
                            {risk.probabilityInherent * risk.impactInherent}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div
                            className="inline-flex items-center justify-center h-6 w-6 rounded text-[10px] font-bold text-white"
                            style={{
                              backgroundColor: getHeatMapColorHex(
                                risk.probabilityResidual,
                                risk.impactResidual
                              ),
                            }}
                          >
                            {risk.probabilityResidual * risk.impactResidual}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${
                              risk.status === "controlado"
                                ? "bg-green-100 text-green-700"
                                : risk.status === "en_tratamiento"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {risk.status === "controlado" && <CheckCircle2 className="h-3 w-3" />}
                            {risk.status === "en_tratamiento" && <Clock className="h-3 w-3" />}
                            {risk.status === "evaluado" && <AlertTriangle className="h-3 w-3" />}
                            {risk.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Statistics */}
        <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          {/* Control Stats */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Estado de Control
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs text-gray-600">Controlados</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                    {Math.round(
                      (sampleRisks.filter((r) => r.status === "controlado").length /
                        sampleRisks.length) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        (sampleRisks.filter((r) => r.status === "controlado").length /
                          sampleRisks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs text-gray-600">En tratamiento</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-yellow-600">
                    {Math.round(
                      (sampleRisks.filter((r) => r.status === "en_tratamiento").length /
                        sampleRisks.length) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${
                        (sampleRisks.filter((r) => r.status === "en_tratamiento").length /
                          sampleRisks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs text-gray-600">Sin tratamiento</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-red-600">
                    {Math.round(
                      (sampleRisks.filter(
                        (r) => r.status === "identificado" || r.status === "evaluado"
                      ).length /
                        sampleRisks.length) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${
                        (sampleRisks.filter(
                          (r) => r.status === "identificado" || r.status === "evaluado"
                        ).length /
                          sampleRisks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Next Evaluation */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Próximas Evaluaciones
            </h3>
            <div className="space-y-2">
              {sampleRisks
                .sort(
                  (a, b) =>
                    new Date(a.nextEvaluation).getTime() - new Date(b.nextEvaluation).getTime()
                )
                .slice(0, 4)
                .map((risk) => (
                  <div
                    key={risk.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-gray-900 truncate">
                        {risk.code}
                      </p>
                      <p className="text-[9px] text-gray-500 truncate">{risk.name}</p>
                    </div>
                    <span className="text-[9px] text-gray-500 shrink-0 ml-2">
                      {new Date(risk.nextEvaluation).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Risk by Area */}
          <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Top Áreas con Riesgo
            </h3>
            <div className="space-y-2">
              {Array.from(new Set(sampleRisks.map((r) => r.area)))
                .slice(0, 5)
                .map((area) => {
                  const count = sampleRisks.filter((r) => r.area === area).length
                  const maxCount = Math.max(
                    ...Array.from(new Set(sampleRisks.map((r) => r.area))).map(
                      (a) => sampleRisks.filter((r) => r.area === a).length
                    )
                  )
                  return (
                    <div key={area}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] sm:text-[10px] text-gray-600 truncate max-w-[150px]">
                          {area}
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={nuevoRiesgoOpen} onOpenChange={setNuevoRiesgoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Nuevo Riesgo</DialogTitle>
          </DialogHeader>
          <NuevoRiesgoForm
            onSubmit={(values) => {
              console.log("Nuevo riesgo:", values)
              setNuevoRiesgoOpen(false)
            }}
            onCancel={() => setNuevoRiesgoOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

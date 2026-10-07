// Sistema Integrado de Gestión de Riesgos - Tipos

export type RiskCategory =
  | "clinico"
  | "administrativo"
  | "ambiental"
  | "legal"
  | "financiero"
  | "operacional"
  | "actuarial"
  | "mercado"

export type RiskLevel = "extremo" | "alto" | "moderado" | "bajo"

export type RiskStatus = "identificado" | "evaluado" | "en_tratamiento" | "controlado" | "cerrado"

export type EventType = "evento_adverso" | "incidente" | "casi_incidente" | "evento_centinela"

export type EventStatus = "reportado" | "en_investigacion" | "analizado" | "con_plan" | "cerrado"

export type ActionType = "correctiva" | "preventiva" | "mejora"

export type ActionStatus = "pendiente" | "en_curso" | "vencido" | "completado"

export type ActionOrigin = "auditoria" | "evento" | "autoevaluacion" | "queja" | "ronda"

export type AuditType = "interna" | "externa" | "ente_control"

export type AuditStatus = "programada" | "en_ejecucion" | "completada" | "cancelada"

export type FindingType = "nc_mayor" | "nc_menor" | "observacion" | "oportunidad_mejora"

export type ComplianceFramework = "resolucion_3100" | "iso_31000" | "pamec" | "iso_9001" | "circular_004"

// Interfaces principales

export interface Risk {
  id: string
  code: string
  name: string
  description: string
  category: RiskCategory
  process: string
  area: string
  responsible: string
  probabilityInherent: number // 1-5
  impactInherent: number // 1-5
  levelInherent: RiskLevel
  controls: string[]
  probabilityResidual: number // 1-5
  impactResidual: number // 1-5
  levelResidual: RiskLevel
  status: RiskStatus
  lastEvaluation: string
  nextEvaluation: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  code: string
  type: EventType
  title: string
  description: string
  area: string
  service: string
  reportedBy: string
  reportedAt: string
  patient?: {
    age: number
    gender: string
    diagnosis?: string
  }
  severity: 1 | 2 | 3 | 4 // 1=leve, 4=catastrófico
  status: EventStatus
  investigator?: string
  rootCause?: string
  actionPlanId?: string
  closedAt?: string
  relatedRiskId?: string
}

export interface ActionPlan {
  id: string
  code: string
  title: string
  description: string
  finding: string
  type: ActionType
  origin: ActionOrigin
  originId?: string // ID de auditoría, evento, etc.
  responsible: string
  collaborators: string[]
  dueDate: string
  status: ActionStatus
  progress: number // 0-100
  activities: Activity[]
  evidence?: string[]
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface Activity {
  id: string
  description: string
  responsible: string
  dueDate: string
  completed: boolean
  completedAt?: string
}

export interface Audit {
  id: string
  code: string
  title: string
  type: AuditType
  framework: ComplianceFramework
  scope: string
  areas: string[]
  auditors: string[]
  leadAuditor: string
  scheduledDate: string
  startDate?: string
  endDate?: string
  status: AuditStatus
  findings: Finding[]
  reportUrl?: string
  createdAt: string
}

export interface Finding {
  id: string
  type: FindingType
  requirement: string
  description: string
  evidence: string
  area: string
  actionPlanId?: string
  status: "abierto" | "en_tratamiento" | "cerrado"
}

export interface ComplianceStatus {
  framework: ComplianceFramework
  name: string
  totalRequirements: number
  compliant: number
  partiallyCompliant: number
  nonCompliant: number
  notApplicable: number
  percentage: number
  lastAudit?: string
  nextAudit?: string
}

export interface DashboardMetrics {
  totalRisks: number
  criticalRisks: number
  eventsThisMonth: number
  overdueActions: number
  globalRiskScore: number
  risksByCategory: {
    category: RiskCategory
    count: number
    criticalCount: number
    avgLevel: number
  }[]
  recentActivity: {
    id: string
    type: "risk" | "event" | "action" | "audit"
    title: string
    description: string
    timestamp: string
    severity?: RiskLevel
  }[]
  weeklyTrend: {
    day: string
    events: number
    risks: number
  }[]
}

// Constantes de visualización

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  clinico: "Clínico",
  administrativo: "Administrativo",
  ambiental: "Ambiental",
  legal: "Legal",
  financiero: "Financiero",
  operacional: "Operacional",
  actuarial: "Actuarial",
  mercado: "Mercado",
}

export const RISK_CATEGORY_ICONS: Record<RiskCategory, string> = {
  clinico: "Heart",
  administrativo: "FileText",
  ambiental: "Leaf",
  legal: "Scale",
  financiero: "DollarSign",
  operacional: "Settings",
  actuarial: "Calculator",
  mercado: "TrendingUp",
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  extremo: "#EF4444",
  alto: "#F97316",
  moderado: "#EAB308",
  bajo: "#22C55E",
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  extremo: "Extremo",
  alto: "Alto",
  moderado: "Moderado",
  bajo: "Bajo",
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  evento_adverso: "Evento Adverso",
  incidente: "Incidente",
  casi_incidente: "Casi Incidente",
  evento_centinela: "Evento Centinela",
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  evento_adverso: "#EF4444",
  incidente: "#EAB308",
  casi_incidente: "#3B82F6",
  evento_centinela: "#8B5CF6",
}

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  correctiva: "Correctiva",
  preventiva: "Preventiva",
  mejora: "Mejora",
}

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  pendiente: "Pendiente",
  en_curso: "En Curso",
  vencido: "Vencido",
  completado: "Completado",
}

export const ACTION_STATUS_COLORS: Record<ActionStatus, string> = {
  pendiente: "#6B7280",
  en_curso: "#3B82F6",
  vencido: "#EF4444",
  completado: "#22C55E",
}

export const AUDIT_TYPE_LABELS: Record<AuditType, string> = {
  interna: "Auditoría Interna",
  externa: "Auditoría Externa",
  ente_control: "Ente de Control",
}

export const FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  resolucion_3100: "Resolución 3100 de 2019",
  iso_31000: "ISO 31000:2018",
  pamec: "PAMEC",
  iso_9001: "NTC-ISO 9001:2015",
  circular_004: "Circular Externa 004-5/2021",
}

export const FINDING_TYPE_LABELS: Record<FindingType, string> = {
  nc_mayor: "No Conformidad Mayor",
  nc_menor: "No Conformidad Menor",
  observacion: "Observación",
  oportunidad_mejora: "Oportunidad de Mejora",
}

// Funciones de utilidad

export function calculateRiskLevel(probability: number, impact: number): RiskLevel {
  const score = probability * impact
  if (score >= 15) return "extremo"
  if (score >= 8) return "alto"
  if (score >= 4) return "moderado"
  return "bajo"
}

export function getRiskScore(probability: number, impact: number): number {
  return probability * impact
}

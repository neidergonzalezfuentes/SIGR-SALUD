"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RISK_CATEGORY_LABELS, RISK_LEVEL_LABELS, calculateRiskLevel } from "@/lib/types"
import { ipsAreas, ipsProcesses } from "@/lib/data"
import { ShieldAlert, Plus, Trash2, ArrowDown } from "lucide-react"

// ─── Opciones de probabilidad / impacto ───────────────────────────────────────
const probabilityOptions = [
  { value: "1", label: "1 – Muy baja" },
  { value: "2", label: "2 – Baja" },
  { value: "3", label: "3 – Media" },
  { value: "4", label: "4 – Alta" },
  { value: "5", label: "5 – Muy alta" },
]

const impactOptions = [
  { value: "1", label: "1 – Insignificante" },
  { value: "2", label: "2 – Menor" },
  { value: "3", label: "3 – Moderado" },
  { value: "4", label: "4 – Mayor" },
  { value: "5", label: "5 – Catastrófico" },
]

const statusOptions: { value: string; label: string }[] = [
  { value: "identificado",   label: "Identificado" },
  { value: "evaluado",       label: "Evaluado" },
  { value: "en_tratamiento", label: "En Tratamiento" },
  { value: "controlado",     label: "Controlado" },
  { value: "cerrado",        label: "Cerrado" },
]

// ─── Tabla de valoración de controles ─────────────────────────────────────────
//  Atributos de eficiencia
const controlTypeOptions    = [
  { value: "preventivo", label: "Preventivo", weight: 0.25 },
  { value: "detectivo",  label: "Detectivo",  weight: 0.15 },
  { value: "correctivo", label: "Correctivo", weight: 0.10 },
]
const controlImplOptions    = [
  { value: "automatico", label: "Automático", weight: 0.20 },
  { value: "manual",     label: "Manual",     weight: 0.10 },
]
//  Atributos de implementación
const controlDocOptions     = [
  { value: "documentado",    label: "Documentado",    weight: 0.20 },
  { value: "sin_documentar", label: "Sin documentar", weight: 0.00 },
]
const controlFreqOptions    = [
  { value: "continua",  label: "Continua",  weight: 0.15 },
  { value: "aleatoria", label: "Aleatoria", weight: 0.05 },
]
const controlEvidOptions    = [
  { value: "con_registro", label: "Con registro", weight: 0.10 },
  { value: "sin_registro", label: "Sin registro", weight: 0.00 },
]

// Peso máximo posible = 0.25+0.20+0.20+0.15+0.10 = 0.90
const MAX_WEIGHT = 0.90

function controlWeight(c: {
  type?: string; implementation?: string;
  documentation?: string; frequency?: string; evidence?: string
}): number {
  const t = controlTypeOptions.find(o => o.value === c.type)?.weight ?? 0
  const i = controlImplOptions.find(o => o.value === c.implementation)?.weight ?? 0
  const d = controlDocOptions.find(o => o.value === c.documentation)?.weight ?? 0
  const f = controlFreqOptions.find(o => o.value === c.frequency)?.weight ?? 0
  const e = controlEvidOptions.find(o => o.value === c.evidence)?.weight ?? 0
  return t + i + d + f + e
}

// ─── Cálculo del riesgo residual ──────────────────────────────────────────────
function computeResidual(
  inherent: number,
  controls: Parameters<typeof controlWeight>[0][]
): number {
  const valid = controls.filter(c => c.type && c.implementation && c.documentation && c.frequency && c.evidence)
  if (!valid.length) return inherent

  const avgNormalized = valid.reduce((s, c) => s + controlWeight(c) / MAX_WEIGHT, 0) / valid.length
  const reduction = avgNormalized >= 0.78 ? 2 : avgNormalized >= 0.44 ? 1 : 0
  return Math.max(1, inherent - reduction)
}

// ─── Zod schema ───────────────────────────────────────────────────────────────
const controlSchema = z.object({
  description:    z.string().min(3, "Describa el control"),
  type:           z.enum(["preventivo", "detectivo", "correctivo"],   { required_error: "Requerido" }),
  implementation: z.enum(["automatico", "manual"],                    { required_error: "Requerido" }),
  documentation:  z.enum(["documentado", "sin_documentar"],           { required_error: "Requerido" }),
  frequency:      z.enum(["continua", "aleatoria"],                   { required_error: "Requerido" }),
  evidence:       z.enum(["con_registro", "sin_registro"],            { required_error: "Requerido" }),
  owner:          z.string().min(3, "Ingrese el responsable"),
})

const formSchema = z.object({
  name:        z.string().min(5, "Mínimo 5 caracteres").max(120, "Máximo 120 caracteres"),
  description: z.string().min(15, "Mínimo 15 caracteres"),
  category:    z.enum(
    ["clinico", "administrativo", "ambiental", "legal", "financiero", "operacional", "actuarial", "mercado"],
    { required_error: "Seleccione la categoría" }
  ),
  process:     z.string({ required_error: "Seleccione el proceso" }),
  area:        z.string({ required_error: "Seleccione el área" }),
  responsible: z.string().min(3, "Ingrese el responsable"),
  probabilityInherent: z.enum(["1","2","3","4","5"], { required_error: "Requerido" }),
  impactInherent:      z.enum(["1","2","3","4","5"], { required_error: "Requerido" }),
  controls:    z.array(controlSchema).min(1, "Agregue al menos un control"),
  status:      z.enum(["identificado","evaluado","en_tratamiento","controlado","cerrado"], { required_error: "Requerido" }),
  nextEvaluation: z.string().min(1, "Seleccione la fecha"),
})

type FormValues = z.infer<typeof formSchema>

// ─── Helpers visuales ─────────────────────────────────────────────────────────
const levelBadgeClass: Record<string, string> = {
  extremo:  "bg-red-100 text-red-700 border-red-200",
  alto:     "bg-orange-100 text-orange-700 border-orange-200",
  moderado: "bg-yellow-100 text-yellow-700 border-yellow-200",
  bajo:     "bg-green-100 text-green-700 border-green-200",
}

// ─── Componente ───────────────────────────────────────────────────────────────
interface NuevoRiesgoFormProps {
  onSubmit?: (values: FormValues & { probabilityResidual: number; impactResidual: number }) => void
  onCancel?: () => void
}

export function NuevoRiesgoForm({ onSubmit, onCancel }: NuevoRiesgoFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", description: "",
      category: undefined, process: undefined, area: undefined,
      responsible: "",
      probabilityInherent: undefined, impactInherent: undefined,
      controls: [{
        description: "", type: undefined, implementation: undefined,
        documentation: undefined, frequency: undefined, evidence: undefined, owner: "",
      }],
      status: "identificado",
      nextEvaluation: "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "controls" })

  const watchedPI       = form.watch("probabilityInherent")
  const watchedII       = form.watch("impactInherent")
  const watchedControls = form.watch("controls")

  const levelInherent = watchedPI && watchedII
    ? calculateRiskLevel(Number(watchedPI), Number(watchedII)) : null

  const probResidual = watchedPI ? computeResidual(Number(watchedPI), watchedControls) : null
  const impResidual  = watchedII ? computeResidual(Number(watchedII),  watchedControls) : null
  const levelResidual = probResidual && impResidual
    ? calculateRiskLevel(probResidual, impResidual) : null

  // Eficacia promedio de los controles (para mostrársela al usuario)
  const avgEfficacy = watchedControls.length
    ? watchedControls.reduce((s, c) => s + controlWeight(c) / MAX_WEIGHT * 100, 0) / watchedControls.length
    : 0

  function handleSubmit(values: FormValues) {
    onSubmit?.({
      ...values,
      probabilityResidual: probResidual ?? Number(values.probabilityInherent),
      impactResidual:      impResidual  ?? Number(values.impactInherent),
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-500" />
          <CardTitle>Nuevo Riesgo</CardTitle>
        </div>
        <CardDescription>
          Registre un nuevo riesgo en la matriz de gestión de riesgos.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* ── Identificación ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Object.keys(RISK_CATEGORY_LABELS) as Array<keyof typeof RISK_CATEGORY_LABELS>).map(key => (
                        <SelectItem key={key} value={key}>{RISK_CATEGORY_LABELS[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {statusOptions.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del riesgo *</FormLabel>
                <FormControl><Input placeholder="Ej: Errores de medicación en hospitalización" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describa el riesgo, sus causas y posibles consecuencias..." className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="process" render={({ field }) => (
                <FormItem>
                  <FormLabel>Proceso *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                    <SelectContent>{ipsProcesses.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem>
                  <FormLabel>Área *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                    <SelectContent>{ipsAreas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="responsible" render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable *</FormLabel>
                  <FormControl><Input placeholder="Nombre completo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* ── Riesgo Inherente ── */}
            <div>
              <p className="text-sm font-medium mb-3">Riesgo Inherente (sin controles)</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="probabilityInherent" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probabilidad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                      <SelectContent>{probabilityOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="impactInherent" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                      <SelectContent>{impactOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {levelInherent && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Nivel calculado:</span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${levelBadgeClass[levelInherent]}`}>
                    {RISK_LEVEL_LABELS[levelInherent]} · {Number(watchedPI) * Number(watchedII)} pts
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Controles ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Controles *</p>
                <Button
                  type="button" variant="outline" size="sm"
                  onClick={() => append({
                    description: "", type: undefined as any, implementation: undefined as any,
                    documentation: undefined as any, frequency: undefined as any,
                    evidence: undefined as any, owner: "",
                  })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar control
                </Button>
              </div>

              {/* Leyenda de pesos */}
              <div className="mb-4 rounded-md bg-muted/40 border p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Tabla de valoración de controles</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium col-span-2">Atributos de eficiencia</span>
                  <span>Tipo → Preventivo 25% · Detectivo 15% · Correctivo 10%</span>
                  <span>Implementación → Automático 20% · Manual 10%</span>
                  <span className="font-medium col-span-2 mt-1">Atributos de implementación</span>
                  <span>Documentación → Documentado 20% · Sin documentar 0%</span>
                  <span>Frecuencia → Continua 15% · Aleatoria 5%</span>
                  <span>Evidencia → Con registro 10% · Sin registro 0%</span>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const w = controlWeight(watchedControls[index] ?? {})
                  const pct = Math.round(w / MAX_WEIGHT * 100)

                  return (
                    <div key={field.id} className="rounded-lg border border-dashed p-4 space-y-3">
                      {/* Cabecera del control */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Control {index + 1}</span>
                          {pct > 0 && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border
                              ${pct >= 78 ? "bg-green-100 text-green-700 border-green-200"
                                : pct >= 44 ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-red-100 text-red-700 border-red-200"}`}>
                              Eficacia: {pct}%
                            </span>
                          )}
                        </div>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            onClick={() => remove(index)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      {/* Descripción */}
                      <FormField control={form.control} name={`controls.${index}.description`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Descripción *</FormLabel>
                          <FormControl><Input placeholder="Describa el control aplicado" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Atributos de eficiencia */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Atributos de eficiencia</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Tipo */}
                        <FormField control={form.control} name={`controls.${index}.type`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Tipo *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {controlTypeOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label} <span className="text-muted-foreground">({o.weight * 100}%)</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Implementación */}
                        <FormField control={form.control} name={`controls.${index}.implementation`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Implementación *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Implementación" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {controlImplOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label} <span className="text-muted-foreground">({o.weight * 100}%)</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Atributos de implementación */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Atributos de implementación</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {/* Documentación */}
                        <FormField control={form.control} name={`controls.${index}.documentation`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Documentación *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Documentación" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {controlDocOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label} <span className="text-muted-foreground">({o.weight * 100}%)</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Frecuencia */}
                        <FormField control={form.control} name={`controls.${index}.frequency`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Frecuencia *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Frecuencia" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {controlFreqOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label} <span className="text-muted-foreground">({o.weight * 100}%)</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Evidencia */}
                        <FormField control={form.control} name={`controls.${index}.evidence`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Evidencia *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Evidencia" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {controlEvidOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label} <span className="text-muted-foreground">({o.weight * 100}%)</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Responsable */}
                      <FormField control={form.control} name={`controls.${index}.owner`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Responsable *</FormLabel>
                          <FormControl><Input placeholder="Responsable del control" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )
                })}
              </div>

              {form.formState.errors.controls?.root && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.controls.root.message}
                </p>
              )}

              {/* Eficacia promedio */}
              {watchedControls.length > 0 && avgEfficacy > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Eficacia promedio de controles:</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border
                    ${avgEfficacy >= 78 ? "bg-green-100 text-green-700 border-green-200"
                      : avgEfficacy >= 44 ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200"}`}>
                    {Math.round(avgEfficacy)}%
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Riesgo Residual (calculado) ── */}
            <div className="rounded-lg bg-muted/50 border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Riesgo Residual (calculado)</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Se calcula automáticamente a partir de la eficacia ponderada de los controles.
                Una eficacia ≥ 78 % reduce 2 puntos; entre 44 % y 77 % reduce 1 punto.
              </p>

              {levelResidual && probResidual && impResidual ? (
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="rounded-md bg-background border px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">Probabilidad</p>
                    <p className="text-lg font-bold">{probResidual}</p>
                  </div>
                  <div className="rounded-md bg-background border px-3 py-2 text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">Impacto</p>
                    <p className="text-lg font-bold">{impResidual}</p>
                  </div>
                  <div className={`rounded-md border px-3 py-2 text-center ${levelBadgeClass[levelResidual]}`}>
                    <p className="text-[10px] mb-1">Nivel</p>
                    <p className="text-sm font-bold">{RISK_LEVEL_LABELS[levelResidual]}</p>
                    <p className="text-[10px]">{probResidual * impResidual} pts</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Complete el riesgo inherente y al menos un control para ver el resultado.
                </p>
              )}
            </div>

            {/* ── Próxima evaluación ── */}
            <FormField control={form.control} name="nextEvaluation" render={({ field }) => (
              <FormItem>
                <FormLabel>Próxima evaluación *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ── Acciones ── */}
            <div className="flex justify-end gap-3 pt-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              )}
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Registrar riesgo
              </Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
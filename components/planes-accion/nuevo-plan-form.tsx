"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ACTION_TYPE_LABELS } from "@/lib/types"
import { ipsAreas } from "@/lib/data"
import { Target, Plus, Trash2 } from "lucide-react"

const activitySchema = z.object({
  description: z.string().min(3, "Describa la actividad"),
  responsible: z.string().min(3, "Ingrese el responsable"),
  dueDate: z.string().min(1, "Seleccione la fecha límite"),
})

const formSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(120, "El título no puede superar los 120 caracteres"),
  description: z.string().min(20, "Describa el plan con al menos 20 caracteres"),
  finding: z.string().min(10, "Describa el hallazgo o problema que origina el plan"),
  type: z.enum(["correctiva", "preventiva", "mejora"], {
    required_error: "Seleccione el tipo de acción",
  }),
  origin: z.enum(["auditoria", "evento", "autoevaluacion", "queja", "ronda"], {
    required_error: "Seleccione el origen",
  }),
  originId: z.string().optional(),
  area: z.string({ required_error: "Seleccione el área" }),
  responsible: z.string().min(3, "Ingrese el responsable del plan"),
  collaborators: z.string().optional(),
  dueDate: z.string().min(1, "Seleccione la fecha límite"),
  activities: z
    .array(activitySchema)
    .min(1, "Agregue al menos una actividad"),
})

type FormValues = z.infer<typeof formSchema>

const originLabels: Record<string, string> = {
  auditoria: "Auditoría",
  evento: "Evento de Seguridad",
  autoevaluacion: "Autoevaluación",
  queja: "PQRS / Queja",
  ronda: "Ronda de Seguridad",
}

interface NuevoPlanFormProps {
  onSubmit?: (values: FormValues) => void
  onCancel?: () => void
}

export function NuevoPlanForm({ onSubmit, onCancel }: NuevoPlanFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      finding: "",
      type: undefined,
      origin: undefined,
      originId: "",
      area: undefined,
      responsible: "",
      collaborators: "",
      dueDate: "",
      activities: [{ description: "", responsible: "", dueDate: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "activities",
  })

  function handleSubmit(values: FormValues) {
    onSubmit?.(values)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <CardTitle>Nuevo Plan de Acción</CardTitle>
        </div>
        <CardDescription>
          Complete los campos para registrar un plan de acción correctiva, preventiva o de mejora.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Tipo y Origen */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de acción *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(ACTION_TYPE_LABELS) as Array<keyof typeof ACTION_TYPE_LABELS>).map(
                          (key) => (
                            <SelectItem key={key} value={key}>
                              {ACTION_TYPE_LABELS[key]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(originLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ID del origen */}
            <FormField
              control={form.control}
              name="originId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de referencia (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: EVT-001, AUD-003..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del plan *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Plan de mejora para gestión de medicamentos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hallazgo */}
            <FormField
              control={form.control}
              name="finding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hallazgo / Problema *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el hallazgo, no conformidad o situación que origina este plan..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del plan *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalle el enfoque, estrategia y alcance del plan de acción..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Área, Responsable y Fecha límite */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ipsAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha límite *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Colaboradores */}
            <FormField
              control={form.control}
              name="collaborators"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaboradores (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombres separados por coma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Actividades */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Actividades *</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", responsible: "", dueDate: "" })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Agregar actividad
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative rounded-lg border border-dashed p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Actividad {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`activities.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Descripción *</FormLabel>
                          <FormControl>
                            <Input placeholder="Describa la actividad a realizar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`activities.${index}.responsible`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Responsable *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del responsable" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`activities.${index}.dueDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Fecha límite *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {form.formState.errors.activities?.root && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.activities.root.message}
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Crear plan
              </Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useForm } from "react-hook-form"
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
import { EVENT_TYPE_LABELS } from "@/lib/types"
import { ipsAreas } from "@/lib/data"
import { AlertTriangle } from "lucide-react"

const formSchema = z.object({
  type: z.enum(["evento_adverso", "incidente", "casi_incidente", "evento_centinela"], {
    required_error: "Seleccione el tipo de evento",
  }),
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(120, "El título no puede superar los 120 caracteres"),
  description: z
    .string()
    .min(20, "Describa el evento con al menos 20 caracteres"),
  area: z.string({ required_error: "Seleccione el área" }),
  service: z.string().min(2, "Ingrese el servicio involucrado"),
  reportedBy: z.string().min(3, "Ingrese el nombre de quien reporta"),
  reportedAt: z.string().min(1, "Seleccione la fecha y hora del evento"),
  severity: z.enum(["1", "2", "3", "4"], {
    required_error: "Seleccione la severidad",
  }),
  patientAge: z.string().optional(),
  patientGender: z.enum(["masculino", "femenino", "otro", ""]).optional(),
  patientDiagnosis: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const severityLabels: Record<string, string> = {
  "1": "1 – Leve",
  "2": "2 – Moderado",
  "3": "3 – Grave",
  "4": "4 – Catastrófico",
}

interface ReporteEventoFormProps {
  onSubmit?: (values: FormValues) => void
  onCancel?: () => void
}

export function ReporteEventoForm({ onSubmit, onCancel }: ReporteEventoFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      title: "",
      description: "",
      area: undefined,
      service: "",
      reportedBy: "",
      reportedAt: "",
      severity: undefined,
      patientAge: "",
      patientGender: "",
      patientDiagnosis: "",
    },
  })

  function handleSubmit(values: FormValues) {
    onSubmit?.(values)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <CardTitle>Reportar Evento</CardTitle>
        </div>
        <CardDescription>
          Complete todos los campos requeridos para registrar el evento de seguridad.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Tipo y Severidad */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de evento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(EVENT_TYPE_LABELS) as Array<keyof typeof EVENT_TYPE_LABELS>).map(
                          (key) => (
                            <SelectItem key={key} value={key}>
                              {EVENT_TYPE_LABELS[key]}
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
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severidad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar severidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(severityLabels).map(([value, label]) => (
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

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del evento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Caída de paciente en hospitalización" {...field} />
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
                  <FormLabel>Descripción del evento *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa detalladamente qué ocurrió, cómo y en qué circunstancias..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Área y Servicio */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
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
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Medicina Interna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reportado por y Fecha */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="reportedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reportado por *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reportedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y hora del evento *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Datos del paciente (opcionales) */}
            <div>
              <p className="text-sm font-medium mb-3 text-muted-foreground">
                Datos del paciente (opcional)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="patientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Años" min={0} max={120} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientDiagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico</FormLabel>
                      <FormControl>
                        <Input placeholder="Diagnóstico principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit">Reportar evento</Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

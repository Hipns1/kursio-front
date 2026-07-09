import type { Exercise, GradeResult } from '@/types/learning'

export async function gradeWithAPI(exercise: Exercise, userAnswer: string, apiKey: string): Promise<GradeResult> {
  const isCodeAlong = exercise.type === 'code-along'

  const system = isCodeAlong
    ? `Sos un evaluador de ejercicios de .NET backend. El alumno completó un code-along y pegó su código.
Evaluá si el código es correcto, funcional y sigue el patrón esperado del proyecto.
Respondé SOLO con JSON válido, sin texto extra:
{"autoCorrect": true|false|null, "score": 0-100, "feedback": "2-3 oraciones sobre el código: qué está bien, qué mejorar"}
true=correcto, false=incorrecto o no es código real, null=parcialmente correcto.`
    : `Sos un evaluador de ejercicios de .NET backend para un dev con base en React/TypeScript.
Calificá la respuesta del alumno. Respondé SOLO con JSON válido, sin texto extra:
{"autoCorrect": true|false|null, "score": 0-100, "feedback": "1-2 oraciones específicas"}
autoCorrect: true=correcto, false=incorrecto, null=parcial.
En el feedback, compará con React/TypeScript si es relevante.`

  const msg = `Ejercicio: ${exercise.id} (${exercise.type})
Pregunta: ${exercise.question}
${exercise.code ? `Código:\n${exercise.code}\n` : ''}Explicación esperada: ${exercise.explanation}
Respuesta del alumno: ${userAnswer}`

  const url = import.meta.env.VITE_ANTHROPIC_URL ?? 'https://api.anthropic.com/v1/messages'
  const model = import.meta.env.VITE_ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: msg }],
    }),
  })

  if (!res.ok) throw new Error(`API ${res.status}`)

  const data = await res.json()
  const raw = (data.content[0].text as string).trim()
  const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(clean) as GradeResult
}

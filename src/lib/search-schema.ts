import { z } from 'zod'

export const searchSchema = z.object({
  g: z.string().optional(),
  editor: z.enum(['open', 'closed']).optional(),
})

export type SearchParams = z.infer<typeof searchSchema>

import prisma from './prisma'
import { z } from 'zod'

const bodySchema = z.object({
	name: z.string().min(1),
	color: z.string().regex(/^#([0-9a-fA-F]{6})$/),
	isAdmin: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
	const json = await readBody(event)
	const data = bodySchema.parse(json)
	const created = await prisma.familyMember.create({ data })
	return created
})
import prisma from '../prisma'

type Body = {
  title?: string
  date?: string // optional: move event date (all-day semantics)
  memberIds?: string[] | null
}

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const id = params.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing event id' })

  const body = await readBody<Body>(event)

  const dataToUpdate: Record<string, any> = {}
  if (typeof body.title === 'string') dataToUpdate.title = body.title
  if (typeof body.date === 'string') {
    const d = new Date(body.date)
    if (Number.isNaN(d.getTime())) throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
    dataToUpdate.startsAt = d
    dataToUpdate.allDay = true
  }

  const result = await prisma.$transaction(async (tx) => {
    if (Object.keys(dataToUpdate).length > 0) {
      await tx.event.update({ where: { id }, data: dataToUpdate })
    } else {
      // ensure it exists
      const exists = await tx.event.findUnique({ where: { id }, select: { id: true } })
      if (!exists) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (Array.isArray(body.memberIds)) {
      // replace participants with provided list
      await tx.eventParticipant.deleteMany({ where: { eventId: id } })
      const uniqueIds = Array.from(new Set(body.memberIds.filter(Boolean)))
      if (uniqueIds.length > 0) {
        await tx.eventParticipant.createMany({
          data: uniqueIds.map((memberId) => ({ eventId: id, memberId })),
          skipDuplicates: true,
        })
      }
    }

    return tx.event.findUnique({
      where: { id },
      include: { participants: { include: { member: true } }, creator: true },
    })
  })

  return result
})



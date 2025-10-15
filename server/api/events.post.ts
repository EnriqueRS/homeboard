import prisma from './prisma'

type Body = {
  title: string
  date: string // ISO date (yyyy-MM-dd or full ISO). Will be treated as all-day
  memberId?: string | null
  memberIds?: string[] | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  if (!body?.title || !body?.date) {
    throw createError({ statusCode: 400, statusMessage: 'title and date are required' })
  }

  const date = new Date(body.date)
  if (Number.isNaN(date.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }

  const created = await prisma.$transaction(async (tx) => {
    const eventCreated = await tx.event.create({
      data: {
        title: body.title,
        startsAt: date,
        allDay: true,
      },
    })

    const uniqueIds = Array.from(
      new Set([
        ...(Array.isArray(body.memberIds) ? body.memberIds : []),
        ...(body.memberId ? [body.memberId] : []),
      ].filter(Boolean) as string[])
    )

    if (uniqueIds.length > 0) {
      await tx.eventParticipant.createMany({
        data: uniqueIds.map((id) => ({ eventId: eventCreated.id, memberId: id })),
        skipDuplicates: true,
      })
    }

    return tx.event.findUnique({
      where: { id: eventCreated.id },
      include: {
        participants: { include: { member: true } },
        creator: true,
      },
    })
  })

  return created
})



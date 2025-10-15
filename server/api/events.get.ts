import prisma from './prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  console.log("query", query);
  const startParam = Array.isArray(query.start) ? query.start[0] : query.start
  const endParam = Array.isArray(query.end) ? query.end[0] : query.end

  console.log("startParam", startParam);
  console.log("endParam", endParam);


  let start: Date
  let end: Date

  if (!startParam || !endParam) {
    // Default: start = today, end = one month from today
    const today = new Date()
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    end = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  } else {
    start = new Date(startParam as string)
    end = new Date(endParam as string)
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid start or end date' })
  }

  const events = await prisma.Event.findMany({
    where: {
      OR: [
        { startsAt: { gte: start, lte: end } },
        { endsAt: { gte: start, lte: end } },
      ],
    },
    include: {
      participants: { include: { member: true } },
      creator: true,
    },
    orderBy: { startsAt: 'asc' },
  })

  return events
})



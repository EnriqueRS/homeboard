import prisma from './prisma'


export default defineEventHandler(async (event) => {
  const members = await prisma.familyMember.findMany()
  return members
})

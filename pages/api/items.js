import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const items = await prisma.item.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(items);
}

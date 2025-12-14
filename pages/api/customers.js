import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(customers);
}

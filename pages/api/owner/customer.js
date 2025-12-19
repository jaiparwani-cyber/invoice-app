import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  await prisma.customer.create({
    data: { name: req.body.name }
  });
  res.status(200).end();
}

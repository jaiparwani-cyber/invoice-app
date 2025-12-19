import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  await prisma.item.create({
    data: {
      name: req.body.name,
      rate: Number(req.body.rate)
    }
  });
  res.status(200).end();
}

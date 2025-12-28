import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, rate } = req.body;

  if (!id || rate === undefined) {
    return res.status(400).json({ error: 'Item id and rate are required' });
  }

  try {
    await prisma.item.update({
      where: { id: Number(id) },
      data: { rate: Number(rate) }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item rate' });
  }
}

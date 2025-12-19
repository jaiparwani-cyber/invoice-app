import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { customerId, startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing dates' });
  }

  let sql = `
    SELECT
      c.name AS customer,
      ii.itemName,
      ii.rate,
      ii.quantity,
      (ii.rate * ii.quantity) AS amount,
      i.createdAt
    FROM Invoice i
    JOIN InvoiceItem ii ON ii.invoiceId = i.id
    JOIN Customer c ON c.id = i.customerId
    WHERE i.createdAt BETWEEN ? AND ?
  `;

  const params = [startDate, endDate];

  if (customerId && customerId !== 'all') {
    sql += ' AND c.id = ?';
    params.push(Number(customerId));
  }

  sql += ' ORDER BY c.name, i.createdAt';

  const data = await prisma.$queryRawUnsafe(sql, ...params);

  res.json(data);
}

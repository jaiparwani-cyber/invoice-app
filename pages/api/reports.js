import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { customerId, startDate, endDate } = req.query;

  let sql = `
    SELECT
      c.name            AS customer,
      ii.itemName       AS item,
      ii.rate           AS rate,
      ii.quantity       AS quantity,
      (ii.rate * ii.quantity) AS amount,
      i.invoiceNumber   AS invoiceNumber,
      i.createdAt       AS invoiceDate
    FROM Invoice i
    JOIN InvoiceItem ii ON ii.invoiceId = i.id
    JOIN Customer c ON c.id = i.customerId
    WHERE 1 = 1
  `;

  const params = [];

  if (startDate && endDate) {
    sql += ` AND i.createdAt BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  if (customerId && customerId !== 'all') {
    sql += ` AND c.id = ?`;
    params.push(Number(customerId));
  }

  sql += ` ORDER BY i.createdAt DESC`;

  const data = await prisma.$queryRawUnsafe(sql, ...params);

  res.json(data);
}


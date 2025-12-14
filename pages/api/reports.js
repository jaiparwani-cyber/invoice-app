import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { customerId, startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing dates' });
  }

  let query;
  let params;

  if (customerId && customerId !== 'all') {
    query = `
      SELECT 
        c.name AS customer,
        SUM(ii.quantity) AS totalQty,
        SUM(ii.quantity * ii.rate) AS totalAmount
      FROM Invoice i
      JOIN InvoiceItem ii ON ii.invoiceId = i.id
      JOIN Customer c ON c.id = i.customerId
      WHERE i.createdAt BETWEEN ? AND ?
        AND c.id = ?
      GROUP BY c.name;
    `;
    params = [startDate, endDate, Number(customerId)];
  } else {
    query = `
      SELECT 
        c.name AS customer,
        SUM(ii.quantity) AS totalQty,
        SUM(ii.quantity * ii.rate) AS totalAmount
      FROM Invoice i
      JOIN InvoiceItem ii ON ii.invoiceId = i.id
      JOIN Customer c ON c.id = i.customerId
      WHERE i.createdAt BETWEEN ? AND ?
      GROUP BY c.name;
    `;
    params = [startDate, endDate];
  }

  const data = await prisma.$queryRawUnsafe(query, ...params);

  res.json(data);
}

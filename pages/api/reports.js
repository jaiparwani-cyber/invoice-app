import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { customerId, startDate, endDate } = req.query;

  const data = await prisma.$queryRaw`
    SELECT 
      c.name AS customer,
      SUM(ii.quantity) AS totalQty,
      SUM(ii.quantity * ii.rate) AS totalAmount
    FROM Invoice i
    JOIN InvoiceItem ii ON ii.invoiceId = i.id
    JOIN Customer c ON c.id = i.customerId
    WHERE i.createdAt BETWEEN ${startDate} AND ${endDate}
    ${customerId !== 'all'
      ? prisma.$unsafe(`AND c.id = ${Number(customerId)}`)
      : prisma.$unsafe('')}
    GROUP BY c.name;
  `;

  res.json(data);
}

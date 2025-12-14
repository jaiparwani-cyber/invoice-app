import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { startDate, endDate } = req.query;

  const data = await prisma.$queryRaw`
    SELECT 
      c.name AS customer,
      SUM(ii.quantity) AS totalQty,
      SUM(ii.quantity * ii.rate) AS totalAmount
    FROM Invoice i
    JOIN InvoiceItem ii ON ii.invoiceId = i.id
    JOIN Customer c ON c.id = i.customerId
    WHERE i.createdAt BETWEEN ${startDate} AND ${endDate}
    GROUP BY c.name;
  `;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sales');

  sheet.columns = [
    { header: 'Customer', key: 'customer', width: 30 },
    { header: 'Quantity', key: 'totalQty', width: 15 },
    { header: 'Total Sales', key: 'totalAmount', width: 20 }
  ];

  sheet.addRows(data);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="sales.xlsx"'
  );

  await workbook.xlsx.write(res);
  res.end();
}

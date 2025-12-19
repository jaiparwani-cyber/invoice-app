import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { customerId, startDate, endDate } = req.query;

  let sql = `
    SELECT
      c.name            AS customer,
      i.invoiceNumber   AS invoiceNumber,
      DATE(i.createdAt) AS invoiceDate,
      ii.itemName       AS item,
      ii.quantity       AS quantity,
      ii.rate           AS rate,
      (ii.quantity * ii.rate) AS amount
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

  const rows = await prisma.$queryRawUnsafe(sql, ...params);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tally Import');

  sheet.columns = [
    { header: 'Customer',       key: 'customer',       width: 25 },
    { header: 'Invoice No',     key: 'invoiceNumber', width: 15 },
    { header: 'Invoice Date',   key: 'invoiceDate',   width: 15 },
    { header: 'Item',           key: 'item',          width: 25 },
    { header: 'Quantity',       key: 'quantity',      width: 12 },
    { header: 'Rate',           key: 'rate',          width: 12 },
    { header: 'Amount',         key: 'amount',        width: 15 }
  ];

  sheet.addRows(rows);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="tally-import.xlsx"'
  );

  await workbook.xlsx.write(res);
  res.end();
}


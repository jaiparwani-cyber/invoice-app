import { PrismaClient } from '@prisma/client';
import { PDFDocument } from 'pdf-lib';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { date } = req.body;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const invoices = await prisma.invoice.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { customer: true, items: true }
  });

  const customers = {};
  const itemSet = new Set();

  invoices.forEach(inv => {
    const cname = inv.customer.name;
    customers[cname] ||= {};

    inv.items.forEach(it => {
      itemSet.add(it.itemName);
      customers[cname][it.itemName] =
        (customers[cname][it.itemName] || 0) + it.quantity;
    });
  });

  const items = Array.from(itemSet);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);

  let y = 800;
  page.drawText(`Delivery Report: ${date}`, { x: 50, y, size: 14 });
  y -= 30;

  page.drawText('Customer', { x: 50, y, size: 10 });
  items.forEach((it, i) => {
    page.drawText(it, { x: 150 + i * 60, y, size: 10 });
  });
  y -= 15;

  Object.entries(customers).forEach(([customer, data]) => {
    page.drawText(customer, { x: 50, y, size: 10 });
    items.forEach((it, i) => {
      page.drawText(
        String(data[it] || 0),
        { x: 150 + i * 60, y, size: 10 }
      );
    });
    y -= 15;
  });

  y -= 10;
  page.drawText('Total', { x: 50, y, size: 11 });

  items.forEach((it, i) => {
    const total = Object.values(customers)
      .reduce((s, c) => s + (c[it] || 0), 0);

    page.drawText(
      String(total),
      { x: 150 + i * 60, y, size: 11 }
    );
  });

  const pdfBytes = await pdf.save();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="report-${date}.pdf"`
  );
  res.send(Buffer.from(pdfBytes));
}

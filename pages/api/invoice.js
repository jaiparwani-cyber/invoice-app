import { PrismaClient } from '@prisma/client';
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, items } = req.body;

  const customer = await prisma.customer.upsert({
    where: { name },
    update: {},
    create: { name }
  });

  // Invoice with pure incremental ID only
  const invoice = await prisma.invoice.create({
    data: { customerId: customer.id, invoiceNumber: '' }
  });

  const invoiceNumber = invoice.id.toString();

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { invoiceNumber }
  });

  for (const i of items) {
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        itemName: i.item,
        rate: Number(i.rate),
        quantity: Number(i.quantity)
      }
    });
  }

  /* ---------------- PDF ---------------- */

  const pdfDoc = await PDFDocument.create();

  // A6 size (portrait)
  const page = pdfDoc.addPage([298, 420]);
  const pageHeight = page.getHeight();

  let y = pageHeight - 30;

  // Helper: ddmmyyyy
  const now = new Date();
const formattedDate =
  String(now.getDate()).padStart(2, '0') + '/' +
  String(now.getMonth() + 1).padStart(2, '0') + '/' +
  String(now.getFullYear()).slice(-2);


  // Header
  page.drawText('Vinay Traders', { x: 20, y, size: 16 });
  y -= 22;

  page.drawText(`Invoice #: ${invoiceNumber}`, { x: 20, y, size: 11 });
  page.drawText(`Date: ${formattedDate}`, { x: 170, y, size: 11 });
  y -= 18;

  page.drawText(`Customer: ${name}`, { x: 20, y, size: 11 });
  y -= 20;

  // Table headers
  page.drawText('Item', { x: 20, y, size: 11 });
  page.drawText('Rate', { x: 140, y, size: 11 });
  page.drawText('Qty', { x: 185, y, size: 11 });
  page.drawText('Amount', { x: 220, y, size: 11 });
  y -= 10;

  page.drawLine({
    start: { x: 20, y },
    end: { x: 275, y }
  });
  y -= 12;

  // Rows
  let grandTotal = 0;

  for (const i of items) {
    const rate = Number(i.rate);
    const qty = Number(i.quantity);
    const amount = rate * qty;
    grandTotal += amount;

    page.drawText(i.item, { x: 20, y, size: 11 });
    page.drawText(rate.toFixed(2), { x: 140, y, size: 11 });
    page.drawText(qty.toString(), { x: 185, y, size: 11 });
    page.drawText(amount.toFixed(2), { x: 220, y, size: 11 });

    y -= 10;

    // Line after each item
    page.drawLine({
      start: { x: 20, y },
      end: { x: 275, y }
    });

    y -= 12;
  }

  // Grand total separator (same width as others)
  page.drawLine({
    start: { x: 20, y },
    end: { x: 275, y }
  });
  y -= 15;

  page.drawText('Grand Total', { x: 120, y, size: 12 });
  page.drawText(grandTotal.toFixed(2), { x: 220, y, size: 12 });

  const pdfBytes = await pdfDoc.save();

  /* ---------------- Email ---------------- */

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Invoice ${invoiceNumber}`,
    attachments: [{ filename: 'invoice.pdf', content: pdfBytes }]
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="invoice-${invoiceNumber}.pdf"`
  );

  res.send(Buffer.from(pdfBytes));
}

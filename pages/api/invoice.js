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

  const invoice = await prisma.invoice.create({
    data: { customerId: customer.id, invoiceNumber: 'TEMP' }
  });

  const now = new Date();
  const invoiceNumber = `${invoice.id}${now.getHours()}${now.getMinutes()}`;

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

  // PDF
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([595, 842]); // A4
const pageHeight = page.getHeight();

let y = pageHeight - 40;

// Header
page.drawText('ARJUN DAS AND SONS', { x: 50, y, size: 18 });
y -= 30;

page.drawText(`Invoice #: ${invoiceNumber}`, { x: 50, y, size: 12 });
page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
  x: 350,
  y,
  size: 12
});
y -= 20;

page.drawText(`Customer: ${name}`, { x: 50, y, size: 12 });
y -= 30;

// Table headers
page.drawText('Item', { x: 50, y, size: 11 });
page.drawText('Rate', { x: 300, y, size: 11 });
page.drawText('Qty', { x: 380, y, size: 11 });
page.drawText('Amount', { x: 450, y, size: 11 });
y -= 15;

page.drawLine({
  start: { x: 50, y },
  end: { x: 545, y }
});
y -= 15;

// Table rows
let grandTotal = 0;

for (const i of items) {
  const rate = Number(i.rate);
  const qty = Number(i.quantity);
  const amount = rate * qty;
  grandTotal += amount;

  page.drawText(i.item, { x: 50, y, size: 11 });
  page.drawText(rate.toFixed(2), { x: 300, y, size: 11 });
  page.drawText(qty.toString(), { x: 380, y, size: 11 });
  page.drawText(amount.toFixed(2), { x: 450, y, size: 11 });

  y -= 20;
}

// Total
y -= 10;
page.drawLine({
  start: { x: 350, y },
  end: { x: 545, y }
});
y -= 20;

page.drawText('Grand Total', { x: 350, y, size: 12 });
page.drawText(grandTotal.toFixed(2), { x: 450, y, size: 12 });

const pdfBytes = await pdfDoc.save();


  // Email
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

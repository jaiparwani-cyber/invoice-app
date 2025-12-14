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
  const page = pdfDoc.addPage();
  page.drawText(
    `Arjun Das and Sons\nInvoice #: ${invoiceNumber}\nCustomer: ${name}`
  );
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

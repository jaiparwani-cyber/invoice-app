import { PrismaClient } from '@prisma/client';
import { PDFDocument, degrees, StandardFonts } from 'pdf-lib';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const { date } = req.body;

    /* =======================
       BUILD REPORT DATA
    ======================= */

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      include: {
        customer: true,
        items: true
      }
    });

    const customers = {};
    const itemSet = new Set();

    invoices.forEach(inv => {
      const customerName = inv.customer.name;

      if (!customers[customerName]) {
        customers[customerName] = {};
      }

      inv.items.forEach(item => {
        itemSet.add(item.itemName);
        customers[customerName][item.itemName] =
          (customers[customerName][item.itemName] || 0) + item.quantity;
      });
    });

    const items = Array.from(itemSet);

    /* =======================
       CREATE PDF
    ======================= */

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let page = pdf.addPage([595, 842]); // A4 portrait
    const pageHeight = page.getHeight();

    const startX = 40;
    const startY = pageHeight - 80;

    const dataRowHeight = 28;
    const headerFontSize = 9;
    const padding = 14;

    // 🔹 Dynamic header/footer height based on longest item name
    const headerRowHeight =
      Math.max(
        ...items.map(it =>
          font.widthOfTextAtSize(it, headerFontSize)
        )
      ) + padding;

    // 🔹 Narrow columns (vertical text does not need width)
    const colWidths = [110, ...items.map(() => 40)];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    let y = startY;

    // Title
    page.drawText(`Delivery Report: ${date}`, {
      x: startX,
      y: pageHeight - 40,
      size: 14
    });

    /* =======================
       HELPERS
    ======================= */

    const drawHLine = (yPos) => {
      page.drawLine({
        start: { x: startX, y: yPos },
        end: { x: startX + tableWidth, y: yPos }
      });
    };

    const drawVLines = (yTop, yBottom) => {
      let x = startX;
      colWidths.forEach(w => {
        page.drawLine({
          start: { x, y: yTop },
          end: { x, y: yBottom }
        });
        x += w;
      });
      page.drawLine({
        start: { x: startX + tableWidth, y: yTop },
        end: { x: startX + tableWidth, y: yBottom }
      });
    };

    const newPageIfNeeded = (height) => {
      if (y - height < 40) {
        page = pdf.addPage([595, 842]);
        y = startY;
      }
    };

    /* =======================
       HEADER ROW (VERTICAL)
    ======================= */

    newPageIfNeeded(headerRowHeight);

    drawHLine(y);
    drawHLine(y - headerRowHeight);
    drawVLines(y, y - headerRowHeight);

    page.drawText('Customer', {
      x: startX + 5,
      y: y - headerRowHeight / 2 + 4,
      size: 10
    });

    let xCursor = startX + colWidths[0];
    items.forEach((it, i) => {
      const colCenterX = xCursor + colWidths[i + 1] / 2;

      page.drawText(it, {
        x: colCenterX + 4,
        y: y - headerRowHeight + 6,
        size: headerFontSize,
        rotate: degrees(90)
      });

      xCursor += colWidths[i + 1];
    });

    y -= headerRowHeight;

    /* =======================
       CUSTOMER ROWS
    ======================= */

    for (const [customer, data] of Object.entries(customers)) {
      newPageIfNeeded(dataRowHeight);

      drawHLine(y - dataRowHeight);
      drawVLines(y, y - dataRowHeight);

      page.drawText(customer, {
        x: startX + 5,
        y: y - 18,
        size: 10
      });

      let xPos = startX + colWidths[0];
      items.forEach((it, i) => {
        page.drawText(String(data[it] || 0), {
          x: xPos + 14,
          y: y - 18,
          size: 10
        });
        xPos += colWidths[i + 1];
      });

      y -= dataRowHeight;
    }

    /* =======================
       TOTAL ROW
    ======================= */

    newPageIfNeeded(dataRowHeight);

    drawHLine(y - dataRowHeight);
    drawVLines(y, y - dataRowHeight);

    page.drawText('Total', {
      x: startX + 5,
      y: y - 18,
      size: 11
    });

    let totalX = startX + colWidths[0];
    items.forEach((it, i) => {
      const total = Object.values(customers)
        .reduce((s, c) => s + (c[it] || 0), 0);

      page.drawText(String(total), {
        x: totalX + 14,
        y: y - 18,
        size: 11
      });

      totalX += colWidths[i + 1];
    });

    drawHLine(y);
    y -= dataRowHeight;

    /* =======================
       BOTTOM ITEM NAMES (VERTICAL)
    ======================= */

    newPageIfNeeded(headerRowHeight);

    drawHLine(y);
    drawHLine(y - headerRowHeight);
    drawVLines(y, y - headerRowHeight);

    page.drawText('Items', {
      x: startX + 5,
      y: y - headerRowHeight / 2 + 4,
      size: 10
    });

    let itemX = startX + colWidths[0];
    items.forEach((it, i) => {
      const colCenterX = itemX + colWidths[i + 1] / 2;

      page.drawText(it, {
        x: colCenterX + 4,
        y: y - headerRowHeight + 6,
        size: headerFontSize,
        rotate: degrees(90)
      });

      itemX += colWidths[i + 1];
    });

    drawHLine(y - headerRowHeight);

    /* =======================
       SAVE & SEND
    ======================= */

    const pdfBytes = await pdf.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="delivery-${date}.pdf"`
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err));
  }
}

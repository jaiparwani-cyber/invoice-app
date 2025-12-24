const pdf = await PDFDocument.create();
const page = pdf.addPage([595, 842]);

const startX = 40;
const startY = 760;
const rowHeight = 20;
const colWidths = [110, ...items.map(() => 60)]; // Customer + items
const tableWidth = colWidths.reduce((a, b) => a + b, 0);

let y = startY;

// Title
page.drawText(`Delivery Report: ${date}`, { x: startX, y: 800, size: 14 });

// Helper: draw horizontal line
const drawHLine = (yPos) => {
  page.drawLine({
    start: { x: startX, y: yPos },
    end: { x: startX + tableWidth, y: yPos }
  });
};

// Helper: draw vertical lines
const drawVLines = (yTop, yBottom) => {
  let x = startX;
  colWidths.forEach(w => {
    page.drawLine({
      start: { x, y: yTop },
      end: { x, y: yBottom }
    });
    x += w;
  });
  // right border
  page.drawLine({
    start: { x: startX + tableWidth, y: yTop },
    end: { x: startX + tableWidth, y: yBottom }
  });
};

/* ---------- Header Row ---------- */
drawHLine(y);
drawHLine(y - rowHeight);
drawVLines(y, y - rowHeight);

page.drawText('Customer', { x: startX + 5, y: y - 14, size: 10 });

let xCursor = startX + colWidths[0];
items.forEach((it, i) => {
  page.drawText(it, { x: xCursor + 5, y: y - 14, size: 10 });
  xCursor += colWidths[i + 1];
});

y -= rowHeight;

/* ---------- Customer Rows ---------- */
Object.entries(customers).forEach(([customer, data]) => {
  drawHLine(y - rowHeight);
  drawVLines(y, y - rowHeight);

  page.drawText(customer, { x: startX + 5, y: y - 14, size: 10 });

  let xPos = startX + colWidths[0];
  items.forEach((it, i) => {
    page.drawText(
      String(data[it] || 0),
      { x: xPos + 5, y: y - 14, size: 10 }
    );
    xPos += colWidths[i + 1];
  });

  y -= rowHeight;
});

/* ---------- Totals Row ---------- */
drawHLine(y - rowHeight);
drawVLines(y, y - rowHeight);

page.drawText('Total', { x: startX + 5, y: y - 14, size: 11 });

let totalX = startX + colWidths[0];
items.forEach((it, i) => {
  const total = Object.values(customers)
    .reduce((s, c) => s + (c[it] || 0), 0);

  page.drawText(
    String(total),
    { x: totalX + 5, y: y - 14, size: 11 }
  );

  totalX += colWidths[i + 1];
});

drawHLine(y);

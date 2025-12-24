import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { date } = req.body;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const invoices = await prisma.invoice.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end
      }
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

  const rows = Object.keys(customers).map(customer => ({
    customer,
    ...customers[customer]
  }));

  const totals = {};
  items.forEach(item => {
    totals[item] = rows.reduce((sum, r) => sum + (r[item] || 0), 0);
  });

  res.json({ items, rows, totals });
}

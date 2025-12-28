await prisma.item.update({
  where: { id: Number(id) },
  data: { rate: Number(rate) }
});

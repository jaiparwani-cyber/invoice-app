await prisma.item.delete({
  where: { id: Number(id) }
});

export default async function handler(req, res) {
  const { id } = req.query;

  await prisma.item.delete({
    where: { id: Number(id) }
  });

  res.status(200).end();
}


export default function handler(req, res) {
  const { password } = req.body;

  if (password === process.env.OWNER_PASSWORD) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).end();
  }
}

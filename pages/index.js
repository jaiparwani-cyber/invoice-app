import Link from 'next/link';

export default function Home() {
  return (
    <>
      <h1>Arjun Das and Sons</h1>
      <Link href="/invoice">Create Invoice</Link><br />
      <Link href="/reports">Reports</Link>
    </>
  );
}

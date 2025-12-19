import Link from 'next/link';

export default function Home() {
  return (
    <div className="home">
      <h1>Arjun Das and Sons</h1>

      <div className="home-buttons">
        <Link href="/invoice" className="home-btn">
          Create Invoice
        </Link>

        <Link href="/reports" className="home-btn">
          Reports
        </Link>
      </div>
    </div>
  );
}

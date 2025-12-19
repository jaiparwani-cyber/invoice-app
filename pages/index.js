import Link from 'next/link';

export default function Home() {
  return (
    <div className="home">
      <h1>Vinay Traders</h1>

      <div className="home-buttons">
        <Link href="/invoice" className="home-btn">
          Create Invoice
        </Link>

        <Link href="/reports" className="home-btn">
          Reports
        </Link>

        <Link href="/owner" className="home-btn">
  Owner
</Link>

      </div>
    </div>
  );
}

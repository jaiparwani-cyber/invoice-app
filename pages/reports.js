import { useEffect, useState } from 'react';


export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [data, setData] = useState([]);
  const [customerId, setCustomerId] = useState('all');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, []);

  const load = async () => {
    const res = await fetch(
      `/api/reports?customerId=${customerId}&startDate=${start}&endDate=${end}`
    );
    setData(await res.json());
  };

  return (
    <>
      <select onChange={e => setCustomerId(e.target.value)}>
        <option value="all">All Customers</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input type="date" onChange={e => setStart(e.target.value)} />
      <input type="date" onChange={e => setEnd(e.target.value)} />

      <button onClick={load}>Generate</button>
      <button
        onClick={() =>
          window.location.href =
            `/api/reports/export?startDate=${start}&endDate=${end}`
        }
      >
        Download Excel
      </button>

      <table>
  <thead>
    <tr>
      <th>Customer</th>
      <th>Item</th>
      <th>Rate</th>
      <th>Qty</th>
      <th>Amount</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {data.map((row, i) => (
      <tr key={i}>
        <td>{row.customer}</td>
        <td>{row.itemName}</td>
        <td>{row.rate}</td>
        <td>{row.quantity}</td>
        <td>{row.item}</td>
<td>{new Date(row.invoiceDate).toLocaleDateString()}</td>
 
      </tr>
    ))}
  </tbody>
</table>

    </>
  );
}

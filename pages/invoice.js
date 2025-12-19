import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Invoice() {
  const router = useRouter();

  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);

  const [items, setItems] = useState([
    { item: '', rate: '', quantity: '' }
  ]);
  const [itemMaster, setItemMaster] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers
  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  // Fetch item master
  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(setItemMaster);
  }, []);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { item: '', rate: '', quantity: '' }]);
  };

  const submit = async () => {
    if (!customerId) {
      alert('Select customer');
      return;
    }

    if (items.some(i => !i.item || !i.quantity)) {
      alert('Fill all item rows');
      return;
    }

    setLoading(true);

    const selectedCustomer = customers.find(
      c => c.id === Number(customerId)
    );

    const res = await fetch('/api/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: selectedCustomer.name,
        items
      })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    a.click();

    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <div className="container">
      <h2>Create Invoice</h2>

      {/* CUSTOMER DROPDOWN */}
      <select
        value={customerId}
        onChange={e => setCustomerId(e.target.value)}
      >
        <option value="">Select Customer</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Rate</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={idx}>
              <td>
                <select
                  value={row.item}
                  onChange={e => {
                    const selected = itemMaster.find(
                      it => it.name === e.target.value
                    );
                    updateItem(idx, 'item', selected.name);
                    updateItem(idx, 'rate', selected.rate);
                  }}
                >
                  <option value="">Select Item</option>
                  {itemMaster.map(it => (
                    <option key={it.id} value={it.name}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input value={row.rate} readOnly />
              </td>

              <td>
                <input
                  type="number"
                  value={row.quantity}
                  onChange={e =>
                    updateItem(idx, 'quantity', e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow}>+ Add Item</button>

      <br /><br />

      <button onClick={submit} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Invoice'}
      </button>
    </div>
  );
}

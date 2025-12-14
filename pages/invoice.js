import { useState } from 'react';

export default function Invoice() {
  const [name, setName] = useState('');
  const [items, setItems] = useState([
    { item: '', rate: '', quantity: '' }
  ]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { item: '', rate: '', quantity: '' }]);
  };

  const submit = async () => {
    const res = await fetch('/api/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, items })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>Create Invoice</h2>

      <input
        placeholder="Customer Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      {items.map((row, idx) => (
        <div key={idx}>
          <input
            placeholder="Item"
            value={row.item}
            onChange={e => updateItem(idx, 'item', e.target.value)}
          />
          <input
            placeholder="Rate"
            type="number"
            value={row.rate}
            onChange={e => updateItem(idx, 'rate', e.target.value)}
          />
          <input
            placeholder="Qty"
            type="number"
            value={row.quantity}
            onChange={e => updateItem(idx, 'quantity', e.target.value)}
          />
        </div>
      ))}

      <button onClick={addRow}>+</button>
      <button onClick={submit}>Generate Invoice</button>
    </>
  );
}

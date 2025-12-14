import { useState } from 'react';

export default function Invoice() {
  const [name, setName] = useState('');
  const [items, setItems] = useState([{ item: '', rate: '', quantity: '' }]);

  const addRow = () =>
    setItems([...items, { item: '', rate: '', quantity: '' }]);

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
      <input placeholder="Customer Name" onChange={e => setName(e.target.value)} />
      {items.map((i, idx) => (
        <div key={idx}>
          <input placeholder="Item" onChange={e => i.item = e.target.value} />
          <input placeholder="Rate" onChange={e => i.rate = e.target.value} />
          <input placeholder="Qty" onChange={e => i.quantity = e.target.value} />
        </div>
      ))}
      <button onClick={addRow}>+</button>
      <button onClick={submit}>Generate Invoice</button>
    </>
  );
}

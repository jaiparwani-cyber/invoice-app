import { useState } from 'react';

export default function OwnerPanel() {
  const [customer, setCustomer] = useState('');
  const [item, setItem] = useState('');
  const [rate, setRate] = useState('');

  const addCustomer = async () => {
    if (!customer.trim()) return;

    await fetch('/api/owner/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: customer })
    });

    alert('Customer added');
    setCustomer(''); // ✅ clear field
  };

  const addItem = async () => {
    if (!item.trim() || !rate) return;

    await fetch('/api/owner/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item, rate })
    });

    alert('Item added');
    setItem('');  // ✅ clear field
    setRate('');  // ✅ clear field
  };

  return (
    <div className="container">
      <h2>Owner Panel</h2>

      <h3>Add Customer</h3>
      <input
        value={customer}
        onChange={e => setCustomer(e.target.value)}
      />
      <button onClick={addCustomer}>Add Customer</button>

      <h3>Add Item</h3>
      <input
        placeholder="Item Name"
        value={item}
        onChange={e => setItem(e.target.value)}
      />
      <input
        placeholder="Rate"
        type="number"
        value={rate}
        onChange={e => setRate(e.target.value)}
      />
      <button onClick={addItem}>Add Item</button>
    </div>
  );
}

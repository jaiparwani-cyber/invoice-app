import { useState } from 'react';

export default function OwnerPanel() {
  const [customer, setCustomer] = useState('');
  const [item, setItem] = useState('');
  const [rate, setRate] = useState('');

  const addCustomer = async () => {
    await fetch('/api/owner/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: customer })
    });
    alert('Customer added');
  };

  const addItem = async () => {
    await fetch('/api/owner/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item, rate })
    });
    alert('Item added');
  };

  return (
    <div className="container">
      <h2>Owner Panel</h2>

      <h3>Add Customer</h3>
      <input onChange={e => setCustomer(e.target.value)} />
      <button onClick={addCustomer}>Add Customer</button>

      <h3>Add Item</h3>
      <input placeholder="Item Name" onChange={e => setItem(e.target.value)} />
      <input placeholder="Rate" type="number" onChange={e => setRate(e.target.value)} />
      <button onClick={addItem}>Add Item</button>
    </div>
  );
}

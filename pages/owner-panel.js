import { useEffect, useState } from 'react';

export default function OwnerPanel() {
  const [customer, setCustomer] = useState('');
  const [item, setItem] = useState('');
  const [rate, setRate] = useState('');

  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newRate, setNewRate] = useState('');

  /* ======================
     LOAD ITEMS
  ====================== */

  const loadItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  /* ======================
     ADD CUSTOMER
  ====================== */

  const addCustomer = async () => {
    if (!customer.trim()) return;

    await fetch('/api/owner/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: customer })
    });

    alert('Customer added');
    setCustomer('');
  };

  /* ======================
     ADD ITEM
  ====================== */

  const addItem = async () => {
    if (!item.trim() || !rate) return;

    await fetch('/api/owner/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item, rate })
    });

    alert('Item added');
    setItem('');
    setRate('');
    loadItems();
  };

  /* ======================
     UPDATE ITEM RATE
  ====================== */

  const updateRate = async () => {
    if (!selectedItemId || !newRate) return;

    await fetch('/api/owner/item/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedItemId,
        rate: newRate
      })
    });

    alert('Rate updated');
    setSelectedItemId('');
    setNewRate('');
    loadItems();
  };

  /* ======================
     DELETE ITEM
  ====================== */

  const deleteItem = async () => {
    if (!selectedItemId) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    await fetch(`/api/owner/item/delete?id=${selectedItemId}`, {
      method: 'DELETE'
    });

    alert('Item deleted');
    setSelectedItemId('');
    loadItems();
  };

  return (
    <div className="container">
      <h2>Owner Panel</h2>

      {/* ADD CUSTOMER */}
      <h3>Add Customer</h3>
      <input
        placeholder="Customer Name"
        value={customer}
        onChange={e => setCustomer(e.target.value)}
      />
      <button onClick={addCustomer}>Add Customer</button>

      <hr />

      {/* ADD ITEM */}
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

      <hr />

      {/* UPDATE / DELETE ITEM */}
      <h3>Update / Delete Item</h3>

      <select
        value={selectedItemId}
        onChange={e => setSelectedItemId(e.target.value)}
      >
        <option value="">Select Item</option>
        {items.map(it => (
          <option key={it.id} value={it.id}>
            {it.name} (₹{it.rate})
          </option>
        ))}
      </select>

      <br /><br />

      <input
        placeholder="New Rate"
        type="number"
        value={newRate}
        onChange={e => setNewRate(e.target.value)}
      />

      <button onClick={updateRate}>Update Rate</button>

      <button
        onClick={deleteItem}
        style={{ background: '#b91c1c', marginLeft: 10 }}
      >
        Delete Item
      </button>
    </div>
  );
}

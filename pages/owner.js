import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Owner() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async () => {
    const res = await fetch('/api/owner/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) router.push('/owner-panel');
    else alert('Wrong password');
  };

  return (
    <div className="container">
      <h2>Owner Login</h2>
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}

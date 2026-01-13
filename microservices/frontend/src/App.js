import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/users`).then(res => setUsers(res.data)).catch(() => setUsers([]));
    axios.get(`${API_BASE}/products`).then(res => setProducts(res.data)).catch(() => setProducts([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Order Management</h1>
      <h2>Users</h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>
      <h2>Products</h2>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}


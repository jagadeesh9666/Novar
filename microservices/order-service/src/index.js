const express = require('express');
const axios = require('axios');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 4003;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('ok'));

app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items } = req.body; // items: [{productId, quantity}]
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    // Validate user
    await axios.get(`${USER_SERVICE_URL}/api/users`);

    // Fetch products and compute total
    const { data: products } = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`);
    const priceMap = new Map(products.map(p => [p.id, Number(p.price)]));

    let total = 0;
    for (const it of items) {
      const price = priceMap.get(it.productId);
      if (!price) return res.status(400).json({ error: 'invalid_product', productId: it.productId });
      total += price * it.quantity;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [orderRes] = await conn.query(
        'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
        [userId, total, 'PENDING']
      );
      const orderId = orderRes.insertId;

      for (const it of items) {
        const price = priceMap.get(it.productId);
        await conn.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, it.productId, it.quantity, price]
        );
      }

      await conn.commit();
      res.status(201).json({ id: orderId, total, status: 'PENDING' });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    res.status(500).json({ error: 'order_failed', detail: e.message });
  }
});

app.listen(port, () => console.log(`Order service on ${port}`));


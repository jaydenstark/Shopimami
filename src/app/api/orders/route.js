import pool from '../../../lib/db';

// GET: Fetch all orders with their items
export async function GET() {
  try {
    const sql = `
      SELECT 
        o.id, o.status, o.customer_name as "customerName", o.phone, o.location, 
        o.mall_name as "mallName", o.store_name as "storeName", 
        o.subtotal, o.delivery_fee as "deliveryFee", o.service_fee as "serviceFee", 
        o.total, o.momo_provider as "momoProvider", o.shopper, o.rider, 
        o.flagged, o.flag_note as "flagNote", o.created_at as "createdAt",
        i.name as item_name, i.price as item_price, i.quantity as item_quantity, i.picked as item_picked
      FROM orders o
      LEFT JOIN order_items i ON o.id = i.order_id
      ORDER BY o.created_at ASC
    `;
    const res = await pool.query(sql);
    
    const ordersMap = {};
    for (const row of res.rows) {
      if (!ordersMap[row.id]) {
        ordersMap[row.id] = {
          id: row.id,
          status: row.status,
          customerName: row.customerName,
          phone: row.phone,
          location: row.location,
          mallName: row.mallName,
          storeName: row.storeName,
          subtotal: parseFloat(row.subtotal),
          deliveryFee: parseFloat(row.deliveryFee),
          serviceFee: parseFloat(row.serviceFee),
          total: parseFloat(row.total),
          momoProvider: row.momoProvider,
          shopper: row.shopper || '',
          rider: row.rider || '',
          flagged: row.flagged,
          flagNote: row.flagNote || '',
          createdAt: row.createdAt,
          items: []
        };
      }
      if (row.item_name) {
        ordersMap[row.id].items.push({
          name: row.item_name,
          price: parseFloat(row.item_price),
          quantity: parseInt(row.item_quantity, 10),
          picked: row.item_picked
        });
      }
    }
    
    const ordersList = Object.values(ordersMap).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    return Response.json(ordersList);
  } catch (error) {
    console.error("API GET orders error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Place a new order
export async function POST(request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    
    await client.query('BEGIN');
    
    await client.query(
      `INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
      [
        body.id, 
        body.status, 
        body.customerName, 
        body.phone, 
        body.location,
        body.mallName, 
        body.storeName, 
        body.subtotal, 
        body.deliveryFee,
        body.serviceFee, 
        body.total, 
        body.momoProvider, 
        body.shopper || '',
        body.rider || '', 
        body.flagged || false, 
        body.flagNote || ''
      ]
    );
    
    for (const item of body.items) {
      await client.query(
        `INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES ($1, $2, $3, $4, $5)`,
        [body.id, item.name, item.price, item.quantity, item.picked || false]
      );
    }
    
    await client.query('COMMIT');
    return Response.json({ success: true, id: body.id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("API POST order error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// PUT: Update an order operational state
export async function PUT(request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    
    await client.query('BEGIN');
    
    await client.query(
      `UPDATE orders SET 
         status = $1, 
         shopper = $2, 
         rider = $3, 
         flagged = $4, 
         flag_note = $5 
       WHERE id = $6`,
      [
        body.status, 
        body.shopper || '', 
        body.rider || '', 
        body.flagged, 
        body.flagNote || '', 
        body.id
      ]
    );
    
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        await client.query(
          `UPDATE order_items SET picked = $1 WHERE order_id = $2 AND name = $3`,
          [item.picked, body.id, item.name]
        );
      }
    }
    
    await client.query('COMMIT');
    return Response.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("API PUT order error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

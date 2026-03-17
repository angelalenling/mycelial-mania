const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const data = require('./data.js');
const app = express();
const PORT = 4131;
const PRODUCTS = new Set(['Mica Caps Mycelia Kit','Turkey Tail Mycelia Kit','Penny Bun Mycelia Kit','Shiitake Mycelia Kit','Signature Substrate','Growing Container','Harvesting Tool Kit']);
const SHIPPING_METHODS = new Set(['Flat Rate','Ground','Expedited']);
// let orders = [
//     {
//         'id': 0,
//         'status': 'Placed',
//         'cost': 20.00,
//         'from': 'Micheal Capsy',
//         'address': 'Micheal Capsy\n1111 Mushroom Main\nMossy MA 11111',
//         'product': 'Mica Caps Mycelia Kit',
//         'quantity': 1,
//         'notes': 'Gift receipt requested',
//         'shipping': 'Flat Rate',
//         'order_date': '2025-10-10 15:30:00',
//     },
//     {
//         'id': 1,
//         'status': 'Shipped',
//         'cost': 30.00,
//         'from': 'Turkey Tailson',
//         'address': 'Turkey Tailson\n2222 Toadstool Trail\nTruffle TN 22222',
//         'product': 'Turkey Tail Mycelia Kit',
//         'quantity': 1,
//         'notes': 'Shipping expedited',
//         'shipping': 'Expedited',
//         'order_date': '2025-10-09 10:30:00',
//     },
//     {
//         'id': 2,
//         'status': 'Delivered',
//         'cost': 40.00,
//         'from': 'Porcini Portobello',
//         'address': 'Porcini Portobello\n3333 Puffball Place\nPorus PA 33333',
//         'product': 'Penny Bun Mycelia Kit',
//         'quantity': 1,
//         'notes': 'Package left at back door',
//         'shipping': 'Ground',
//         'order_date': '2025-10-08 08:30:00',
//     },
//     {
//         'id': 3,
//         'status': 'Placed',
//         'cost': 50.00,
//         'from': 'Shaggy Mann',
//         'address': 'Shaggy Mann\n4444 Spore Street\nShiitake SD 44444',
//         'product': 'Shiitake Mycelia Kit',
//         'quantity': 1,
//         'notes': 'Customer requested expedited shipping',
//         'shipping': 'Expedited',
//         'order_date': '2025-10-07 07:30:00',
//     }
// ];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/css', express.static(path.join(__dirname, 'resources/css')));
app.use('/js', express.static(path.join(__dirname, 'resources/js')));
app.use('/images', express.static(path.join(__dirname, 'resources/images')));
// https://expressjs.com/en/guide/using-middleware.html for middleware function help
app.use(function(req, res, next) {
  const method = req.method;
  const url = req.originalUrl;
  res.on('finish', function() {
    const statusCode = res.statusCode;
    // "The one output line must contain the requested method, the requested URL,
    //  the status code sent back, and some basic information about server variables such as how many orders there are.""
    console.log(method + ' ' + url + ' ' + statusCode);
  });
  next();
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));

// // helper functions from HW4 server translated to JS with help of https://studylib.net/doc/27507991/python-to-javascript-guide--1-
// function addNewOrder(data) {
//   const required = ['from_name', 'address', 'product', 'quantity', 'shipping'];
//   for (let i = 0; i < required.length; i++) {
//     const field = required[i];
//     if (!(field in data)) {
//       return null;
//     }
//     const value = data[field];
//     if (typeof value === 'string') {
//       if (value.trim() === '') {
//         return null;
//       }
//     } else if (value == null) {
//       return null;
//     }
//   }

//   if (!PRODUCTS.has(data.product)) {
//     return null;
//   }

//   let quantity;
//   try {
//     quantity = parseInt(data.quantity, 10);
//   } catch (e) {
//     return null;
//   }
//   if (!Number.isFinite(quantity) || quantity <= 0) {
//     return null;
//   }

//   let cost = 0.0;
//   if (data.cost !== undefined) {
//     const parsed = parseFloat(data.cost);
//     if (!Number.isNaN(parsed) && parsed >= 0) {
//       cost = parsed;
//     }
//   }

//   let maxId = -1;
//   for (let i = 0; i < orders.length; i++) {
//     const oid = orders[i].id;
//     if (typeof oid === 'number' && oid > maxId) {
//       maxId = oid;
//     }
//   }
//   const newId = maxId + 1;
//   const now = new Date();
//   const orderDate = data.order_date || now.toISOString().slice(0, 19).replace('T', ' ');

//   const newOrder = {
//     id: newId,
//     status: 'Placed',
//     cost: cost,
//     from: data.from_name,
//     address: data.address,
//     product: data.product,
//     quantity: quantity,
//     shipping: data.shipping,
//     order_date: orderDate,
//     notes: data.notes || ''
//   };

//   orders.push(newOrder);
//   return newId;
// }

app.get('/', (req, res) => {
  res.render('about', { title: 'Mycelial Mania' });
});
app.get('/about', (req, res) => {
  res.render('about', { title: 'Mycelial Mania' });
});

app.get('/order', (req, res) => {
  const customerName = req.cookies.customer_name || '';
  res.render('order', {
    title: 'Place Order',
    customerName: customerName
  });
});

app.get('/admin/orders', async (req, res) => {
  const statuses = ['all', 'placed', 'shipped', 'delivered', 'cancelled'];
  const queryText = (req.query.query || '').toLowerCase();
  const statusFilter = (req.query.status || 'all').trim().toLowerCase();

  if (!statuses.includes(statusFilter)) {
    return res.status(400).render('404', {
      title: 'Bad Request'});
  } 
  try {
    await data.updateOrderStatuses();
    const ordersDB = await data.getOrders(queryText, statusFilter);
    const displayOrders = ordersDB.map(ord => {
      const numericCost = Number(ord.cost);
      let costText;
      if (Number.isFinite(numericCost)) {
        costText = `$${numericCost.toFixed(2)}`;
      } else {
        costText = '$0.00';
      }
      return {
        id: ord.id,
        status: ord.status,
        costText: costText,
        from: ord.from,
        address: ord.address,
        product: ord.product,
        notes: ord.notes || ''
      };
    });
    res.render('admin_orders', {
      title: 'Admin Orders',
      orders: displayOrders,
      statuses: statuses,
      statusFilter: statusFilter,
      queryText: queryText
    });
  } catch (err) {
    console.error('Error getting orders:', err);
    res.status(500).render('404', {
      title: 'Server Error'
    });
  }
});

app.get('/tracking/:id', async (req, res) => {
  const idString = req.params.id;
  const id = parseInt(idString, 10);
  if (Number.isNaN(id)) {
    return  res.status(404).render('404', { title: '404 - Page Not Found' });
  }
  try {
    await data.updateOrderStatuses();
    const order = await data.getOrder(id);
    if (!order) {
      return res.status(404).render('404', { title: '404 - Page Not Found' });
    }
    const numericCost = Number(order.cost);
    let costText = '$0.00';
    if (Number.isFinite(numericCost)) {
      costText = `$${numericCost.toFixed(2)}`;
    }
    const shippingMessage = `Your order has been ${String(order.status || '').toLowerCase()}!`;
    let orderDateStr;
    if (order.order_date instanceof Date) {
      orderDateStr = order.order_date.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      orderDateStr = String(order.order_date);
    }
    res.render('tracking', {
      title: 'Order Tracking',
      order: {
        id: order.id,
        status: order.status,
        product: order.product,
        costText: costText,
        order_date: orderDateStr,
        from: order.from,
        address: order.address,
        quantity: order.quantity,
        notes: order.notes || '',
        shipping: order.shipping
      },
      shippingMessage: shippingMessage
    });
  } catch (err) {
    console.error('Error getting order:', err);
    res.status(500).render('404', { title: 'Server Error' });
  }
});

app.get('/api/order/:id/history/', async (req, res) => {
  const idString = req.params.id;
  const id = parseInt(idString, 10);
  if (Number.isNaN(id)) {
    return res.status(404).json({ error: 'Invalid order ID' });
  }
  try {
    const history = await data.getOrderHistory(id);
    return res.json({ history: history });
  } catch (err) {
    console.error('Error getting order history:', err);
    return res.status(500).json({ error: 'Server error retrieving order history' });
  }
});

app.post('/api/order', async (req, res) => {
  const contentType = req.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).json({ status: 'error', errors: ['Content-Type missing'] });
  }
  const dataBody = req.body || {};
  const errors = [];
  const product = dataBody.product || '';
  const from_name = dataBody.from_name;
  const quantityRaw = dataBody.quantity;
  const address = dataBody.address || '';
  const shipping = dataBody.shipping || '';
  if (typeof from_name === 'string' && from_name.length > 64) {
    return res.status(413).json({ status: 'error', errors: ['From_name too long'] });
  }
  if (dataBody.product == null) errors.push('Product missing');
  if (from_name == null) errors.push('From_name missing');
  if (quantityRaw == null) errors.push('Quantity missing');
  if (address == null) errors.push('Address missing');
  if (shipping == null) errors.push('Shipping missing');

  let quantity;
  try {
    quantity = parseInt(quantityRaw, 10);
  } catch (e) {
    quantity = NaN;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push('Quantity must be a positive integer');
  }
  if (!SHIPPING_METHODS.has(shipping)) {
    errors.push('Invalid shipping method');
  }
  if (!PRODUCTS.has(product)) {
    errors.push('Invalid product');
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', errors: errors });
  }
  let cost = 0.0;
  if (dataBody.cost !== undefined) {
    const parsed = parseFloat(dataBody.cost);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      cost = parsed;
    }
  }

  const now = new Date();
  const orderDate = dataBody.order_date || now.toISOString().slice(0, 19).replace('T', ' ');
  let newOrderId;
  try {
    newOrderId = await data.addOrder({
      from_name,
      address,
      product,
      quantity,
      shipping,
      cost,
      notes: dataBody.notes || '',
      order_date: orderDate
    });
  } catch (err) {
    console.error('Error inserting order:', err);
    return res.status(500).json({ status: 'error', errors: ['Server error placing order'] });
  }
  const remember_me = !!dataBody.remember;
  let cookieName;
  if (typeof from_name === 'string') {
    cookieName = from_name;
  } else {
    cookieName = '';
  }
  if (remember_me) {
    res.cookie('customer_name', cookieName, { path: '/', sameSite: 'lax' });
  } else {
    res.clearCookie('customer_name', { path: '/' });
  }

  return res.status(201).json({ status: 'success', order_id: newOrderId });
});


app.post('/update_shipping', async (req, res) => {
  const idString = (req.body.id || '').trim();
  const address = (req.body.address || '').trim();
  const shipping = (req.body.shipping || '').trim();
  const shippingMethods = new Set(['Flat Rate', 'Ground', 'Expedited']);
  // https://post.bytes.com/forum/topic/javascript/119644-what-does-this-mean-d-test-el-value for id validation !/^\d+$/.test
  if (!idString || !/^\d+$/.test(idString) || !address || !shipping || !shippingMethods.has(shipping) || address.length >= 1024) {
    return res.status(400).render('order_fail', { title: 'Order Failed' });
  }
  const id = parseInt(idString, 10);
  try {
    const order = await data.getOrder(id);
    if (!order) {
      return res.status(404).render('order_fail', { title: 'Order Failed' });
    }
    const lowercaseStatus = String(order.status || '').toLowerCase();
    if (lowercaseStatus === 'cancelled' || lowercaseStatus === 'shipped' || lowercaseStatus === 'delivered') {
      return res.status(400).render('order_fail', { title: 'Order Failed' });
    }
    await data.updateOrder(id, shipping, address);
    return res.redirect(`/tracking/${id}`);
  } catch (err) {
    console.error('Error updating order:', err);
    return res.status(500).render('order_fail', { title: 'Order Failed' });
  }
});

app.delete('/api/cancel_order', async (req, res) => {
  const contentType = req.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).type('text/plain').send('');
  }
  const body = req.body || {};
  const str_id = body.order_id;
  let orderId;
  if (typeof str_id === 'number' && Number.isFinite(str_id)) {
    orderId = str_id;
  } else if (typeof str_id === 'string' && /^\d+$/.test(str_id)) {
    orderId = parseInt(str_id, 10);
  } else {
    return res.status(400).type('text/plain').send('');
  }
  try {
    const order = await data.getOrder(orderId);
    if (!order) {
      return res.status(404).type('text/plain').send('');
    }
    const lowercaseStatus = String(order.status || '').toLowerCase();
    if (lowercaseStatus === 'cancelled' || lowercaseStatus === 'shipped' || lowercaseStatus === 'delivered') {
      return res.status(400).type('text/plain').send('');
    }
    const success =  await data.cancelOrder(orderId);
    if (!success) {
      return res.status(400).type('text/plain').send('');
    }
    return res.status(204).type('text/plain').send('');
  } catch (err) {
    console.error('Error cancelling order:', err);
    return res.status(500).type('text/plain').send('');
  }
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

app.listen(PORT, () => {
    console.log(`Starting server on http://localhost:${PORT}`);
});